import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { company } from "@/data/company";
import { whatsappSummary } from "@/lib/whatsapp";

export const runtime = "nodejs";

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  message?: string;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** WhatsApp template params can't contain newlines, tabs or 4+ spaces. */
const oneLine = (v: string) => v.replace(/\s+/g, " ").trim();

/**
 * Contact endpoint.
 *
 * Every configured channel below runs (they are independent, not either/or).
 * NO secrets in code — all via env:
 *
 *   WhatsApp to BOTH partner numbers (recipients from src/data/company.ts):
 *
 *   a) CallMeBot — free, no Meta Business account. Each partner WhatsApps
 *      "I allow callmebot to send me messages" to +34 644 51 95 23, gets a key:
 *        CALLMEBOT_APIKEY_1  -> company.people[0]  (Satej)
 *        CALLMEBOT_APIKEY_2  -> company.people[1]  (Sahil)
 *
 *   b) Twilio WhatsApp (reliable; sandbox each partner joins with "join <code>"):
 *        TWILIO_ACCOUNT_SID
 *        TWILIO_AUTH_TOKEN
 *        TWILIO_WHATSAPP_FROM     -> e.g. +14155238886 (sandbox) or your sender
 *
 *   c) Meta WhatsApp Cloud API (official, needs a Business sender + template):
 *        WHATSAPP_TOKEN            -> permanent access token
 *        WHATSAPP_PHONE_NUMBER_ID  -> the sender number's Phone Number ID
 *        WHATSAPP_TEMPLATE_NAME    -> approved template, one body variable {{1}}
 *        WHATSAPP_TEMPLATE_LANG    -> template language code (default "en")
 *
 *   Email (simplest): WEB3FORMS_ACCESS_KEY  -> web3forms.com, no account, key by email
 *   Email (Gmail):    GMAIL_USER + GMAIL_APP_PASSWORD  -> sends to company.email
 *   Email (Resend):   RESEND_API_KEY + CONTACT_TO_EMAIL
 *   Webhook:          CONTACT_WEBHOOK_URL   (Zapier / Make / n8n / custom)
 *   Formspree:        FORMSPREE_ENDPOINT
 *
 * If nothing is configured the submission is accepted and logged (local/preview).
 * GET this route to see which channels are currently configured.
 */
