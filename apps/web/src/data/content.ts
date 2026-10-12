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
export type SavingId = "personal-saving" | "group-saving" | "childrens-saving" | "saving-boxes";
export type ServiceId = LoanId | SavingId;

// A loan or savings product. `benefits`, `requirements` and `steps` hold one item per line.
export type Product<Id extends ServiceId = ServiceId> = {
  id: Id;
  title: string;
  description: string;
  audience: string;
  benefits: string;
  requirements: string;
  steps: string;
};

const loanRequirements = (extra: string) =>
  `Be a member for at least six months, saving regularly
A completed loan application form
A valid ID card (national ID, passport or driving licence)
Guarantors who are members of Sofora
${extra}`;
const loanSteps = (first: string) =>
  `${first}
Fill in the loan application form online or at our office in Bundung
Our loan team reviews your application and may call you to talk it through
Get an answer within 24 to 72 hours
Repay in regular instalments agreed with the loan team`;

export const loans: Product<LoanId>[] = [
  {
    id: "business",
    title: "Business Loan",
    description:
      "This loan product is design to meet the demand of the business community within the Sofora cooperative credit union common bond. Why hassle for finance, its easily accessible with Soforaccu.",
    audience:
      "Traders, shop owners, market vendors, tailors, artisans and anyone in our community who runs a small business or wants to start one. Whether you sell at the market or run a workshop, this loan is built around the way local businesses work.",
    benefits: `Buy stock, tools or equipment when you need them
Expand your shop, stall or workshop
Even out cash flow between busy and quiet seasons
Low interest rates and no extra application charges
Friendly loan officers who understand local business`,
    requirements: loanRequirements("A short description of your business and what the loan is for"),
    steps: loanSteps("Talk to our loan team about your business plans"),
  },
  {
    id: "education",
    title: "Educational Loan",
    description:
      "Sofora cooperative credit union support members with their educational dreams. This person is required to get an invoice from the school he/she intend to pursue his/her education.",
    audience:
      "Members who want to pay school, college or university fees for themselves or their children, or to pay for a training course that builds new skills.",
    benefits: `Pay school fees on time at the start of every term
Cover uniforms, books and other learning materials
Invest in skills training and professional courses
Repay in manageable instalments across the school year`,
    requirements: loanRequirements("An invoice from the school, college or training centre"),
    steps: loanSteps("Get an invoice from the school or training centre"),
  },
  {
    id: "agriculture",
    title: "Agricultural Loan",
    description:
      "Fertilizer and water are important resources for agricultural productivity. Sofora is thinking of you and working towards helping you commercializes your farming activities.",
    audience:
      "Farmers, gardeners and women’s horticulture groups who want to grow more and sell more, from rice and groundnut fields to vegetable gardens.",
    benefits: `Buy seeds, fertilizer and farming tools before the season starts
Pay for water, irrigation and fencing
Move from farming for the family to farming for the market
Repayments planned around your harvest`,
    requirements: loanRequirements("Details of your farm or garden and what you plan to grow"),
    steps: loanSteps("Plan your season and the inputs you need"),
  },
  {
    id: "car",
    title: "Car Loan",
    description:
      "Sofora works with members from diverse background. We served as a link to other members to access affordable means of transportation.",
    audience:
      "Members who need reliable transport for work, family or business, including taxi and transport operators who want a vehicle of their own.",
    benefits: `Buy a car, motorbike or commercial vehicle
Spend less time and money on daily travel
Earn an income with your own taxi or transport business
Affordable repayments spread over time`,
    requirements: loanRequirements("A quotation or pro-forma invoice for the vehicle"),
    steps: loanSteps("Choose your vehicle and get a quotation"),
  },
  {
    id: "personal",
    title: "Personal Loan",
    description:
      "Personal loan is a flexible loan which can be utilize for varying purposes such as naming ceremonies, wedding, travelling etc. The loan is a fit for all purpose and Sofora makes it even more attractive.",
    audience:
      "Any member who needs money for life’s big moments: naming ceremonies, weddings, travel, family events or household needs.",
    benefits: `One flexible loan for almost any personal purpose
Celebrate important family moments without stress
Avoid expensive moneylenders
Clear, fair repayments you agree up front`,
    requirements: loanRequirements("A short note on what the loan is for"),
    steps: loanSteps("Decide how much you need and for what"),
  },
  {
    id: "building",
    title: "Building Loan",
    description:
      "Are you a and need a house to settle with your family worry no more. Contact Sofora cooperative credit union for all your building concerns.",
    audience:
      "Members who want to build a family home, finish a house they have started, or repair and improve the home they live in.",
    benefits: `Build, complete or extend your house
Buy cement, blocks, zinc and other materials
Fix roofs, floors, water and electricity
Long-term repayments suited to building projects`,
    requirements: loanRequirements("Proof of land ownership and a cost estimate for the work"),
    steps: loanSteps("Get a cost estimate for your building work"),
  },
  {
    id: "consumer",
    title: "Consumer Loan",
    description:
      "Why should we cry of hunger or lack of communication when Sofora got you cover.  You can now access to mobile, food stuff and many more at reason prices with flexibility payment mode.",
    audience:
      "Members who want to buy everyday essentials such as food stuff, mobile phones and household items now, and pay for them over time.",
    benefits: `Get food stuff and household goods when you need them
Buy a mobile phone or home appliance
Reasonable prices with flexible payment
Spread the cost instead of paying everything at once`,
    requirements: loanRequirements("A list of the goods you want to buy"),
    steps: loanSteps("Make a list of the goods you need"),
  },
  {
    id: "emergency",
    title: "Emergency Loan",
    description:
      "No one knows what is coming next. Are hit by a natural disaster unexpectedly worry no more Sofora cooperative credit union got you cover.",
    audience:
      "Members facing something unexpected: illness or a hospital bill, a death in the family, a fire, flood or other disaster.",
    benefits: `Fast help when you need it most
Pay urgent medical or funeral costs
Repair damage after a flood, storm or fire
Support from people who know you and your family`,
    requirements: loanRequirements("Any document that explains the emergency, such as a medical bill"),
    steps: loanSteps("Call or visit our office and tell us what happened"),
  },
];

