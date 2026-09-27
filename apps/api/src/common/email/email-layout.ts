/**
 * One branded, email-client-safe layout for every transactional email (Design 2 colours).
 *
 * Email clients don't run CSS files or web fonts reliably, so this sticks to the conventions that
 * render the same in Gmail, Outlook (Word engine), Apple Mail and mobile apps: nested tables,
 * inline styles, a 600px column, a hidden preheader, a bulletproof button, system fonts, and a
 * plain-text alternative built from the same content.
 *
 * Everything passed in as *text* is escaped here; the only raw HTML accepted is `html` inside a
 * section, which callers build from already-escaped values.
 */

const NAVY = "#122a63";
const GOLD = "#f5b73d";
const INK = "#1c2d5c";
const MUTED = "#51628f";
const LINE = "#e3e8f3";
const CREAM = "#f7f4ea";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const SUPPORT_EMAIL = "planners@paxbook.in";
export const SUPPORT_PHONE = "+91 73000 47077";

export type EmailTone = "success" | "info" | "warning" | "danger";

const TONES: Record<EmailTone, { bg: string; fg: string }> = {
  success: { bg: "#dcfce7", fg: "#166534" },
  info: { bg: "#dbe7fb", fg: "#1d4ed8" },
  warning: { bg: "#fef3c7", fg: "#92400e" },
  danger: { bg: "#fee2e2", fg: "#991b1b" },
};

export interface EmailContent {
  /** Inbox preview line (hidden in the body). */
  preheader: string;
  /** Small label above the title, e.g. "Booking update". */
  eyebrow?: string;
  title: string;
  /** Name used in "Hi {name}," — omitted when not known. */
  recipientName?: string | null;
  /** Plain-text paragraphs (escaped). */
  paragraphs?: string[];
  status?: { label: string; tone: EmailTone };
  /** Label/value rows shown in a details table (values escaped). */
  details?: Array<[string, string]>;
  /** Extra blocks with pre-escaped HTML (e.g. flight legs); `text` is their plain-text version. */
  sections?: Array<{ heading: string; html: string; text: string }>;
  cta?: { label: string; url: string };
  /** Small print under the button. */
  note?: string;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statusBadge(status: NonNullable<EmailContent["status"]>): string {
  const t = TONES[status.tone];
  return `<tr><td style="padding:0 0 18px"><span style="display:inline-block;background:${t.bg};color:${t.fg};font:700 12px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;padding:8px 12px;border-radius:999px">${escapeHtml(status.label)}</span></td></tr>`;
}

function detailsTable(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([label, value], i) =>
        `<tr><td style="padding:11px 14px;${i ? `border-top:1px solid ${LINE};` : ""}font:400 13px/1.4 ${FONT};color:${MUTED};width:42%">${escapeHtml(label)}</td><td style="padding:11px 14px;${i ? `border-top:1px solid ${LINE};` : ""}font:700 14px/1.4 ${FONT};color:${INK}">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  return `<tr><td style="padding:0 0 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${LINE};border-radius:12px;border-collapse:separate">${body}</table></td></tr>`;
}

/** Table-based button: renders as a real button in Outlook too (no reliance on padding on <a>). */
function button(cta: NonNullable<EmailContent["cta"]>): string {
  return `<tr><td style="padding:4px 0 24px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${GOLD}" style="border-radius:999px"><a href="${escapeHtml(cta.url)}" target="_blank" style="display:inline-block;padding:14px 30px;font:800 15px/1 ${FONT};color:${NAVY};text-decoration:none;border-radius:999px">${escapeHtml(cta.label)}</a></td></tr></table></td></tr>`;
}

export function renderEmail(c: EmailContent): { html: string; text: string } {
  const greeting = c.recipientName ? `Hi ${c.recipientName},` : "Hello,";
  const paragraphs = (c.paragraphs ?? [])
    .map((p) => `<tr><td style="padding:0 0 14px;font:400 15px/1.6 ${FONT};color:${INK}">${escapeHtml(p)}</td></tr>`)
    .join("");
  const sections = (c.sections ?? [])
    .map(
      (s) =>
        `<tr><td style="padding:6px 0 8px;font:800 12px/1 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">${escapeHtml(s.heading)}</td></tr><tr><td style="padding:0 0 22px">${s.html}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>${escapeHtml(c.title)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
    <tr><td style="padding:0 4px 18px">
      <span style="font:900 24px/1 ${FONT};letter-spacing:.02em;color:${NAVY}">PAX</span><span style="font:900 24px/1 ${FONT};letter-spacing:.02em;color:#e0a21e">BOOK</span>
      <div style="font:700 10px/1.6 ${FONT};letter-spacing:.22em;color:${MUTED};text-transform:uppercase">Travel · Explore · Experience</div>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:18px;border:1px solid ${LINE};padding:30px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${c.eyebrow ? `<tr><td style="padding:0 0 8px;font:800 12px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#a86a06">${escapeHtml(c.eyebrow)}</td></tr>` : ""}
        <tr><td style="padding:0 0 16px;font:800 24px/1.25 ${FONT};color:${NAVY}">${escapeHtml(c.title)}</td></tr>
        ${c.status ? statusBadge(c.status) : ""}
        <tr><td style="padding:0 0 14px;font:400 15px/1.6 ${FONT};color:${INK}">${escapeHtml(greeting)}</td></tr>
        ${paragraphs}
        ${c.details?.length ? detailsTable(c.details) : ""}
        ${sections}
        ${c.cta ? button(c.cta) : ""}
        ${c.note ? `<tr><td style="padding:0;font:400 12px/1.6 ${FONT};color:${MUTED}">${escapeHtml(c.note)}</td></tr>` : ""}
      </table>
    </td></tr>
    <tr><td style="padding:20px 8px 0;font:400 12px/1.7 ${FONT};color:${MUTED};text-align:center">
      Questions? Write to <a href="mailto:${SUPPORT_EMAIL}" style="color:${NAVY};font-weight:700">${SUPPORT_EMAIL}</a> or call <a href="tel:+917300047077" style="color:${NAVY};font-weight:700">${SUPPORT_PHONE}</a>.<br>
      You're receiving this email because of activity on your Paxbook account.<br>
      © ${new Date().getFullYear()} Paxbook · Travel | Explore | Experience
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    c.title,
    "",
    greeting,
    "",
    ...(c.status ? [`Status: ${c.status.label}`, ""] : []),
    ...(c.paragraphs ?? []).flatMap((p) => [p, ""]),
    ...(c.details?.length ? [...c.details.map(([l, v]) => `${l}: ${v}`), ""] : []),
    ...(c.sections ?? []).flatMap((s) => [s.heading.toUpperCase(), s.text, ""]),
    ...(c.cta ? [`${c.cta.label}: ${c.cta.url}`, ""] : []),
    ...(c.note ? [c.note, ""] : []),
    "—",
    `Questions? ${SUPPORT_EMAIL} · ${SUPPORT_PHONE}`,
    "Paxbook · Travel | Explore | Experience",
  ].join("\n");

  return { html, text };
}
