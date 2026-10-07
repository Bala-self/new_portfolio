// Single source of truth for every factual claim in this portfolio.
// All values come from the supplied CV. Nothing here is invented.

export const profile = {
  name: "Balakrishnan M",
  role: "MERN Stack Developer",
  location: "Chennai, Tamil Nadu, India",
  shortLocation: "Chennai, Tamil Nadu",
  phone: "+91-9384590539",
  phoneHref: "tel:+919384590539",
  email: "balakrishnan.code@email.com",
  emailHref: "mailto:balakrishnan.code@email.com",
  github: "github.com/Bala-self",
  githubHref: "https://github.com/Bala-self",
  linkedin: "linkedin.com/in/balakrishnan-mariyappan-b43813294",
  linkedinHref:
    "https://www.linkedin.com/in/balakrishnan-mariyappan-b43813294",
  site: "bala-portfolio-psi.vercel.app",
  siteHref: "https://bala-portfolio-psi.vercel.app",
  availability: "Immediate joiner",
  availabilityNote: "Open to on-site roles across Tamil Nadu",
  summary:
    "Results-driven MERN Stack Developer with experience engineering high-performance full-stack applications. Specialized in Node.js, Express.js, MongoDB, React.js, Next.js, Agile methodology, database optimization, and AI engineering workflows.",
};

export const about = {
  headline: "I build systems.",
  lines: [
    "Full-stack applications.",
    "Secure REST APIs.",
    "Responsive interfaces.",
  ],
  pivot: "Robotics → Software.",
  note: "Scalable MongoDB work. React and Next.js frontends. A Robotics and Automation background that moved toward software to build practical systems.",
};

export const work = {
  title: "Independent MERN Stack Developer (Full-Stack)",
  period: "Jun 2026 – Present",
};

export const skillGroups = [
  {
    label: "Frontend",
    items: [
      "React.js",
      "Redux Toolkit",
      "Next.js",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Responsive Design",
      "Server-Side Rendering (SSR)",
    ],
  },
  {
    label: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "RESTful API Design",
      "JWT Authentication",
      "bcrypt",
      "Middleware Architecture",
      "Query Optimization",
    ],
  },
  {
    label: "Database",
    items: ["MongoDB", "Mongoose ODM", "Database Indexing & Caching"],
  },
  {
    label: "DevOps & Tools",
    items: [
      "Git",
      "GitHub",
      "Vercel",
      "Render",
      "Postman",
      "VS Code",
      "Razorpay Payment Integration",
      "Agile Methodology",
    ],
  },
  {
    label: "AI Tools",
    items: ["Claude AI", "GitHub Copilot", "ChatGPT", "Prompt Engineering"],
  },
  {
    label: "Currently Learning",
    items: ["TypeScript", "Next.js 14", "Docker"],
  },
];

