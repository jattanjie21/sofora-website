const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  northeast: "M6 18 18 6M6 6h12v12",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  check: "m5 12 4 4L19 6",
  shield: "m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Zm-4 9 3 3 5-6",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  sprout:
    "M12 21v-9M12 16C4 16 3 10 3 6c7 0 9 4 9 10Zm0-4c0-6 3-9 9-9 0 6-3 9-9 9Z",
  home: "m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8",
  book: "m2 4 10 3 10-3v15l-10 3-10-3V4Zm10 3v15",
  wallet: "M20 8H5a3 3 0 0 1 0-6h13v6M3 5v14a2 2 0 0 0 2 2h15V8m0 5h-5v4h5",
  briefcase: "M3 7h18v14H3V7Zm5 0V3h8v4M3 12l9 3 9-3m-9 1v4",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  car: "m5 7 2-4h10l2 4 3 4v8H2v-8l3-4Zm0 0h14M5 19v2m14-2v2M5 13h3m8 0h3",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9 10.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 .8 1.1Z",
  mail: "M3 4h18v16H3V4Zm0 2 9 7 9-7",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