const savingSteps = (first: string) =>
  `${first}
Fill in the membership application form online or at our office in Bundung
Make your first deposit
Keep saving regularly: after six months you can apply for a loan`;

export const savings: Product<SavingId>[] = [
  {
    id: "personal-saving",
    title: "Personal Saving",
    description:
      "Your own savings account to put money aside for school fees, your business, emergencies and the future. Regular saving also builds the base for any loan you need.",
    audience:
      "Any individual who lives or works in our common bond and wants a safe place to save, whether you save a little every day or a larger amount every month.",
    benefits: `Keep your money safe and close to home
Save for school fees, business, family events and emergencies
Your savings are the first step to getting a Sofora loan
Become an owner of the credit union, with a say in how it is run`,
    requirements: `A completed membership application form
A valid ID card (national ID, passport or driving licence)
Two recent passport photos
Your first savings deposit`,
    steps: savingSteps("Visit us or apply online to become a member"),
  },
  {
    id: "group-saving",
    title: "Group & Business Saving",
    description:
      "A shared savings account for kafos, associations, companies and businesses, so your group can save together and grow together.",
    audience:
      "Kafos, women’s groups, youth groups, associations, companies and businesses that want to save money as a group and keep clear records.",
    benefits: `Save together towards shared goals
Keep group money safe instead of in a box or a member’s house
Clear records of what the group has saved
Access to loans for group projects`,
    requirements: `A completed kafo (group) application form
The group’s name, officers and list of members
Valid ID cards for the officers who will sign
Minutes or a letter agreeing to open the account`,
    steps: `Agree as a group to open an account
Fill in the kafo application form online or at our office in Bundung
Bring the officers’ ID cards and the group’s papers
Start saving together`,
  },
  {
    id: "childrens-saving",
    title: "Children’s Saving",
    description:
      "Start a savings account for your child and teach good money habits early, while building up money for their school and their future.",
    audience:
      "Parents and guardians who are members of Sofora and want to save for a child’s education and future.",
    benefits: `Build up money for school fees and uniforms
Teach children the value of saving from a young age
Watch small, regular amounts grow over the years
Give your child a head start in life`,
    requirements: `The parent or guardian must be a Sofora member
The child’s birth certificate
A recent passport photo of the child
A first deposit`,
    steps: `Become a member yourself, if you are not one already
Bring your child’s birth certificate and photo to our office
Open the account in your child’s name
Save regularly for your child’s future`,
  },
  {
    id: "saving-boxes",
    title: "Innovative Saving Boxes",
    description:
      "Lockable savings boxes that help members, especially women in our community, save small amounts every day and bring them to the credit union.",
    audience:
      "Members who earn small amounts each day, such as market vendors, and want an easy way to save a little at a time without the temptation to spend it.",
    benefits: `Save small amounts every day at home or at your stall
The box stays locked until you bring it to the credit union
Build a strong savings habit
Grow your savings and qualify for loans`,
    requirements: `Be a registered member of Sofora
Ask the credit union about available saving boxes`,
    steps: `Ask our staff about getting a saving box
Put money in the box every day
Bring the box to the credit union to be opened and counted
The money is added to your savings account`,
  },
];

