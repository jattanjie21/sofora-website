export const contact = {
  email: "info@soforaccu.com",
  phones: [
    "+2207833358",
    "+2207005604",
    "+2203753900",
    "+2203167996",
    "+2203539059",
  ],
  address: "Bundung Six Junction,\nKanifing Municipality, The Gambia",
};

export type LoanId =
  | "business"
  | "education"
  | "agriculture"
  | "car"
  | "personal"
  | "building"
  | "consumer"
  | "emergency";
type Product = { id: LoanId; title: string; description: string };

export const loans: Product[] = [
  {
    id: "business",
    title: "Business Loan",
    description:
      "This loan product is design to meet the demand of the business community within the Sofora cooperative credit union common bond. Why hassle for finance, its easily accessible with Soforaccu.",
  },
  {
    id: "education",
    title: "Educational Loan",
    description:
      "Sofora cooperative credit union support members with their educational dreams. This person is required to get an invoice from the school he/she intend to pursue his/her education.",
  },
  {
    id: "agriculture",
    title: "Agricultural Loan",
    description:
      "Fertilizer and water are important resources for agricultural productivity. Sofora is thinking of you and working towards helping you commercializes your farming activities.",
  },
  {
    id: "car",
    title: "Car Loan",
    description:
      "Sofora works with members from diverse background. We served as a link to other members to access affordable means of transportation.",
  },
  {
    id: "personal",
    title: "Personal Loan",
    description:
      "Personal loan is a flexible loan which can be utilize for varying purposes such as naming ceremonies, wedding, travelling etc. The loan is a fit for all purpose and Sofora makes it even more attractive.",
  },
  {
    id: "building",
    title: "Building Loan",
    description:
      "Are you a and need a house to settle with your family worry no more. Contact Sofora cooperative credit union for all your building concerns.",
  },
  {
    id: "consumer",
    title: "Consumer Loan",
    description:
      "Why should we cry of hunger or lack of communication when Sofora got you cover.  You can now access to mobile, food stuff and many more at reason prices with flexibility payment mode.",
  },
  {
    id: "emergency",
    title: "Emergency Loan",
    description:
      "No one knows what is coming next. Are hit by a natural disaster unexpectedly worry no more Sofora cooperative credit union got you cover.",
  },
];

export const faqs = [
  {
    question: "How can I join?",
    answer: "Please visit one of our branches or website and apply online",
  },
  {
    question: "What is the interest rate on the loan?",
    answer:
      "All loan loans attract an interest rate of 15% per annum on reducing balance method.",
  },
  {
    question: "What amount am I qualify to apply?",
    answer: "Every member can apply up to three times of his/her saving.",
  },
  {
    question: "Do I need a guarantor to access a loan?",
    answer:
      "A member of the credit union would be qualify to guarantor a fellow member.",
  },
  {
    question: "Is there any extra charges when applying for a loan?",
    answer: "No.",
  },
  {
    question: "When I am qualify to apply for a loan?",
    answer:
      "You must be a member for a period of six months with regular saving.",
  },
];

// [name, role, photo]
export type Person = [name: string, role: string, photo: string];

export const board: Person[] = [
  ["Amie Bojang", "Co-opted Member", "/images/board-amie-bojang.jpg"],
  ["Sonna Baldeh", "Board Member", "/images/board-sonna-baldeh.jpg"],
  ["Ndey Jarju", "Board Member", "/images/board-ndey-jarju.jpg"],
  ["Fatou Bojang", "Board Member", "/images/board-fatou-bojang.jpg"],
  ["Alfusainey Sanneh", "Board Member", "/images/board-alfusainey-sanneh.jpg"],
  ["Modou Lamin Badjie", "Treasurer", "/images/board-modou-lamin-badjie.jpg"],
  ["Omar Bah", "Secretary", "/images/board-omar-bah.jpg"],
  ["Ndey Haddy Badjie", "Vice Chairperson", "/images/board-vice-chairperson.jpg"],
  ["Mrs Fatou Kolley Gaye", "Chairperson", "/images/board-fatou-kolley-gaye.jpg"],
];

