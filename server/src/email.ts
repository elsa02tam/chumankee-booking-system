import { HttpError } from "./error";
import { DAY } from "@beenotung/tslib/time";
import { later } from "@beenotung/tslib/async/wait";
import { filter, find } from "better-sqlite3-proxy";
import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { sendRemindBookingEmails } from "./email-template/remind-booking";
import { env } from "./env";
import { formatDate, formatTime } from "./format";
import { proxy, TServiceBooking, TUser } from "./proxy";

export type Email = {
  to_email: string[] | string;
  cc_email?: string[] | string;
  subject: string;
  html: string;
};

const transporter: Transporter = createTransport({
  host: env.EMAIL_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: env.EMAIL_ADDRESS,
    pass: env.EMAIL_PASSWORD,
  },
});

let sendEmailQueue = Promise.resolve(0);

export async function sendEmail(email: Email) {
  let options: Mail.Options = {
    from: `${env.COMPANY_NAME} <${env.EMAIL_ADDRESS}>`,
    to: email.to_email,
    cc: email.cc_email,
    subject: email.subject,
    html: email.html,
  };
  if (env.SKIP_EMAIL === "skip") {
    console.log("skip email:", options);
    return;
  }
  console.log("sendEmail:", email);
  sendEmailQueue = sendEmailQueue
    .catch((err) => err)
    .then(() => transporter.sendMail(options));
  await sendEmailQueue;
}

export async function sendEmails(emails: Email[]) {
  for (let email of emails) {
    await sendEmail(email);
  }
}

export function createBookingNoticeEmail(input: {
  booking: TServiceBooking;
  receiver: TUser[] | TUser;
  cc_email?: string[] | string;
  title: string;
  opening_paragraph: string;
  additional_paragraph: string;
}): Email {
  let { booking } = input;

  let subject = input.title;
  if (!subject.endsWith(env.COMPANY_NAME)) {
    subject += " at " + env.COMPANY_NAME;
  }

  let opening = autoParagraph(input.opening_paragraph);

  let additional = autoParagraph(input.additional_paragraph);

  let receiver = Array.isArray(input.receiver)
    ? input.receiver
    : [input.receiver];

  let receiverName: string = receiver
    .map((receiver) => receiver.username)
    .join(" & ");

  let to_email = receiver.map((receiver) => receiver.email);

  let variables = {
    receiverName,
    opening,
    bookingSummary: createBookingSummary(booking),
    additional,
    COMPANY_NAME: env.COMPANY_NAME,
    COMPANY_PHONE: env.COMPANY_PHONE,
    EMAIL_ADDRESS: env.EMAIL_ADDRESS,
  };
  let html = getEmailTemplate("overall structure", variables);

  return {
    to_email,
    cc_email: input.cc_email,
    subject,
    html,
  };
}

export function getEmailTemplate(
  name: string,
  variables: Record<string, string | null>
) {
  let template = find(proxy.t_email_template, { name_en: name });
  if (!template)
    throw new HttpError(500, "Failed to find email template, name: " + name);
  if (
    Object.keys(variables).sort().join(",") !=
    template.variables.split(",").sort().join(",")
  ) {
    throw new HttpError(
      500,
      "email template variables not matched, template name: " + name
    );
  }
  let content = template.content || template.default_content;
  for (let key in variables) {
    let value = variables[key] || "(none)";
    content = content.replace(`{${key}}`, value);
  }
  return content;
}

function createBookingSummary(booking: TServiceBooking) {
  let provider = booking.provider!;
  let client = booking.user!;
  let service = booking.service!;

  let dateText = formatDate(booking.from_time);

  let timeText =
    formatTime(booking.from_time) + " - " + formatTime(booking.to_time);

  let customerTitle = getCustomerTitle(booking);

  let detail_href = `${env.FRONTEND_ORIGIN}/consumer/booking/booking-details/${booking.id}`;

  //email editing STEP 1
  //compared to seed.ts variables with name 'booking summary'
  let variables = {
    dateText,
    timeText,
    service_name: service.name,
    provider_username: provider.username,
    provider_phone: provider.phone,
    customer_title: customerTitle,
    client_username: client.username,
    client_phone: client.phone,
    booking_detail_link: /* html */ `<a href="${detail_href}">${detail_href}</a>`,
  };

  let content = getEmailTemplate("booking summary", variables);

  return content.trim();
}

export function getCustomerTitle(booking: TServiceBooking) {
  return booking.user?.is_vip ? "VIP Customer" : "Customer";
}

export function autoParagraph(html: string): string {
  html = html.trim();
  if (html.startsWith("<p>")) return html;
  return html
    .split("\n\n")
    .filter((html) => html.trim())
    .map((html) => `<p>${html}</p>`)
    .join("\n");
}

export function findAdmins() {
  return filter(proxy.t_user, { role: "admin" });
}

export function findAdminEmails() {
  return filter(proxy.t_user, { role: "admin" }).map((admin) => admin.email);
}

export async function autoSendRemindBookingEmails() {
  for (;;) {
    await sendRemindBookingEmails();
    await later(DAY);
  }
}