export const projects = [
  {
    slug: "billpro",
    index: "01",
    title: "BillPro",
    category: "Billing Software",
    positioning: "GST Billing & Business Management System",
    teaser: "GST billing. Built properly.",
    metric: "16+ secured REST modules",
    stack: [
      "MongoDB",
      "Express.js",
      "React.js",
      "Node.js",
      "JWT",
      "bcryptjs",
      "Helmet",
      "PDFKit",
      "Jest",
      "Supertest",
    ],
    overview:
      "A full-stack MERN GST billing and business management system covering invoicing, inventory and reporting for a small business workflow.",
    problem:
      "Indian small-business billing needs CGST / SGST / IGST handling, discounts and round-off logic that must be correct every single time, with inventory and customer balances that cannot drift out of sync.",
    built: [
      "Full-stack MERN application with CGST / SGST / IGST, discount and round-off logic",
      "16+ secured REST modules: invoices, products, purchases, quotations, customers, employees, reports",
      "JWT authentication, bcryptjs password hashing, Helmet and rate limiting",
      "Backend-validated inventory with stock-movement tracking and customer balance updates",
      "PDFKit invoice generation",
      "Jest + Supertest API tests",
      "MongoDB indexes, pagination and aggregation reports",
    ],
    challenge:
      "Keeping tax, inventory and customer balances consistent. Totals are computed and validated on the server so a client can never post an invoice that silently corrupts stock levels or a customer's running balance; stock movement is tracked as its own trail rather than a mutable number.",
    result:
      "A billing system with 16+ secured REST modules, PDF invoice output, aggregation-driven reports and an API test suite covering the money paths.",
    change:
      "Move the tax and round-off rules into a single shared calculation module consumed by both the API and the test suite, and add typed request validation at the route boundary.",
    links: [],
  },
  {
    slug: "pizza-palace",
    index: "02",
    title: "Pizza Palace",
    category: "Full-Stack Online Food Ordering Platform",
    positioning: "Ordering, authentication and operations",
    teaser: "Orders. Auth. Operations.",
    metric: "JWT · RBAC · 15+ APIs",
    stack: [
      "MongoDB",
      "Express.js",
      "React.js",
      "Node.js",
      "JWT",
      "bcryptjs",
      "RBAC",
    ],
    overview:
      "A MERN online food ordering platform with a customer storefront and an admin order-operations dashboard.",
    problem:
      "An ordering platform is two products at once: a fast storefront for customers and a reliable operations view for staff, both reading the same live order state.",
    built: [
      "MERN application with 50+ menu items and real-time price updates",
      "Cart management with real-time CRUD across 15+ custom API endpoints",
      "JWT authentication, bcryptjs hashing, protected admin routes and role-based access control",
      "Admin order dashboard with Preparing, Out for Delivery and Delivered states",
      "Secure environment variable management",
    ],
    challenge:
      "Order state had to stay trustworthy while both sides act on it. Admin routes sit behind JWT plus role checks, and order transitions are driven from the server rather than from optimistic client state.",
    result:
      "Tested with 100+ concurrent test users, a reported sub-2s page load and a 95+ Lighthouse performance score.",
    change:
      "Replace polling-style refreshes on the admin dashboard with a socket channel, and move order-state transitions into an explicit state machine.",
    links: [],
  },
  {
    slug: "tripadvisor-clone",
    index: "03",
    title: "TripAdvisor Clone",
    category: "Responsive Travel Platform UI",
    positioning: "Travel UI, mobile-first",
    teaser: "Travel UI. Mobile-first.",
    metric: "Responsive · Search · Exploration",
    stack: ["HTML5", "CSS3", "JavaScript (ES6+)", "Flexbox", "Responsive Design"],
    overview:
      "A pixel-perfect, mobile-first recreation of a travel platform homepage, built as a pure front-end craft exercise.",
    problem:
      "Travel platforms carry dense, image-heavy sections that usually collapse badly on small screens and shift layout while loading.",
    built: [
      "Pixel-perfect responsive UI, built mobile-first",
      "470+ lines of custom CSS with cross-browser compatibility",
      "8-section homepage with a dynamic hero search",
      "Category sliders, Flexbox layouts and hover interactions",
    ],
    challenge:
      "Holding the layout still. Sections were sized ahead of their content so that image and slider loading does not reflow the page.",
    result:
      "0 layout shifts in testing and a reported sub-2s load.",
    change:
      "Rebuild the category sliders on CSS scroll-snap with keyboard controls, and move the custom CSS to logical properties.",
    links: [],
  },
];

export const education = {
  degree: "B.E. Robotics & Automation",
  period: "2021–2025",
  college: "Dhanalakshmi Srinivasan Engineering College",
  place: "Perambalur, Tamil Nadu",
  cgpa: "CGPA 7.4",
  classification: "First Class",
};

export const certifications = [
  { name: "The Complete MERN Stack Developer Masterclass", meta: "" },
  { name: "Entry Level Prompt Engineer", meta: "EMC | 2025" },
];

export const languages = [
  { name: "Tamil", level: "Native" },
  { name: "English", level: "Professional Proficiency" },
];

// Scroll timeline. Fixed order, exact ranges.
export const timeline = [
  { id: "home", label: "Home", start: 0.0, end: 0.15 },
  { id: "about", label: "About", start: 0.15, end: 0.3 },
  { id: "skills", label: "Skills", start: 0.3, end: 0.45 },
  { id: "projects", label: "Work", start: 0.45, end: 0.6 },
  { id: "education", label: "Education", start: 0.6, end: 0.75 },
  { id: "contact", label: "Contact", start: 0.75, end: 0.9 },
  { id: "viewer", label: "Viewer", start: 0.9, end: 1.0 },
];
