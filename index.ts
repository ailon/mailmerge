import { parseFile } from "@fast-csv/parse";
import * as fs from "fs";
import * as nodemailer from "nodemailer";
import { Liquid } from "liquidjs";

import dotenv from "dotenv";
dotenv.config();

interface Config {
  fromEmail: string;
  emailField: string;
  subjectTemplate: string;
  bodyTemplateFile: string;
  htmlBodyTemplateFile?: string;
}

interface Email {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

const args = process.argv.slice(2);

let dryRun = false;
if (args.length > 0 && args[0] === "--dry") {
  dryRun = true;
  console.log(
    "Running in dry mode. No emails will be sent. Outputting to console instead.\n\n"
  );
}

const config: Config = JSON.parse(fs.readFileSync("tgmmconfig.json", "utf8"));

// mailer
const transporter = nodemailer.createTransport({
  host: process.env.TGMM_SMTP_HOST,
  port: parseInt(process.env.TGMM_SMTP_PORT ?? "465"),
  secure: process.env.TGMM_SMTP_SECURE === "true",
  auth: {
    user: process.env.TGMM_SMTP_USER,
    pass: process.env.TGMM_SMTP_PASSWORD,
  },
});

async function send(email: Email) {
  try {
    console.log("Sending email to %s", email.to);

    const info = await transporter.sendMail({
      from: config.fromEmail,
      to: email.to,
      subject: email.subject,
      text: email.bodyText, // plain text body
      html: email.bodyHtml, // html body
    });

    console.log(`Message to ${email.to} sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Send to ${email.to} failed: ${error}`);
  }
}

// templating
const liquid = new Liquid();
const subjectTemplate = liquid.parse(config.subjectTemplate);
const bodyTemplate = liquid.parse(
  fs.readFileSync(config.bodyTemplateFile, "utf8")
);
const bodyTemplateHtml = config.htmlBodyTemplateFile
  ? liquid.parse(fs.readFileSync(config.htmlBodyTemplateFile, "utf8"))
  : undefined;

async function prepareEmail(row: any): Promise<Email> {
  const subject = await liquid.render(subjectTemplate, row);
  const bodyText = await liquid.render(bodyTemplate, row);
  const bodyHtml = bodyTemplateHtml
    ? await liquid.render(bodyTemplateHtml, row)
    : undefined;

  return {
    to: row[config.emailField],
    subject: subject,
    bodyText: bodyText,
    bodyHtml: bodyHtml,
  };
}

// process single email
async function processEmail(row: any) {
  const email = await prepareEmail(row);
  if (dryRun) {
    console.log("Email to %s", email.to);
    console.log("Subject: %s", email.subject);
    console.log("Body:\n\n%s\n\n", email.bodyText);
    if (email.bodyHtml) {
      console.log("HTML:\n\n%s\n\n", email.bodyHtml);
    }
    console.log("----");
  } else {
    await send(email);
  }
}

// data
parseFile("data.csv", { headers: true })
  .on("error", (error) => console.error(error))
  .on("data", (row) => processEmail(row))
  .on("end", (rowCount: number) =>
    console.log(`Parsed ${rowCount} rows total.`)
  );
