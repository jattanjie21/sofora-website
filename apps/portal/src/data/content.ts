import { copyFields, optionalUrl } from "../../../web/src/data/copy";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import type { DocumentId } from "./types";

export const documents: {
  id: DocumentId;
  title: string;
  path: string;
  description: string;
  category: string;
}[] = [
  { id: "home", title: "Home", path: "/", description: "Slider, rates, about, loan services, calculator and call to action.", category: "Public page" },
  { id: "about", title: "About", path: "/about-us/", description: "Who we are, vision, mission, figures and principles.", category: "About Us" },
  { id: "history", title: "History", path: "/history/", description: "The brief history of Sofora CCU.", category: "About Us" },
  { id: "faq", title: "FAQ", path: "/faq/", description: "Frequently asked questions.", category: "About Us" },
  { id: "board", title: "Board of Directors", path: "/board-of-directors/", description: "Board members, roles and photos.", category: "Team" },
  { id: "staff", title: "Staff & Loan Team", path: "/staff/", description: "Staff members, roles and photos.", category: "Team" },
  { id: "loans", title: "Services & loans", path: "/services/", description: "The services page, loan products and their pages, how it works and forms.", category: "Services" },
  { id: "saving", title: "Savings", path: "/services/#savings", description: "Savings products and their pages, and the saving boxes story.", category: "Services" },
  { id: "downloads", title: "Downloads", path: "/downloads/", description: "Fillable PDF application forms.", category: "Services" },
  { id: "blog", title: "Blog", path: "/blog/", description: "News posts shown on the blog and home page.", category: "Blog" },
  { id: "photos", title: "Photo Gallery", path: "/photo-gallery/", description: "Gallery photos.", category: "Gallery" },
  { id: "videos", title: "YouTube Gallery", path: "/youtube-gallery/", description: "YouTube channel and featured video.", category: "Gallery" },
  { id: "contact", title: "Contact Us", path: "/contact-us/", description: "Phone numbers, email, address and contact form.", category: "Public page" },
  { id: "partners", title: "Partners", path: "/partners/", description: "Partner names, logos and websites.", category: "Public page" },
  { id: "shared", title: "Menu, footer & help banner", path: "/", description: "Top bar, menu, footer and help banner.", category: "Across the website" },
  { id: "calculator", title: "Loan calculator", path: "/services/#calculator", description: "Loan calculator and repayment schedule labels.", category: "Across the website" },
];

// Lists that belong to a page, besides its copy fields.
const lists: Partial<Record<DocumentId, ("board" | "staff" | "loans" | "savings" | "faqs" | "contact" | "partners")[]>> = {
  board: ["board"],
  staff: ["staff"],
  loans: ["loans"],
  saving: ["savings"],
  faq: ["faqs"],
  contact: ["contact"],
  partners: ["partners"],
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

// Editable text of each loan or savings product, in editor order. List fields hold one item per line.
export const productFields = [
  ["title", "Product name"],
  ["description", "Short description (cards and top of its page)"],
  ["audience", "Who it’s for"],
  ["benefits", "How it helps (one per line)"],
  ["requirements", "What you’ll need (one per line)"],
  ["steps", "Steps (one per line)"],
] as const;

const imagePath = /^(storage:[a-z0-9]+|\/images\/[\w.-]+)$/;

export function contentError(
  content: WebsiteContent,
  id: DocumentId,
): string | null {
  for (const field of copyFields.filter((field) => field.page === id)) {
    const value = content.copy[field.key];
    if (typeof value !== "string" || (value.length > 12000 && field.kind !== "image"))
      return "One of the content fields is too long.";
    if (field.kind === "url" && !(value === "" && optionalUrl(field.key))) {
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
  const products = id === "loans" ? content.loans : id === "saving" ? content.savings : [];
  if (products.some((product) => productFields.some(([key]) => !product[key].trim())))
    return `Fill in every field of each ${id === "loans" ? "loan" : "savings product"}.`;
  if (id === "board" || id === "staff") {
    const slugs = new Set<string>();
    for (const person of content[id]) {
      if (!person.name.trim() || !person.role.trim() || !imagePath.test(person.photo))
        return "Each person needs a name, role and photo.";
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(person.slug))
        return `The page address for “${person.name}” may only use lowercase letters, numbers and dashes.`;
      if (slugs.has(person.slug)) return `Two people share the page address “${person.slug}”. Give each one its own.`;
      slugs.add(person.slug);
      if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email))
        return `Enter a valid email address for “${person.name}”, or leave it empty.`;
    }
  }
  if (id === "faq" && content.faqs.some((faq) => !faq.question.trim() || !faq.answer.trim()))
    return "Each FAQ needs a question and answer.";
  if (id === "partners")
    for (const partner of content.partners) {
      if (!partner.name.trim()) return "Each partner needs a short name.";
      if (partner.logo && !imagePath.test(partner.logo))
        return "Choose an existing image or upload a PNG, JPEG or WebP logo.";
      if (partner.url && !/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(partner.url))
        return `Enter a complete website address for “${partner.name}”, beginning with https:// or http://.`;
    }
  return null;
}