export const staff: Person[] = [
  ["Assan Jarju", "Operation Assistant", "/images/board-modou-lamin-badjie.jpg"],
  ["Fatoumata Jawara", "Operation Assistant", "/images/staff-fatoumata-jawara.jpg"],
  ["Fatoumata Sanneh", "Operation Assistant", "/images/staff-fatoumata-sanneh.jpg"],
  ["Ebrima Jammeh", "Operation & IT Support Assistant", "/images/staff-ebrima-jammeh.jpg"],
  ["Bakary Bojang", "General Manager", "/images/staff-bakary-bojang.jpg"],
];

// Photos bundled with the website, offered in the staff portal's image pickers.
export const imageLibrary: { path: string; title: string }[] = [
  ["logo.png", "Sofora logo"],
  ["logo-white.png", "Sofora logo (white)"],
  ["sofora-community.jpg", "Members outside the office"],
  ["savings-boxes.jpeg", "Innovative savings boxes"],
  ["savings-graph.jpeg", "Savings boxes chart"],
  ["slide-online-members.jpg", "Slide: online enquiry"],
  ["slide-personal-loan.jpg", "Slide: personal loan"],
  ["slide-car-loan.jpg", "Slide: car loan"],
  ["slide-careers.jpg", "Slide: careers"],
  ["slide-education.jpg", "Slide: education loan"],
  ["slide-consumer.jpg", "Slide: consumer goods"],
  ["slide-business.jpg", "Slide: business"],
  ["business-loan.jpg", "Business loan"],
  ["page-header-about.jpg", "Page header: team photo"],
  ["rate-building.svg", "Icon: building"],
  ["rate-personal.svg", "Icon: personal loan"],
  ["rate-agriculture.svg", "Icon: agriculture"],
  ["rate-education.svg", "Icon: education"],
  ["news-online-enquiry.jpg", "News: online enquiry"],
  ["news-evolution.jpg", "News: evolution of Sofora"],
  ["evolution-1.jpg", "Solidarity group meeting"],
  ["evolution-safiatou-ndey.jpg", "Safiatou and Ndey"],
  ["evolution-2.jpg", "Solidarity group members"],
  ["gallery-3.jpg", "Gallery: Sofora advert"],
  ["gallery-4.jpeg", "Gallery: loan products flyer"],
  ["partner-naccug.png", "Partner: NACCUG"],
  ["partner-sbfic.png", "Partner: SBFIC"],
  ["partner-gtuccu.png", "Partner: GTUCCU"],
  ["partner-gpfccu.png", "Partner: GPFCCU"],
  ["partner-mrccu.png", "Partner: MRCCU"],
  ["partner-medical-health.png", "Partner: Medical & Health CCU"],
  ["board-amie-bojang.jpg", "Amie Bojang"],
  ["board-sonna-baldeh.jpg", "Sonna Baldeh"],
  ["board-ndey-jarju.jpg", "Ndey Jarju"],
  ["board-fatou-bojang.jpg", "Fatou Bojang"],
  ["board-alfusainey-sanneh.jpg", "Alfusainey Sanneh"],
  ["board-modou-lamin-badjie.jpg", "Placeholder (man)"],
  ["board-omar-bah.jpg", "Omar Bah"],
  ["board-vice-chairperson.jpg", "Ndey Haddy Badjie"],
  ["board-fatou-kolley-gaye.jpg", "Mrs Fatou Kolley Gaye"],
  ["staff-fatoumata-jawara.jpg", "Fatoumata Jawara"],
  ["staff-fatoumata-sanneh.jpg", "Fatoumata Sanneh"],
  ["staff-ebrima-jammeh.jpg", "Ebrima Jammeh"],
  ["staff-bakary-bojang.jpg", "Bakary Bojang"],
].map(([file, title]) => ({ path: `/images/${file}`, title: title! }));
