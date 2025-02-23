# TinyGoodies Mail Merge

This is a proof-of-concept quality yet functioning mail merge Node.js application that works with any SMTP server accepting external connections. It is useful when you need to send "mail merged" emails to multiple recipients from your own address, but aren't using Microsoft Outlook/Word or Gmail with a 3rd party service.

This app sends emails through your own "regular" SMTP server so keep that in mind. Meaning that you probably shouldn't use it for actual **bulk** mailing but rather for occasional use-cases when you need to send a number of similar yet personalized emails to your recipients.

## Pre-requisites

You need to have access to an SMTP server via, well, SMTP. Good news that you can likely get this information from your email provider. If not provided explicitly on a dedicated page, it can usually be found on pages with instructions on how to setup third party email clients, like Thunderbird. You will also likely need to get or generate an app password that you will use to connect to the server here.

## Setup

### Install

Clone this repository and run:

```bash
pnpm install
```

### SMTP server configuration

Create a `.env` file in the root directory of the cloned project and add SMTP server configuration to it:

```bash
TGMM_SMTP_HOST=<your SMTP host>
TGMM_SMTP_PORT=465
TGMM_SMTP_SECURE=true
TGMM_SMTP_USER=<your user name>
TGMM_SMTP_PASSWORD=<password or app password>
```

### Mail merge configuration

Next create TinyGoodies Mail Merge configuration file `tgmmconfig.json`. You can start by copying the supplied `tgmmconfig-sample.json`

```json
{
  "fromEmail": "John <john.random@somerandomdomain.mail>",
  "emailField": "Email",
  "subjectTemplate": "Your new license key, {{ ['First name'] }}!",
  "bodyTemplateFile": "template.txt",
  "htmlBodyTemplateFile": "template.html"
}
```

Edit the fields according to your needs.

- `emailField` is the column name for the recipients email in your CSV data file.
- `subjectTemplate` is a [Liquid](https://liquidjs.com/) template. See details below in the [Templates](#templates) section.

### Data file

Your CSV data file is expected to be `data.csv`. It should have the first row as headers.

### Templates

You can provide one or two template files for the email body.

- `bodyTemplateFile` (defaults to `template.txt`) is a plain-text email body template and is required.
- `htmlBodyTemplateFile` is optional and, as the name suggests, it's for the HTML version of the email body.

TinyGoodies Mail Merge is using [Liquid](https://liquidjs.com/) template engine.

Liquid is powerful beyond our needs here. Most likely the only thing you need to know is that you place field names from your data file between double curly braces ala `{{ FieldName }}`. If your field name contains spaces or other special characters place it in the square brackets with quotes, like you see above. Having said that, if you need something more advanced (like unifying casing of some text field, for example), check out [Liquid's documentation](https://liquidjs.com/tutorials/intro-to-liquid.html).

## Usage

Now that you have everything setup, it's a good idea to do a dry run before sending.

### Dry run

```bash
pnpm run dry
```

This will output all mail merged emails into the console, but won't send the actual emails.

### Sending emails

If everything looks good after the dry run, it's time to send the emails...

```bash
pnpm run send
```

## License

TinyGoodies Mail Merge is released under the [MIT license](./LICENSE).

## Credits

TinyGoodies Mail Merge is developed and maintained by Alan Mendelevich aka @ailon. It relies on these awesome open source libraries:

- [Fast-CSV](https://c2fo.github.io/fast-csv/) for CSV parsing.
- [Nodemailer](https://nodemailer.com/) for sending emails.
- [LiquidJS](https://liquidjs.com/) for templating.
