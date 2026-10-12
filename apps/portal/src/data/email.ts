// Email notification settings, shared by the portal Settings page and convex/email.ts.
// Wording can use {name}, {reference} and {type}; they are filled in when an email is sent.

export const emailTemplates = {
  applicationReceived: {
    when: "Sent to the applicant right after they apply on the website.",
    label: "Application received (to the applicant)",
    subject: "We've received your {type} application ({reference})",
    intro:
      "Thank you for applying to Sofora Cooperative Credit Union. Your application has reached our team and we'll review it as soon as possible. If we need anything else, we'll contact you by email or phone.",
  },
  contactReceived: {
    when: "Sent to the person right after they use the contact form.",
    label: "Message received (to the sender)",
    subject: "We've received your message ({reference})",
    intro:
      "Thank you for getting in touch with Sofora Cooperative Credit Union. A member of our team will reply as soon as possible.",
  },
  informationRequested: {
    when: 'Sent when staff press "Request information". Includes what you asked for.',
    label: "More information needed (to the applicant)",
    subject: "We need a little more information ({reference})",
    intro:
      "Thank you for your {type} application. Before we can continue, our team needs some more information from you. Please reply to this email or contact us with the details below.",
  },
  approved: {
    when: "Sent when an administrator approves the application.",
    label: "Application approved (to the applicant)",
    subject: "Your {type} application has been approved ({reference})",
    intro:
      "Good news! Your {type} application has been approved. Our team will contact you about the next steps.",
  },
  rejected: {
    when: "Sent when an administrator rejects the application.",
    label: "Application not approved (to the applicant)",
    subject: "An update on your {type} application ({reference})",
    intro:
      "Thank you for your {type} application. After careful review, we're unable to approve it at this time. Please contact us if you would like to discuss this or apply again in the future.",
  },
  teamApplication: {
    when: "Sent to the team addresses above for each new website application.",
    label: "New application (to the team)",
    subject: "New {type} application from {name} ({reference})",
    intro: "A new {type} application was submitted on the website. Open it in the staff portal to review it.",
  },
  teamContact: {
    when: "Sent to the contact addresses above for each new message.",
    label: "New contact message (to the team)",
    subject: "New contact message from {name} ({reference})",
    intro: "A new message was sent through the website contact form. Open it in the staff portal to read and reply.",
  },
} as const;

export type EmailTemplate = keyof typeof emailTemplates;
export const emailTemplateKeys = Object.keys(emailTemplates) as EmailTemplate[];

export const teamLists = {
  membership: "Membership applications",
  loan: "Loan applications",
  contact: "Contact messages",
} as const;
export type TeamList = keyof typeof teamLists;

export type EmailSettings = {
  team: Record<TeamList, string[]>;
  replyTo: string;
  enabled: Record<EmailTemplate, boolean>;
  wording: Record<EmailTemplate, { subject: string; intro: string }>;
};

export const defaultEmailSettings: EmailSettings = {
  team: { membership: [], loan: [], contact: [] },
  replyTo: "",
  enabled: Object.fromEntries(emailTemplateKeys.map((key) => [key, true])) as EmailSettings["enabled"],
  wording: Object.fromEntries(
    emailTemplateKeys.map((key) => [key, { subject: emailTemplates[key].subject, intro: emailTemplates[key].intro }]),
  ) as EmailSettings["wording"],
};

// Fills in missing keys (new templates, older saves) from the defaults.
export function withEmailDefaults(stored: Partial<EmailSettings> | null | undefined): EmailSettings {
  const value = stored ?? {};
  return {
    team: { ...defaultEmailSettings.team, ...value.team },
    replyTo: value.replyTo ?? "",
    enabled: { ...defaultEmailSettings.enabled, ...value.enabled },
    wording: Object.fromEntries(
      emailTemplateKeys.map((key) => [key, { ...defaultEmailSettings.wording[key], ...value.wording?.[key] }]),
    ) as EmailSettings["wording"],
  };
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
