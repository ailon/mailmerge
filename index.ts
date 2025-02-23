import { parseFile } from "@fast-csv/parse";
import * as fs from "fs";
import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface Config {
  fromEmail: string;
  emailField: string;
}

const config: Config = JSON.parse(fs.readFileSync("tgmmconfig.json", "utf8"));

parseFile("data.csv", { headers: true })
  .on("error", (error) => console.error(error))
  .on("data", (row) => mail(row))
  .on("end", (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

const transporter = nodemailer.createTransport({
  host: process.env.TGMM_SMTP_HOST,
  port: parseInt(process.env.TGMM_SMTP_PORT ?? "465"),
  secure: process.env.TGMM_SMTP_SECURE === "true",
  auth: {
    user: process.env.TGMM_SMTP_USER,
    pass: process.env.TGMM_SMTP_PASSWORD,
  },
});

async function mail(row: any) {
  try {
    const info = await transporter.sendMail({
      from: process.env.TGMM_FROM,
      to: row[config.emailField],
      subject: "Hello ✔",
      text: "Hello world?", // plain text body
      //html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Send failed: %s", error);
  }
}