// Public address of a product page, e.g. /services/car-loan/.
export function servicePath(id: ServiceId) {
  return `/services/${isLoan(id) ? `${id}-loan` : id}/`;
}
export function isLoan(id: ServiceId): id is LoanId {
  return loans.some((loan) => loan.id === id);
}
// Where the "Apply" button of a product leads.
export function applyPath(id: ServiceId) {
  if (isLoan(id)) return `/loan-application-form/?product=${id}`;
  return id === "group-saving" ? "/kafo-application-form/" : "/membership-application-form/";
}

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
  ["Bakary Bojang", "General Manager", "/images/staff-bakary-bojang.jpg"],
  ["Assan Jarju", "Operation Assistant", "/images/board-modou-lamin-badjie.jpg"],
  ["Fatoumata Jawara", "Operation Assistant", "/images/staff-fatoumata-jawara.jpg"],
  ["Fatoumata Sanneh", "Operation Assistant", "/images/staff-fatoumata-sanneh.jpg"],
  ["Ebrima Jammeh", "Operation & IT Support Assistant", "/images/staff-ebrima-jammeh.jpg"],
];

// Partners page. `logo` and `url` may be empty: no logo shows the name instead, no url makes the card plain.
export type Partner = { name: string; fullName: string; logo: string; url: string };

export const partners: Partner[] = [
  { name: "NACCUG", fullName: "National Association of Cooperative Credit Unions of The Gambia", logo: "/images/partner-naccug.png", url: "http://www.naccug.com" },
  { name: "DSIK", fullName: "Savings Banks Foundation for International Cooperation", logo: "/images/partner-sbfic.png", url: "https://www.sparkassenstiftung.de/en/" },
  { name: "GTUCCU", fullName: "Gambia Teachers Union Co-operative Credit Union", logo: "/images/partner-gtuccu.png", url: "https://gtuccu.gm/" },
  { name: "GPFCCU", fullName: "Gambia Police Force Co-operative Credit Union", logo: "/images/partner-gpfccu.png", url: "https://gpfccu.gm/" },
  { name: "MRCCCU", fullName: "Co-operative credit union", logo: "/images/partner-mrccu.png", url: "" },
  { name: "Medical & Health CCU", fullName: "Medical & Health Co-operative Credit Union", logo: "/images/partner-medical-health.png", url: "" },
  { name: "GAMTEL CCU", fullName: "GAMTEL Co-operative Credit Union", logo: "", url: "https://gsccu.org" },
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
  ["rate-business.svg", "Icon: business loan"],
  ["news-online-enquiry.jpg", "News: online enquiry"],
  ["news-evolution.jpg", "News: evolution of Sofora"],
  ["evolution-1.jpg", "Solidarity group meeting"],
  ["evolution-safiatou-ndey.jpg", "Safiatou and Ndey"],
  ["evolution-2.jpg", "Solidarity group members"],
  ["partners-hero.jpg", "Partners header: joined hands (Unsplash, Iwaria)"],
  ["contact-hero.jpg", "Contact header: members' meeting (Unsplash, Random Institute)"],
  ["gallery-hero.jpg", "Gallery header: market trader (Unsplash, Tunde Buremo)"],
  ["forms-hero.jpg", "Application forms header: filling in a form (Unsplash, Sincerely Media)"],
  ["downloads-hero.jpg", "Downloads header: signing a form (Unsplash, Annie Spratt)"],
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
