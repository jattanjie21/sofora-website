import { copyFields } from "../../../web/src/data/copy";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import type { DocumentId } from "./types";

export const documents: {
  id: DocumentId;
  title: string;
  path: string;
  description: string;
  category: string;
}[] = [
  { id: "home", title: "Home", path: "/", description: "Slider, rates, about, loan services and latest news.", category: "Public page" },
  { id: "about", title: "About", path: "/about-us/", description: "Who we are, vision, mission, figures and principles.", category: "About Us" },
  { id: "history", title: "History", path: "/history/", description: "The brief history of Sofora CCU.", category: "About Us" },
  { id: "faq", title: "FAQ", path: "/faq/", description: "Frequently asked questions.", category: "About Us" },
  { id: "board", title: "Board of Directors", path: "/board-of-directors/", description: "Board members, roles and photos.", category: "Team" },
  { id: "staff", title: "Staff & Loan Team", path: "/staff/", description: "Staff members, roles and photos.", category: "Team" },
  { id: "loans", title: "Loan Services", path: "/loan-services/", description: "Loan products, highlights and partners.", category: "Services" },
  { id: "saving", title: "Saving", path: "/saving/", description: "Types of savings and the innovative saving boxes.", category: "Services" },
  { id: "downloads", title: "Downloads", path: "/downloads/", description: "Fillable PDF application forms.", category: "Services" },
  { id: "blog", title: "Blog", path: "/blog/", description: "News posts shown on the blog and home page.", category: "Blog" },
  { id: "photos", title: "Photo Gallery", path: "/photo-gallery/", description: "Gallery photos.", category: "Gallery" },
  { id: "videos", title: "YouTube Gallery", path: "/youtube-gallery/", description: "YouTube channel and featured video.", category: "Gallery" },
  { id: "contact", title: "Contact Us", path: "/contact-us/", description: "Phone numbers, email, address and contact form.", category: "Public page" },
  { id: "shared", title: "Menu, footer & help banner", path: "/", description: "Top bar, menu, partners, footer and help banner.", category: "Across the website" },
  { id: "calculator", title: "Loan calculators", path: "/loan-services/#calculator", description: "Loan and amortization calculator labels.", category: "Across the website" },
];

// Lists that belong to a page, besides its copy fields.
const lists: Partial<Record<DocumentId, ("board" | "staff" | "loans" | "faqs" | "contact")[]>> = {
  board: ["board"],
  staff: ["staff"],
  loans: ["loans"],
  faq: ["faqs"],
  contact: ["contact"],
};

export function applyDocument(
  target: WebsiteContent,
  source: WebsiteContent,
  id: DocumentId,
): WebsiteContent {
  const next = structuredClone(target);
  for (const field of copyFields.filter((field) => field.page === id))
    next.copy[field.key] = source.copy[field.key];
  for (const list of lists[id] ?? [])
    (next as Record<string, unknown>)[list] = structuredClone(source[list]);
  return next;
}

const imagePath = /^(storage:[a-z0-9]+|\/images\/[\w.-]+)$/;

export function contentError(
  content: WebsiteContent,
  id: DocumentId,
): string | null {
  for (const field of copyFields.filter((field) => field.page === id)) {
    const value = content.copy[field.key];
    if (typeof value !== "string" || (value.length > 12000 && field.kind !== "image"))
      return "One of the content fields is too long.";
    if (field.kind === "url") {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:")
          return "Link destinations must begin with https:// or http://.";
      } catch {
        return `Enter a complete website address for “${field.label}”.`;
      }
    }
    if (field.kind === "image" && !imagePath.test(value))
      return "Choose an existing image or upload a PNG, JPEG or WebP photo.";
  }
  if (
    id === "contact" &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contact.email) ||
      !content.contact.address.trim() ||
      !content.contact.phones.length ||
      content.contact.phones.some((phone) => !/^[+()\d\s-]{5,30}$/.test(phone)))
  )
    return "Provide a valid email, address and at least one valid phone number.";
  if (id === "loans" && content.loans.some((loan) => !loan.title.trim() || !loan.description.trim()))
    return "Each loan needs a title and description.";
  if (
    (id === "board" || id === "staff") &&
    content[id].some(([name, role, photo]) => !name.trim() || !role.trim() || !imagePath.test(photo))
  )
    return "Each person needs a name, role and photo.";
  if (id === "faq" && content.faqs.some((faq) => !faq.question.trim() || !faq.answer.trim()))
    return "Each FAQ needs a question and answer.";
  return null;
}
