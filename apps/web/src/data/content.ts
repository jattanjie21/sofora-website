import type { IconName } from "../components/Icon";

export const contact = {
  email: "info@soforaccu.com",
  phones: [
    "+220 783 3358",
    "+220 700 5604",
    "+220 375 3900",
    "+220 316 7996",
    "+220 353 9059",
  ],
  address: "Bundung Six Junction, Kanifing Municipality, The Gambia",
};

type Product = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
};

export const savings: Product[] = [
  {
    id: "personal",
    title: "Personal savings",
    description:
      "Make room for your next chapter. Build a regular saving habit around the things that matter to you.",
    icon: "wallet",
  },
  {
    id: "group",
    title: "Group & business savings",
    description:
      "Bring your shared ambitions together, with savings for your kafo, organisation, or business.",
    icon: "people",
  },
  {
    id: "children",
    title: "Children’s savings",
    description:
      "Start small today. Help the next generation build a foundation for the opportunities ahead.",
    icon: "sprout",
  },
];

export const loans: Product[] = [
  {
    id: "business",
    title: "Business loans",
    description:
      "Take the next step for your business, from stocking your shop to putting an expansion plan in motion.",
    icon: "briefcase",
  },
  {
    id: "education",
    title: "Education loans",
    description:
      "Keep learning within reach, with support for school fees and your next stage of education.",
    icon: "book",
  },
  {
    id: "building",
    title: "Building loans",
    description:
      "Bring your plans for a home closer, with support for your building project.",
    icon: "home",
  },
  {
    id: "agriculture",
    title: "Agricultural loans",
    description:
      "Support your next season with financing for your farming activities.",
    icon: "sprout",
  },
  {
    id: "personal",
    title: "Personal loans",
    description:
      "Find support for life’s plans, family occasions, and the personal goals you’re working towards.",
    icon: "heart",
  },
  {
    id: "car",
    title: "Car loans",
    description:
      "Explore financing for a vehicle that helps you get to work, run your business, or care for your family.",
    icon: "car",
  },
  {
    id: "consumer",
    title: "Consumer loans",
    description:
      "Spread the cost of everyday essentials with a loan suited to your needs.",
    icon: "wallet",
  },
  {
    id: "emergency",
    title: "Emergency loans",
    description:
      "Speak with our team about financial support when an unexpected need arises.",
    icon: "shield",
  },
];

export const faqs = [
  {
    question: "What makes Sofora a credit union?",
    answer:
      "Sofora is owned and governed by its members. Savings help support lending within the community, and members have a voice in how the cooperative is run.",
  },
  {
    question: "How do I become a member?",
    answer:
      "Contact our team or visit the office at Bundung Six Junction. We’ll explain membership, confirm the documents you need, and guide you through the next steps.",
  },
  {
    question: "Can I save with my group or business?",
    answer:
      "Yes. Sofora offers group, corporate, and business savings, alongside personal and children’s savings. Speak to our team about the right account for your group.",
  },
  {
    question: "How can I find out about a loan?",
    answer:
      "Start by exploring our loan options, then speak with the team about eligibility, your saving history, any guarantor requirements, and current terms. Applications are subject to assessment.",
  },
  {
    question: "What interest rate will I pay?",
    answer:
      "Contact Sofora for the current rate and repayment terms for your loan. Our website calculator lets you explore an example repayment; it is not a loan offer or a confirmed rate.",
  },
];

export const board: [name: string, role: string][] = [
  ["Mrs Fatou Kolley Gaye", "Chairperson"],
  ["Ndey Haddy Badjie", "Vice Chairperson"],
  ["Omar Bah", "Secretary"],
  ["Modou Lamin Badjie", "Treasurer"],
  ["Alfusainey Sanneh", "Board Member"],
  ["Fatou Bojang", "Board Member"],
  ["Ndey Jarju", "Board Member"],
  ["Sonna Baldeh", "Board Member"],
  ["Amie Bojang", "Co-opted Member"],
];

export const staff: [name: string, role: string][] = [
  ["Bakary Bojang", "General Manager"],
  ["Ebrima Jammeh", "Operation & IT Support Assistant"],
  ["Assan Jarju", "Operation Assistant"],
  ["Fatoumata Jawara", "Operation Assistant"],
  ["Fatoumata Sanneh", "Operation Assistant"],
];
