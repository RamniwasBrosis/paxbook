import { BadRequestException, Injectable } from "@nestjs/common";
import { randomInt, randomUUID } from "node:crypto";
import { CacheService } from "../cache/cache.service";

const TTL_SECONDS = 5 * 60;
/** No 0/O, 1/I/L — easy to misread. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 5;

/**
 * Our own image captcha for login, signup and OTP requests (no third-party keys): a short code drawn
 * as a distorted SVG. Each code works once and for five minutes; the answer stays on the server.
 */
@Injectable()
export class CaptchaService {
  constructor(private readonly cache: CacheService) {}

  async create(): Promise<{ captchaId: string; image: string }> {
    const text = Array.from({ length: LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    const captchaId = randomUUID();
    await this.cache.putOnce(`captcha:${captchaId}`, text, TTL_SECONDS);
    return { captchaId, image: `data:image/svg+xml;base64,${Buffer.from(drawSvg(text)).toString("base64")}` };
  }

  /** Throws a readable 400 unless the answer matches; the code is used up either way. */
  async assertValid(captchaId: string | undefined, answer: string | undefined): Promise<void> {
    const expected = captchaId ? await this.cache.takeOnce(`captcha:${captchaId}`) : null;
    if (!expected) throw new BadRequestException({ code: "CAPTCHA_EXPIRED", message: "The security code expired. Please try the new one." });
    if ((answer ?? "").trim().toUpperCase() !== expected) {
      throw new BadRequestException({ code: "CAPTCHA_INVALID", message: "The security code didn't match. Please try again." });
    }
  }
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function drawSvg(text: string): string {
  const w = 160;
  const h = 54;
  const colors = ["#1b3f8f", "#122a63", "#7c3aed", "#b45309", "#0f766e"];
  const noise = Array.from({ length: 6 }, () => {
    const c = colors[randomInt(colors.length)];
    return `<path d="M${rand(0, w / 3).toFixed(1)} ${rand(5, h - 5).toFixed(1)} Q ${rand(w / 3, (2 * w) / 3).toFixed(1)} ${rand(0, h).toFixed(1)} ${rand((2 * w) / 3, w).toFixed(1)} ${rand(5, h - 5).toFixed(1)}" stroke="${c}" stroke-opacity="0.45" stroke-width="${rand(1, 2.2).toFixed(1)}" fill="none"/>`;
  }).join("");
  const dots = Array.from({ length: 40 }, () => `<circle cx="${rand(0, w).toFixed(1)}" cy="${rand(0, h).toFixed(1)}" r="${rand(0.6, 1.6).toFixed(1)}" fill="#64748b" fill-opacity="0.5"/>`).join("");
  const step = (w - 24) / text.length;
  const chars = text
    .split("")
    .map((ch, i) => {
      const x = 14 + i * step + rand(-3, 3);
      const y = h / 2 + rand(6, 14);
      const r = rand(-28, 28).toFixed(1);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${r} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="Verdana, Arial, sans-serif" font-size="${rand(24, 30).toFixed(0)}" font-weight="700" fill="${colors[randomInt(colors.length)]}">${ch}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" rx="10" fill="#f1f5fb"/>${dots}${noise}${chars}</svg>`;
}
