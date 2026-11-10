export interface EnquiryFields {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  message: string;
}

/** Human-readable enquiry summary used for every WhatsApp channel. */
export function whatsappSummary(v: EnquiryFields): string {
  return [
    "🟣 New enquiry — SS Solutions website",
    `Name: ${v.name}`,
    `Email: ${v.email}`,
    v.phone ? `Phone: ${v.phone}` : "",
    v.company ? `Company: ${v.company}` : "",
    v.projectType ? `Project type: ${v.projectType}` : "",
    v.budget ? `Budget: ${v.budget}` : "",
    "",
    v.message,
  ]
    .filter(Boolean)
    .join("\n");
}

/** wa.me click-to-chat link with the message pre-filled. */
export function waLink(phoneHref: string, text: string): string {
  const digits = phoneHref.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
