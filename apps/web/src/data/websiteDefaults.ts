import { board, contact, faqs, loans, savings, staff } from "./content";
import { defaultCopy } from "./copy";

export const defaultWebsiteContent = {
  copy: defaultCopy,
  contact,
  savings,
  loans,
  faqs,
  board,
  staff,
};

export type WebsiteContent = typeof defaultWebsiteContent;

