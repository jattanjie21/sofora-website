import type { LoanId } from "../data/content";

const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  check: "m5 12 4 4L19 6",
  chevronDown: "m6 9 6 6 6-6",
  chevronLeft: "m15 6-6 6 6 6",
  chevronRight: "m9 6 6 6-6 6",
  download: "M12 4v11m-5-5 5 5 5-5M4 20h16",
  play: "M8 5v14l11-7L8 5Z",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9 10.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 .8 1.1Z",
  mail: "M3 4h18v16H3V4Zm0 2 9 7 9-7",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  money: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  home: "m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8",
  calendar: "M4 5h16v16H4V5Zm0 5h16M8 3v4m8-4v4",
  search: "m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  user: "M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  // Also used by the staff portal.
  northeast: "M6 18 18 6M6 6h12v12",
  shield: "m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Zm-4 9 3 3 5-6",
  sprout: "M12 21v-9M12 16C4 16 3 10 3 6c7 0 9 4 9 10Zm0-4c0-6 3-9 9-9 0 6-3 9-9 9Z",
  book: "m2 4 10 3 10-3v15l-10 3-10-3V4Zm10 3v15",
  wallet: "M20 8H5a3 3 0 0 1 0-6h13v6M3 5v14a2 2 0 0 0 2 2h15V8m0 5h-5v4h5",
  briefcase: "M3 7h18v14H3V7Zm5 0V3h8v4M3 12l9 3 9-3m-9 1v4",
  twitter:
    "M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.6 1 4.2 4.2 0 0 0-7.2 3.8A11.9 11.9 0 0 1 3 4.6a4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5 4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 18.5a11.9 11.9 0 0 0 6.4 1.9c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0 0 22 5.8Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

// Line illustrations for the loan products, drawn on a 64×64 grid in the style of the original site.
const loanPaths: Record<LoanId, string> = {
  business:
    "M6 34h8v22H6zM14 38h10c4 0 6 3 10 3h8a3 3 0 0 1 0 6H30m-16 5 14 3c4 1 6 0 9-2l17-11a3 3 0 0 0-3-5l-12 7M38 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-3 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM50 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  education:
    "M32 6a26 26 0 1 0 26 26M32 12v4m0 32v4M12 32h4m32 0h4M32 22v10l-6 6M50 40v20m4-16h-6a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-6",
  agriculture:
    "M6 22h52l-4-12H10zM6 22a6.5 6.5 0 0 0 13 0 6.5 6.5 0 0 0 13 0 6.5 6.5 0 0 0 13 0 6.5 6.5 0 0 0 13 0M10 28v28h44V28M10 44h44M18 44v-6m6 6v-8m6 8v-5m10 5c0-6 8-6 8 0M22 10l-2 12m12-12v12m10-12 2 12",
  car: "M8 40v-8l6-14h36l6 14v8zM8 40v8h8v-8m32 0v8h8v-8M14 32h36M20 36a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm28 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM26 26h12",
  personal:
    "M6 10h36v44H6zM12 16h24v32H12zM24 40a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM46 30c0-2 4-3 7-3s7 1 7 3-4 3-7 3-7-1-7-3Zm0 0v6c0 2 4 3 7 3s7-1 7-3v-6m-14 6v6c0 2 4 3 7 3s7-1 7-3v-6m-14 6v6c0 2 4 3 7 3s7-1 7-3v-6",
  building:
    "M32 6 6 20v4h52v-4zM6 56h52M10 52h44M12 28v20m10-20v20m10-20v20m10-20v20m10-20v20M30 15h4",
  consumer:
    "M6 22h48a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4zM6 22l26-14 12 14M20 22l18-10m20 22H44a4 4 0 0 0 0 8h14M46 38h2M10 28h4m4 0h4m4 0h4m4 0h4",
  emergency:
    "M4 10h8l6 30h30l6-20H24M22 48a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm28 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM40 8a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 5v10m-5-5h10",
};

export function LoanIcon({ id }: { id: LoanId }) {
  return (
    <svg
      className="loan-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={loanPaths[id]} />
    </svg>
  );
}
