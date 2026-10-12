import { board, contact, faqs, loans, partners, savings, staff } from "./content";
import { defaultCopy } from "./copy";

export const defaultWebsiteContent = {
  copy: defaultCopy,
  contact,
  loans,
  savings,
  faqs,
  board,
  staff,
  partners,
};

export type WebsiteContent = typeof defaultWebsiteContent;
