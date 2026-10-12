import { board, contact, faqs, loans, staff } from "./content";
import { defaultCopy } from "./copy";

export const defaultWebsiteContent = {
  copy: defaultCopy,
  contact,
  loans,
  faqs,
  board,
  staff,
};

export type WebsiteContent = typeof defaultWebsiteContent;
