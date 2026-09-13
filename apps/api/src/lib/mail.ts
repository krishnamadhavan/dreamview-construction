import nodemailer from "nodemailer";
import { loadConfig } from "../config.js";

export type EnquiryNotice = {
  name: string;
  email: string;
  phone: string;
  site: string;
  brief: string;
};

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function mailReady(): boolean {
  const { mail } = loadConfig();
  return Boolean(mail.smtpHost) || Boolean(mail.resendApiKey);
}

function fromAddress(): string {
  const { mail } = loadConfig();
  return mail.from || mail.smtpUser || "Dreamview Construction <noreply@dreamviewconstructions.com>";
}

function noticeText(enquiry: EnquiryNotice, inboxUrl: string): string {
  return [
    `${enquiry.name} sent a brief from the site.`,
    "",
    `Site: ${enquiry.site}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : "",
    "",
    enquiry.brief,
    "",
    `Inbox: ${inboxUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function noticeHtml(enquiry: EnquiryNotice, inboxUrl: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p><strong>${escape(enquiry.name)}</strong> sent a brief from the site.</p>
<p>Site: ${escape(enquiry.site)}<br/>
Email: ${escape(enquiry.email)}${enquiry.phone ? `<br/>Phone: ${escape(enquiry.phone)}` : ""}</p>
<p>${escape(enquiry.brief).replace(/\n/g, "<br/>")}</p>
<p><a href="${escape(inboxUrl)}">Open the inbox</a></p>`;
}

async function sendSmtp(to: string, enquiry: EnquiryNotice, inboxUrl: string): Promise<void> {
  const { mail } = loadConfig();
  const transport = nodemailer.createTransport({
    host: mail.smtpHost,
    port: mail.smtpPort,
    secure: mail.smtpPort === 465,
    auth: mail.smtpUser ? { user: mail.smtpUser, pass: mail.smtpPass } : undefined,
  });
  await transport.sendMail({
    from: fromAddress(),
    to,
    replyTo: enquiry.email,
    subject: `New brief — ${enquiry.name} · ${enquiry.site}`,
    text: noticeText(enquiry, inboxUrl),
    html: noticeHtml(enquiry, inboxUrl),
  });
}

async function sendResend(to: string, enquiry: EnquiryNotice, inboxUrl: string): Promise<void> {
  const { mail } = loadConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mail.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      reply_to: enquiry.email,
      subject: `New brief — ${enquiry.name} · ${enquiry.site}`,
      text: noticeText(enquiry, inboxUrl),
      html: noticeHtml(enquiry, inboxUrl),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 200)}`);
  }
}

export async function notifyStudioOfEnquiry(to: string, enquiry: EnquiryNotice): Promise<boolean> {
  const dest = looksLikeEmail(to) ? to : "";
  if (!dest || !mailReady()) return false;
  const { siteUrl, mail } = loadConfig();
  const inboxUrl = `${siteUrl}/admin/enquiries`;
  if (mail.smtpHost) {
    await sendSmtp(dest, enquiry, inboxUrl);
    return true;
  }
  await sendResend(dest, enquiry, inboxUrl);
  return true;
}
