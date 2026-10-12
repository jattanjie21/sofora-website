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
  {
    id: "home",
    title: "Home",
    path: "/",
    description: "Your welcome to the Sofora community.",
    category: "Public page",
  },
  {
    id: "about",
    title: "About Sofora",
    path: "/about",
    description: "Our story, purpose, board and team.",
    category: "Public page",
  },
  {
    id: "savings",
    title: "Savings",
    path: "/savings",
    description: "Products and guidance for every saving goal.",
    category: "Public page",
  },
  {
    id: "loans",
    title: "Loans",
    path: "/loans",
    description: "Loan products and lending introductions.",
    category: "Public page",
  },
  {
    id: "membership",
    title: "Membership",
    path: "/membership",
    description: "Benefits and the steps to joining Sofora.",
    category: "Public page",
  },
  {
    id: "community",
    title: "Community",
    path: "/community",
    description: "Photos, stories and cooperative milestones.",
    category: "Public page",
  },
  {
    id: "contact",
    title: "Contact",
    path: "/contact",
    description: "Phone numbers, email and office information.",
    category: "Public page",
  },
  {
    id: "shared",
    title: "Shared content & FAQs",
    path: "/membership",
    description: "Navigation, footer, banners and common questions.",
    category: "Across the website",
  },
  {
    id: "calculator",
    title: "Loan calculator copy",
    path: "/loans#calculator",
    description: "Introductions, labels and explanatory copy.",
    category: "Across the website",
  },
];

export function applyDocument(
  target: WebsiteContent,
  source: WebsiteContent,
  id: DocumentId,
): WebsiteContent {
  const next = structuredClone(target);
  for (const field of copyFields.filter((field) => field.page === id))
    next.copy[field.key] = source.copy[field.key];
  if (id === "about") {
    next.board = structuredClone(source.board);
    next.staff = structuredClone(source.staff);
  }
  if (id === "savings") next.savings = structuredClone(source.savings);
  if (id === "loans") next.loans = structuredClone(source.loans);
  if (id === "contact") next.contact = structuredClone(source.contact);
  if (id === "shared") next.faqs = structuredClone(source.faqs);
  return next;
}

export function contentError(
  content: WebsiteContent,
  id: DocumentId,
): string | null {
  for (const field of copyFields.filter((field) => field.page === id)) {
    const value = content.copy[field.key];
    if (
      typeof value !== "string" ||
      (value.length > 12000 && field.kind !== "image")
    )
      return "One of the content fields is too long.";
    if (field.kind === "url") {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:")
          return "Link destinations must begin with https:// or http://.";
      } catch {
        return "Enter a complete website address for each link destination.";
      }
    }
    if (
      field.kind === "image" &&
      !/^storage:[a-z0-9]+$/.test(value) &&
      !/^\/images\/[\w.-]+$/.test(value)
    )
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
  if (
    (id === "savings"
      ? content.savings
      : id === "loans"
        ? content.loans
        : []
    ).some((product) => !product.title.trim() || !product.description.trim())
  )
    return "Each product needs a title and description.";
  if (
    id === "about" &&
    [...content.board, ...content.staff].some(
      ([name, role]) => !name.trim() || !role.trim(),
    )
  )
    return "Each person needs a name and role.";
  if (
    id === "shared" &&
    content.faqs.some((faq) => !faq.question.trim() || !faq.answer.trim())
  )
    return "Each FAQ needs a question and answer.";
  return null;
}