/** Diagnostic: which delivery channels are configured right now? (no secret values) */
export function GET() {
  const e = process.env;
  return NextResponse.json({
    configured: {
      whatsappCallMeBot: {
        [company.people[0]?.name ?? "person1"]: !!e.CALLMEBOT_APIKEY_1,
        [company.people[1]?.name ?? "person2"]: !!e.CALLMEBOT_APIKEY_2,
      },
      whatsappTwilio:
        !!e.TWILIO_ACCOUNT_SID &&
        !!e.TWILIO_AUTH_TOKEN &&
        !!e.TWILIO_WHATSAPP_FROM,
      whatsappCloudApi:
        !!e.WHATSAPP_TOKEN &&
        !!e.WHATSAPP_PHONE_NUMBER_ID &&
        !!e.WHATSAPP_TEMPLATE_NAME,
      web3forms: !!e.WEB3FORMS_ACCESS_KEY,
      gmail: !!e.GMAIL_USER && !!e.GMAIL_APP_PASSWORD,
      resend: !!e.RESEND_API_KEY && (!!e.CONTACT_TO_EMAIL || !!company.email),
      webhook: !!e.CONTACT_WEBHOOK_URL,
      formspree: !!e.FORMSPREE_ENDPOINT,
    },
    note: "Any true channel fires on form submit. All false = submissions are only logged; visitors still get the wa.me buttons on the success screen.",
  });
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 422 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 422 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please add a little more detail about the project." },
      { status: 422 },
    );
  }

  const clean = {
    name,
    email,
    phone: body.phone?.trim() ?? "",
    company: body.company?.trim() ?? "",
    projectType: body.projectType?.trim() ?? "",
    budget: body.budget?.trim() ?? "",
    message,
    receivedAt: new Date().toISOString(),
  };

  const {
    CALLMEBOT_APIKEY_1,
    CALLMEBOT_APIKEY_2,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM,
    WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_TEMPLATE_NAME,
    WHATSAPP_TEMPLATE_LANG,
    WEB3FORMS_ACCESS_KEY,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    RESEND_API_KEY,
    CONTACT_TO_EMAIL,
    CONTACT_WEBHOOK_URL,
    FORMSPREE_ENDPOINT,
  } = process.env;

  const toEmail = CONTACT_TO_EMAIL || company.email;

  const summaryText = whatsappSummary(clean);
  const summaryLine = oneLine(
    [
      `${clean.name}${clean.company ? ` (${clean.company})` : ""}`,
      clean.phone || "no phone",
      clean.projectType || "unspecified",
      clean.budget || "budget n/a",
      `— ${clean.message.slice(0, 400)}`,
    ].join(" · "),
  );

  const channels: Promise<unknown>[] = [];

  // --- CallMeBot: free WhatsApp to each partner who has an API key ---
  const callmebotKeys = [CALLMEBOT_APIKEY_1, CALLMEBOT_APIKEY_2];
  company.people.forEach((person, i) => {
    const apikey = callmebotKeys[i];
    if (!apikey) return;
    const to = person.phoneHref.replace(/\D/g, "");
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${to}` +
      `&text=${encodeURIComponent(summaryText)}&apikey=${encodeURIComponent(apikey)}`;
    channels.push(
      fetch(url).then(async (r) => {
        const txt = await r.text();
        // CallMeBot returns 200 with an error string on failure, so inspect the body too.
        if (!r.ok || /error|invalid|not found/i.test(txt)) {
          throw new Error(`CallMeBot -> ${person.phone}: ${r.status} ${txt.slice(0, 160)}`);
        }
      }),
    );
  });

  // --- Twilio WhatsApp: message BOTH numbers ---
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    const auth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
    ).toString("base64");
    const from = TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
      ? TWILIO_WHATSAPP_FROM
      : `whatsapp:${TWILIO_WHATSAPP_FROM}`;
    for (const person of company.people) {
      const to = `whatsapp:+${person.phoneHref.replace(/\D/g, "")}`;
      channels.push(
        fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ From: from, To: to, Body: summaryText }),
          },
        ).then(async (r) => {
          if (!r.ok) {
            throw new Error(
              `Twilio -> ${person.phone}: ${r.status} ${(await r.text()).slice(0, 200)}`,
            );
          }
        }),
      );
    }
  }

  // --- WhatsApp Cloud API: message BOTH numbers ---
  if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_TEMPLATE_NAME) {
    for (const person of company.people) {
      const to = person.phoneHref.replace(/[^\d]/g, ""); // E.164 digits only
      channels.push(
        fetch(
          `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to,
              type: "template",
              template: {
                name: WHATSAPP_TEMPLATE_NAME,
                language: { code: WHATSAPP_TEMPLATE_LANG || "en" },
                components: [
                  {
                    type: "body",
                    parameters: [{ type: "text", text: summaryLine }],
                  },
                ],
              },
            }),
          },
        ).then(async (r) => {
          if (!r.ok) {
            throw new Error(
              `WhatsApp -> ${person.phone}: ${r.status} ${await r.text()}`,
            );
          }
        }),
      );
    }
  }

  // --- Generic webhook (Zapier / Make / n8n) ---
  if (CONTACT_WEBHOOK_URL) {
    channels.push(
      fetch(CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean),
      }).then((r) => {
        if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
      }),
    );
  }

  // --- Formspree ---
  if (FORMSPREE_ENDPOINT) {
    channels.push(
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(clean),
      }).then((r) => {
        if (!r.ok) throw new Error(`Formspree responded ${r.status}`);
      }),
    );
  }

  const emailText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${clean.phone || "—"}`,
    `Company: ${clean.company || "—"}`,
    `Project type: ${clean.projectType || "—"}`,
    `Budget: ${clean.budget || "—"}`,
    "",
    clean.message,
  ].join("\n");
  const emailSubject = `New enquiry — ${name}${clean.company ? ` (${clean.company})` : ""}`;

  // --- Web3Forms (simplest: no account, key emailed to you) ---
  if (WEB3FORMS_ACCESS_KEY) {
    channels.push(
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: emailSubject,
          from_name: `${company.name} website`,
          replyto: email,
          name,
          email,
          phone: clean.phone || "—",
          company: clean.company || "—",
          project_type: clean.projectType || "—",
          budget: clean.budget || "—",
          message: clean.message,
        }),
      }).then(async (r) => {
        const data = (await r.json().catch(() => ({}))) as { success?: boolean };
        if (!r.ok || !data.success) {
          throw new Error(`Web3Forms responded ${r.status}`);
        }
      }),
    );
  }

  // --- Email via Gmail (SMTP + App Password) ---
  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    channels.push(
      nodemailer
        .createTransport({
          service: "gmail",
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        })
        .sendMail({
          from: `"${company.name} website" <${GMAIL_USER}>`,
          to: toEmail,
          replyTo: email,
          subject: emailSubject,
          text: emailText,
        }),
    );
  }

  // --- Email via Resend ---
  if (RESEND_API_KEY && toEmail) {
    channels.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${company.name} Website <onboarding@resend.dev>`,
          to: [toEmail],
          reply_to: email,
          subject: emailSubject,
          text: emailText,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Resend responded ${r.status}`);
      }),
    );
  }

  if (channels.length === 0) {
    console.info("[contact] submission (no provider configured):", clean);
    // Nothing was delivered — tell the client so it can route the lead to WhatsApp.
    return NextResponse.json({ ok: true, delivered: false });
  }

  const results = await Promise.allSettled(channels);
  const failures = results.filter((r) => r.status === "rejected");
  failures.forEach((f) =>
    console.error("[contact] channel failed:", (f as PromiseRejectedResult).reason),
  );

  // Succeed if at least one channel delivered; only hard-fail if every channel errored.
  if (failures.length === results.length) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't send your message right now. Please call or WhatsApp us instead.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
