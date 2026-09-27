import { escapeHtml, renderEmail } from "./email-layout";

describe("renderEmail", () => {
  const base = {
    preheader: "Your booking is confirmed",
    title: "Your booking is confirmed",
    recipientName: "Asha",
    paragraphs: ["Thanks for booking."],
    details: [["Booking reference", "PB-1234ABCD"]] as Array<[string, string]>,
    cta: { label: "View booking", url: "https://web.paxbook.in/account/bookings/1" },
  };

  it("escapes user-controlled values so a name can't inject markup", () => {
    const { html } = renderEmail({ ...base, recipientName: '<img src=x onerror="alert(1)">' });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("builds a plain-text part carrying the same facts and link", () => {
    const { text } = renderEmail(base);
    expect(text).toContain("Hi Asha,");
    expect(text).toContain("Booking reference: PB-1234ABCD");
    expect(text).toContain("View booking: https://web.paxbook.in/account/bookings/1");
    expect(text).not.toMatch(/<[a-z]/i);
  });

  it("renders a table-based button pointing at the CTA url, plus the hidden preheader", () => {
    const { html } = renderEmail(base);
    expect(html).toContain('href="https://web.paxbook.in/account/bookings/1"');
    expect(html).toContain("display:none");
    expect(html).toContain("Your booking is confirmed");
  });

  it("falls back to a neutral greeting when the name is unknown", () => {
    expect(renderEmail({ ...base, recipientName: null }).text).toContain("Hello,");
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});
