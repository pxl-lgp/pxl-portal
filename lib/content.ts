// ---------------------------------------------------------------------------
// PXL — Digital Marketing — complete website copy
// Every section of the site reads its content from this file, so the copy
// can be reviewed, edited, or translated in one place.
// ---------------------------------------------------------------------------

export const company = {
  name: "PXL — Digital Marketing",
  shortName: "PXL",
  tagline: "Marketing that moves the needle — and your bottom line.",
};

// SECTION 1: HERO ------------------------------------------------------------

export const hero = {
  eyebrow: "Full-Service Digital Marketing Agency",
  headlinePrefix: "We Turn Clicks Into",
  headlineRotatingWords: ["Customers.", "Revenue.", "Growth.", "Loyal Fans.", "Results."],
  supportingHeadline:
    "PXL helps ambitious brands and organizations grow through strategy-led marketing, high-performance advertising, and content people actually care about.",
  introduction:
    "We are a full-service digital marketing agency that partners with businesses of every size — from local shops to national brands — to attract more customers, generate qualified leads, and build brands that stand out. Strategy, advertising, content, branding, and web: everything you need to grow, under one roof.",
  valueProposition:
    "One partner. Every channel. Measurable growth. We don't sell marketing activity — we deliver business outcomes you can see in your pipeline and your revenue.",
  primaryCta: "Get Your Free Growth Plan",
  secondaryCta: "Explore Our Services",
  stats: [
    { value: 250, suffix: "+", label: "Brands grown" },
    { value: 1.2, suffix: "M+", decimals: 1, label: "Leads generated" },
    { value: 4.7, suffix: "x", decimals: 1, label: "Average return on ad spend" },
    { value: 98, suffix: "%", label: "Client retention" },
  ],
};

export const marqueeItems = [
  "Social Media Management",
  "Digital Advertising",
  "Content Marketing",
  "Website Solutions",
  "Brand Development",
  "Lead Generation",
  "Conversion Optimization",
  "Performance Reporting",
];

// SECTION 2: COMPANY OVERVIEW ------------------------------------------------

export const about = {
  heading: "A Growth Partner, Not Just an Agency",
  overview:
    "PXL is a full-service digital marketing agency built around a single idea: marketing should grow your business, not just your follower count. We combine strategic thinking, creative excellence, and disciplined data analysis to help brands and organizations acquire customers, increase revenue, and build lasting market presence.",
  mission:
    "To help businesses grow by turning digital marketing into a measurable, reliable engine for leads, customers, and revenue — through strategy, creativity, and relentless optimization.",
  vision:
    "To be the growth partner ambitious brands trust most — known not for the awards on our shelf, but for the results on our clients' balance sheets.",
  philosophy:
    "We believe marketing only matters when it moves the business. That's why every engagement starts with your goals — not our service list. We think like owners, act like partners, and measure ourselves by one standard: did your business grow? Creativity earns attention; data earns decisions; consistency earns trust. We bring all three to every account, every month.",
  values: [
    {
      icon: "target",
      title: "Results Over Vanity",
      description:
        "Likes are nice. Leads, customers, and revenue are better. We optimize for the metrics that pay your bills.",
    },
    {
      icon: "search",
      title: "Radical Transparency",
      description:
        "You'll always know what we're doing, why we're doing it, and exactly what it's delivering. No black boxes, no jargon walls.",
    },
    {
      icon: "handshake",
      title: "Partnership First",
      description:
        "We win when you win. We invest in understanding your business as deeply as you do, and we stay for the long haul.",
    },
    {
      icon: "brain",
      title: "Strategy Before Tactics",
      description:
        "Every post, ad, and page exists for a reason. We never confuse being busy with being effective.",
    },
    {
      icon: "trending",
      title: "Always Improving",
      description:
        "Good enough never is. We test, learn, and refine continuously so your results compound month after month.",
    },
    {
      icon: "sparkles",
      title: "Craft and Care",
      description:
        "We sweat the details — in the copy, the creative, and the customer experience — because details are what audiences remember.",
    },
  ],
  longForm: [
    "Every business we work with has a story that deserves to be heard and a product or service that deserves to be found. Our job is to make that happen — deliberately, measurably, and at scale. We start by understanding your market, your customers, and your goals. Then we build a marketing system designed specifically for your business: the right channels, the right message, the right audience, and the right offers, all working together.",
    "We don't believe in one-size-fits-all packages or set-and-forget campaigns. Markets shift, algorithms change, and customer behavior evolves — so we treat your marketing as a living system that's monitored, tested, and improved every single week. The result is growth that doesn't just spike and fade, but builds momentum over time.",
    "Most importantly, we believe in long-term partnerships. The brands that grow fastest are the ones whose marketing partner truly understands their business — its seasons, its customers, its economics, and its ambitions. That depth of understanding is what we build with every client, and it's why most of our partnerships span years, not months.",
  ],
};

// SECTION 3: SERVICES ---------------------------------------------------------

export interface SubService {
  title: string;
  description: string;
}

export interface Service {
  id: string;
  icon: string;
  name: string;
  shortPitch: string;
  whatItIs: string;
  whyItMatters: string;
  howWeDeliver: string;
  outcomes: string;
  subServices: SubService[];
}

export const servicesIntro = {
  heading: "Everything You Need to Grow, Under One Roof",
  intro:
    "PXL offers a complete suite of digital marketing services — social media management, digital advertising, content marketing, website solutions, and brand development. Whether you need a single specialized service or a fully managed growth program, every engagement is built around your business goals and measured against real outcomes.",
  synergy:
    "Our services are designed to work together as one system. Your brand defines the message. Content brings it to life. Social media builds the audience. Advertising scales the reach. And your website converts that attention into leads and sales. When every channel pulls in the same direction, growth stops being a guessing game and starts being a process.",
};

export const services: Service[] = [
  {
    id: "social-media",
    icon: "share",
    name: "Social Media Management",
    shortPitch: "Build an audience that knows you, likes you, and buys from you.",
    whatItIs:
      "Social media management is the end-to-end planning, creation, publishing, and optimization of your brand's presence on social platforms. It transforms your profiles from quiet placeholders into active channels that attract followers, nurture relationships, and drive customers to your business.",
    whyItMatters:
      "Your customers are on social media every day — researching brands, reading reviews, and deciding who to trust. A consistent, professional, engaging presence builds credibility and keeps your brand top of mind. An inconsistent or absent one quietly sends customers to your competitors.",
    howWeDeliver:
      "We assign your brand a dedicated team that learns your voice, your audience, and your goals. From there we build a content strategy, produce and schedule posts, engage with your community daily, and report on performance monthly — so your social presence grows while you focus on running your business.",
    outcomes:
      "Expect a more professional and consistent brand presence, steady audience growth, stronger engagement, more inbound inquiries, and clear monthly reporting that connects social activity to business results.",
    subServices: [
      {
        title: "Social Media Strategy",
        description:
          "A documented plan that defines which platforms you should be on, who you're talking to, what you'll say, and how success will be measured. Every post that follows has a purpose tied to your business goals.",
      },
      {
        title: "Content Planning",
        description:
          "Monthly content calendars built around your campaigns, promotions, seasons, and audience interests — balancing educational, entertaining, and promotional content so your feed stays valuable, varied, and on-brand.",
      },
      {
        title: "Content Scheduling",
        description:
          "Reliable, consistent publishing at the times your audience is most active. No more gaps, last-minute scrambles, or missed opportunities — your brand shows up on schedule, every time.",
      },
      {
        title: "Community Management",
        description:
          "Daily monitoring and timely, on-brand responses to comments, messages, questions, and reviews. We turn casual followers into engaged fans and make sure no potential customer is left waiting.",
      },
      {
        title: "Audience Growth",
        description:
          "Deliberate tactics — engaging formats, collaborations, hashtags, trends, and paid boosts where appropriate — that attract genuine followers who match your ideal customer profile, not empty numbers.",
      },
      {
        title: "Performance Reporting",
        description:
          "Clear monthly reports covering reach, engagement, follower growth, and traffic to your website — with plain-language insights into what worked, what didn't, and what we're improving next.",
      },
    ],
  },
  {
    id: "advertising",
    icon: "megaphone",
    name: "Digital Advertising",
    shortPitch: "Put your offer in front of the right people — and pay only for performance that matters.",
    whatItIs:
      "Digital advertising is paid promotion across platforms like Facebook and Instagram that places your business directly in front of the audiences most likely to buy. Unlike traditional advertising, every peso spent is trackable — you can see exactly what your ads deliver in leads, sales, and revenue.",
    whyItMatters:
      "Organic reach alone is slow and limited. Paid advertising is the fastest, most controllable way to generate demand: it lets you choose your audience, control your budget, test your message, and scale what works. Done well, it becomes a predictable engine — money in, customers out.",
    howWeDeliver:
      "We manage your campaigns end to end: audience research, creative production, campaign setup, conversion tracking, and continuous optimization. We launch with structured tests, double down on winners, cut losers fast, and report results in terms you care about — cost per lead, cost per sale, and return on ad spend.",
    outcomes:
      "Clients typically see lower cost per lead, higher-quality inquiries, more consistent sales pipelines, and a clear, accountable view of advertising return on investment.",
    subServices: [
      {
        title: "Facebook Advertising",
        description:
          "Full-funnel campaigns on the world's largest ad platform — precise audience targeting, compelling creative, and conversion-focused structure that turns Facebook's massive reach into measurable business results.",
      },
      {
        title: "Instagram Advertising",
        description:
          "Visually-driven campaigns built for how people use Instagram — scroll-stopping creative in feed, stories, and reels that builds brand desire and drives action from highly engaged audiences.",
      },
      {
        title: "Lead Generation Campaigns",
        description:
          "Campaigns engineered to fill your pipeline with qualified prospects — compelling offers, optimized forms, and instant follow-up flows that capture contact details from people genuinely interested in what you sell.",
      },
      {
        title: "Retargeting Campaigns",
        description:
          "Most visitors don't buy on their first visit. Retargeting brings back people who already viewed your products, visited your site, or engaged with your content — typically your highest-converting, lowest-cost audience.",
      },
      {
        title: "Conversion Campaigns",
        description:
          "Campaigns optimized directly for purchases, bookings, and sign-ups — not just clicks. We structure campaigns around the actions that generate revenue and let the data drive budget toward what converts.",
      },
      {
        title: "Campaign Optimization",
        description:
          "Continuous testing of audiences, creative, copy, placements, and bidding. We review performance weekly, reallocate budget to top performers, and refresh creative before fatigue sets in — so results improve over time instead of decaying.",
      },
      {
        title: "Performance Tracking",
        description:
          "Proper pixel and conversion setup from day one, so every lead and sale is attributed correctly. You'll know your exact cost per result and return on ad spend — not estimates, not vanity metrics.",
      },
    ],
  },
  {
    id: "content",
    icon: "pen",
    name: "Content Marketing",
    shortPitch: "Earn trust at scale with content that educates, engages, and converts.",
    whatItIs:
      "Content marketing is the strategic creation of valuable, relevant content — articles, copy, campaigns, and marketing materials — that attracts your ideal customers, answers their questions, and moves them toward a purchase decision.",
    whyItMatters:
      "Modern customers research before they buy. The brand that teaches them, answers their questions, and shows up consistently is the brand they trust when it's time to spend. Great content compounds: it builds authority, fuels your social channels and ads, improves your search visibility, and keeps working long after it's published.",
    howWeDeliver:
      "We start with a content strategy mapped to your customer's journey — what they need to hear at each stage from first discovery to final decision. Then our writers and strategists produce content in your brand voice, on a consistent schedule, with every piece assigned a job: attract, educate, nurture, or convert.",
    outcomes:
      "A stronger brand reputation, more organic traffic and inbound inquiries, better-performing ads and social posts, and a library of assets that keeps generating value for years.",
    subServices: [
      {
        title: "Content Strategy",
        description:
          "A documented plan defining your audiences, themes, formats, channels, and publishing cadence — so every piece of content serves a business purpose and builds toward your growth goals.",
      },
      {
        title: "Copywriting",
        description:
          "Persuasive, conversion-focused copy for ads, landing pages, emails, and promotions — written to capture attention, communicate value clearly, and drive readers to act.",
      },
      {
        title: "Blog Creation",
        description:
          "Well-researched, search-friendly articles that answer the questions your customers are already asking — building your authority, your organic traffic, and your pipeline of informed, ready-to-buy leads.",
      },
      {
        title: "Campaign Content",
        description:
          "Cohesive content packages for launches, promotions, and seasonal pushes — headlines, posts, ads, emails, and pages that tell one consistent story across every channel for maximum impact.",
      },
      {
        title: "Marketing Materials",
        description:
          "Professional brochures, presentations, one-pagers, and sales collateral that equip your team to win — keeping your messaging sharp and consistent everywhere your brand shows up.",
      },
      {
        title: "Brand Messaging",
        description:
          "The foundational language of your brand — your value proposition, key messages, and tone — defined and documented so every customer touchpoint sounds unmistakably like you.",
      },
    ],
  },
  {
    id: "web",
    icon: "globe",
    name: "Website Solutions",
    shortPitch: "Turn your website into your hardest-working salesperson.",
    whatItIs:
      "Your website is where marketing becomes revenue — the place every ad, post, and search result ultimately leads. We design, build, optimize, and maintain websites and landing pages engineered to convert visitors into leads and customers.",
    whyItMatters:
      "You can drive all the traffic in the world, but if your website is slow, confusing, or unconvincing, that traffic — and budget — is wasted. A fast, clear, persuasive website multiplies the return of every other marketing investment you make. User experience isn't a luxury; it's the difference between a visitor who buys and one who bounces.",
    howWeDeliver:
      "We design around your customer's journey: clear messaging, intuitive navigation, fast load times, and persuasive calls-to-action at every step. Every page is built mobile-first, measured with analytics, and improved continuously based on how real visitors actually behave.",
    outcomes:
      "Higher conversion rates, lower cost per lead from every traffic source, a more credible first impression, and a site that reliably turns attention into appointments, inquiries, and sales.",
    subServices: [
      {
        title: "Website Design",
        description:
          "Professional, modern websites built around your customers' needs and your business goals — combining credibility, clarity, and conversion in every page.",
      },
      {
        title: "Landing Page Creation",
        description:
          "Focused, single-purpose pages built for campaigns — one offer, one message, one action. Purpose-built landing pages routinely convert several times better than generic homepages.",
      },
      {
        title: "Website Optimization",
        description:
          "Data-driven improvements to speed, structure, messaging, and calls-to-action — guided by analytics and testing — so a higher percentage of your existing traffic becomes leads and customers.",
      },
      {
        title: "Mobile Responsiveness",
        description:
          "Most of your visitors arrive on a phone. We make sure every page looks sharp, loads fast, and converts smoothly on every screen size — because a frustrating mobile experience is a lost customer.",
      },
      {
        title: "Website Maintenance",
        description:
          "Ongoing updates, security monitoring, backups, and performance care — keeping your site fast, safe, and current so it never becomes a liability while you focus on your business.",
      },
    ],
  },
  {
    id: "brand",
    icon: "palette",
    name: "Brand Development",
    shortPitch: "Become the brand customers remember, prefer, and pay more for.",
    whatItIs:
      "Brand development is the strategic work of defining who you are, what you stand for, and how you show up in the market — your positioning, identity, voice, and story — so customers instantly recognize you and choose you over alternatives.",
    whyItMatters:
      "In crowded markets, products get compared and prices get pressured — but strong brands get chosen. Clear positioning tells customers exactly why you're the right choice. A distinctive, consistent brand builds recognition, trust, and pricing power that no single campaign can buy.",
    howWeDeliver:
      "We run a structured brand process: research into your market and customers, workshops to surface what makes you genuinely different, then development of your strategy, identity, voice, and guidelines — delivered as practical tools your whole team can actually use.",
    outcomes:
      "A brand that's instantly recognizable and consistently expressed everywhere — making every marketing campaign more effective, every sales conversation easier, and your business more valuable.",
    subServices: [
      {
        title: "Brand Strategy",
        description:
          "Your positioning, audience definition, and competitive differentiation — the strategic foundation that determines what your brand says, to whom, and why it wins.",
      },
      {
        title: "Brand Identity",
        description:
          "The visual system that makes you recognizable — logo, colors, typography, and design elements that work beautifully across every platform, from social feeds to storefronts.",
      },
      {
        title: "Brand Voice",
        description:
          "How your brand sounds — its personality, vocabulary, and tone — defined so every caption, email, and page feels like it came from the same confident, consistent character.",
      },
      {
        title: "Brand Guidelines",
        description:
          "A practical playbook documenting your strategy, identity, and voice — so everyone who creates for your brand, inside or outside your company, keeps it consistent and strong.",
      },
      {
        title: "Storytelling",
        description:
          "Your origin, mission, and customer stories crafted into narratives that create emotional connection — because people forget features, but they remember stories.",
      },
      {
        title: "Brand Consistency",
        description:
          "Ongoing stewardship across every touchpoint and campaign. Consistency is what turns a logo into a brand — repetition builds recognition, and recognition builds trust.",
      },
    ],
  },
];

// SECTION 4: WHY CHOOSE US -----------------------------------------------------

export const whyChooseUs = {
  heading: "Why Brands Choose PXL",
  intro:
    "Plenty of agencies can run ads or post on social media. What sets us apart is how we think, how we work, and what we hold ourselves accountable to. Here's what you get when you partner with us — and why it matters to your bottom line.",
  reasons: [
    {
      icon: "target",
      title: "Strategic Approach",
      front: "Every action ladders up to a documented growth strategy.",
      description:
        "We never start with tactics. Every engagement begins with a strategy built on your goals, market, and customers — so every post, ad, and page has a defined job.",
      benefit:
        "Your benefit: no wasted budget on random activity. Every peso works toward a goal you've agreed on, and you always know why we're doing what we're doing.",
    },
    {
      icon: "award",
      title: "Industry Expertise",
      front: "Seasoned specialists across every discipline and dozens of industries.",
      description:
        "Our strategists, media buyers, writers, and designers have grown brands across e-commerce, healthcare, real estate, hospitality, and more — and they bring those hard-won lessons to your account.",
      benefit:
        "Your benefit: you skip the expensive trial-and-error phase. We've already learned what works in markets like yours, on someone else's budget.",
    },
    {
      icon: "chart",
      title: "Data-Driven Decisions",
      front: "Numbers pick the winners. Opinions don't.",
      description:
        "We track everything that matters, test systematically, and let performance data decide where budget and effort go — not hunches, habits, or the loudest voice in the room.",
      benefit:
        "Your benefit: your marketing gets measurably better over time, and you can verify every claim we make in your own dashboards.",
    },
    {
      icon: "messages",
      title: "Transparent Communication",
      front: "You'll always know what's happening and what it's delivering.",
      description:
        "Clear monthly reports in plain language, honest answers when something underperforms, and a team that's genuinely easy to reach. No jargon walls, no hiding behind dashboards.",
      benefit:
        "Your benefit: total confidence in where your budget goes — and a partner who tells you the truth, especially when it's inconvenient.",
    },
    {
      icon: "puzzle",
      title: "Customized Solutions",
      front: "Built for your business — never a recycled template.",
      description:
        "Your market, margins, customers, and goals are unique, so your marketing should be too. We design every strategy, channel mix, and budget plan specifically for your situation.",
      benefit:
        "Your benefit: a plan that fits your actual business and budget — not a one-size-fits-all package where you pay for things you don't need.",
    },
    {
      icon: "refresh",
      title: "Continuous Optimization",
      front: "Launch is the starting line, not the finish line.",
      description:
        "We monitor performance weekly, test relentlessly, refresh creative before it fatigues, and reallocate budget to what's working — every week, every month, without being asked.",
      benefit:
        "Your benefit: results that improve and compound over time, instead of campaigns that spike at launch and quietly decay.",
    },
    {
      icon: "trending",
      title: "Long-Term Growth Focus",
      front: "We optimize for your next three years, not just next month.",
      description:
        "Quick wins matter, but we build marketing systems — brand equity, content libraries, audience assets, and conversion infrastructure — that keep paying you back long after any single campaign ends.",
      benefit:
        "Your benefit: sustainable growth and a business that gets stronger every quarter, rather than a sugar rush of short-term spikes.",
    },
  ],
};

// SECTION 5: OUR PROCESS --------------------------------------------------------

export const process = {
  heading: "How We Take You From First Call to Full Speed",
  intro:
    "Great results aren't an accident — they're a process. Here's exactly what happens when you work with us, step by step, so you always know where we are and what comes next.",
  steps: [
    {
      title: "Discovery & Consultation",
      what:
        "We start with a conversation, not a contract. In your free consultation we learn about your business, your goals, your customers, your past marketing, and what success looks like for you.",
      why:
        "Marketing built on assumptions fails. Marketing built on understanding wins. This is where we make sure we're solving the right problem before we spend a single peso of your budget.",
      benefit:
        "You get clarity on your biggest opportunities — and an honest assessment of whether we're the right fit — before committing to anything.",
    },
    {
      title: "Research & Analysis",
      what:
        "We dig into your market, audit your current digital presence, analyze your competitors, and study your customers — what they want, where they spend time, and what makes them buy.",
      why:
        "The best strategies are built on evidence. Knowing exactly where you stand and what your competitors are doing reveals the gaps and opportunities your strategy will exploit.",
      benefit:
        "You get a clear-eyed picture of your competitive position and the specific opportunities with the highest growth potential.",
    },
    {
      title: "Strategy Development",
      what:
        "We translate the research into a documented growth strategy: target audiences, channel mix, messaging, content plan, budget allocation, timelines, and the specific metrics we'll be accountable for.",
      why:
        "A written strategy aligns everyone — your team and ours — on what we're doing, why, and how success will be judged. It turns marketing from guesswork into a plan.",
      benefit:
        "You get a roadmap you can understand and challenge, with clear targets that make our performance easy to evaluate.",
    },
    {
      title: "Implementation",
      what:
        "Our team gets to work: building campaigns, producing content, designing creative, setting up tracking, and launching across the agreed channels — on schedule and on brand.",
      why:
        "Strategy only creates value when it's executed well. Professional execution — sharp creative, correct tracking, clean setup — is what separates results from excuses.",
      benefit:
        "You get expert execution without hiring an in-house team, while you stay focused on running your business.",
    },
    {
      title: "Monitoring & Optimization",
      what:
        "From the moment campaigns go live, we watch performance daily and optimize weekly — testing audiences, creative, and offers, cutting what underperforms, and scaling what wins.",
      why:
        "Digital marketing is never set-and-forget. Platforms shift, audiences fatigue, competitors react. Continuous optimization is the difference between results that decay and results that compound.",
      benefit:
        "You get steadily improving performance and the confidence that your budget is always flowing to what works best right now.",
    },
    {
      title: "Reporting & Insights",
      what:
        "Every month you receive a clear, honest report: what we did, what it delivered, what we learned, and what we're doing next — in plain language, tied to the metrics you care about.",
      why:
        "You deserve to know exactly what your investment returns. Transparent reporting keeps us accountable and keeps you in control of every decision.",
      benefit:
        "You get full visibility into performance and the insights to make smarter decisions across your whole business — not just marketing.",
    },
    {
      title: "Growth & Scaling",
      what:
        "Once we've found what works, we scale it: increasing budgets behind proven winners, expanding into new channels and audiences, and setting bigger targets for the next phase.",
      why:
        "The biggest returns come after the learning phase. Scaling systematically — guided by data — multiplies results while protecting efficiency.",
      benefit:
        "You get compounding growth with managed risk: bigger results from a system that's already proven it works for your business.",
    },
  ],
};

// SECTION 6: RESULTS AND IMPACT ---------------------------------------------------

export const results = {
  heading: "Results You Can Measure. Impact You Can Feel.",
  intro:
    "We define success the same way you do: more leads, more customers, more revenue, and a stronger brand. Every engagement starts by agreeing on the metrics that matter for your business — then we report against them honestly, every month.",
  howWeMeasure:
    "Before we launch anything, we establish your baseline and define clear targets: cost per lead, conversion rate, return on ad spend, audience growth, engagement, and revenue attributed to marketing. We track them with proper analytics and attribution from day one — so when results come in, you know exactly what drove them.",
  metricsExplained: [
    {
      title: "Lead Generation",
      description:
        "More inquiries, sign-ups, and booked calls from people who match your ideal customer — tracked by source, so you know exactly which campaigns fill your pipeline.",
    },
    {
      title: "Brand Awareness",
      description:
        "Growth in reach, impressions, branded searches, and direct traffic — the measurable signs that more of your market knows who you are and what you stand for.",
    },
    {
      title: "Audience Engagement",
      description:
        "Deeper interaction with your content — comments, shares, saves, and repeat visits — showing your audience isn't just seeing your brand, but connecting with it.",
    },
    {
      title: "Conversion Improvement",
      description:
        "A higher percentage of visitors taking action — buying, booking, or inquiring — so every peso of traffic you pay for produces more revenue.",
    },
    {
      title: "Return on Investment",
      description:
        "The bottom line: revenue generated relative to marketing invested. We report ROI openly, because if your marketing isn't profitable, it isn't working.",
    },
  ],
  exampleStats: [
    { value: 312, suffix: "%", label: "Average increase in qualified leads", sublabel: "within the first 6 months" },
    { value: 4.7, suffix: "x", decimals: 1, label: "Average return on ad spend", sublabel: "across managed ad accounts" },
    { value: 58, prefix: "-", suffix: "%", label: "Average reduction in cost per lead", sublabel: "after optimization phase" },
    { value: 3.2, suffix: "x", decimals: 1, label: "Average audience growth", sublabel: "in the first year of management" },
    { value: 89, suffix: "%", label: "Average engagement increase", sublabel: "across managed social accounts" },
    { value: 2.4, suffix: "x", decimals: 1, label: "Average conversion rate uplift", sublabel: "after website optimization" },
  ],
  disclaimer:
    "Every business starts from a different baseline, and results vary by industry, budget, and offer. What never varies: we set targets up front, measure honestly, and optimize until the numbers move.",
  calculator: {
    heading: "Try Our Growth Calculator",
    subheading:
      "Drag the sliders and see what better marketing could mean for your business. (Estimates for illustration — your free consultation gets you real projections.)",
  },
};

// SECTION 7: INDUSTRIES SERVED -----------------------------------------------------

export const industries = {
  heading: "Strategies Tailored to Your Industry",
  intro:
    "Great marketing isn't generic. Buying journeys, regulations, and customer expectations differ wildly between industries — so your strategy should too. We've grown businesses across all of these sectors, and we adapt our playbook to each one.",
  adaptation:
    "For every industry, we adjust the channel mix, the message, the offer, and the metrics. A healthcare clinic needs trust and compliance; an e-commerce store needs conversion velocity and retention; a startup needs validated positioning before scale. Same rigor, different playbook — always built around how your customers actually buy.",
  list: [
    {
      icon: "cart",
      name: "E-commerce",
      description:
        "Full-funnel growth for online stores: scroll-stopping creative, conversion-optimized product campaigns, retargeting that recovers abandoned carts, and retention strategies that turn one-time buyers into repeat customers.",
    },
    {
      icon: "heart",
      name: "Healthcare",
      description:
        "Patient-focused marketing that builds trust first: educational content, reputation management, and compliant advertising that helps clinics and providers grow bookings while respecting industry regulations.",
    },
    {
      icon: "graduation",
      name: "Education",
      description:
        "Enrollment-driving campaigns for schools, training centers, and course creators: parent- and student-focused messaging, open-house promotion, and lead nurturing that guides families from inquiry to enrollment.",
    },
    {
      icon: "home",
      name: "Real Estate",
      description:
        "Listing and lead campaigns that fill pipelines: hyper-targeted local advertising, property showcase content, and landing pages that convert browsers into booked viewings and qualified buyer inquiries.",
    },
    {
      icon: "store",
      name: "Retail",
      description:
        "Foot-traffic and omnichannel campaigns: local awareness advertising, promotion and event marketing, and social content that keeps your store top of mind when customers are ready to shop.",
    },
    {
      icon: "bell",
      name: "Hospitality",
      description:
        "Booking-focused marketing for hotels, resorts, and restaurants: mouth-watering visual content, seasonal campaigns, review and reputation strategy, and direct-booking funnels that reduce dependence on commission platforms.",
    },
    {
      icon: "briefcase",
      name: "Professional Services",
      description:
        "Authority-building for firms and consultants: thought-leadership content, lead generation campaigns for high-value engagements, and websites that convert credibility into booked consultations.",
    },
    {
      icon: "pin",
      name: "Local Businesses",
      description:
        "Neighborhood domination on a sensible budget: local targeting, community-focused content, review generation, and promotions that make you the obvious first choice in your service area.",
    },
    {
      icon: "rocket",
      name: "Startups",
      description:
        "Growth foundations for new ventures: positioning and brand development, rapid message testing, and lean acquisition campaigns that find product-market fit signals before you scale spend.",
    },
    {
      icon: "star",
      name: "Personal Brands",
      description:
        "Audience and authority growth for founders, experts, and creators: content strategy, platform growth, and monetization funnels that turn your expertise into a durable business asset.",
    },
  ],
};

// SECTION 8: TESTIMONIALS INTRODUCTION -----------------------------------------------

export const testimonials = {
  heading: "Don't Take Our Word for It — Take Theirs",
  supporting:
    "The best measure of an agency isn't what it says about itself; it's what clients say after working together. From local businesses to national brands, the partnerships we build are long-term — and the results speak in their words, not ours.",
  importance:
    "We believe trust is earned through proven results and honest relationships. Most of our growth has come from referrals — clients who hit their goals and told other business owners about it. That only happens when an agency delivers consistently, communicates honestly, and treats every client's budget like its own.",
  placeholder:
    "Your success story could be the next one we tell.",
};

// SECTION 9: FAQ ----------------------------------------------------------------------

export const faq = {
  heading: "Questions? We've Got Answers",
  intro:
    "Everything you're wondering about working with us — answered honestly. Don't see your question? Just ask: hello@pxl.digital",
  items: [
    {
      question: "What services do you offer?",
      answer:
        "We're a full-service digital marketing agency. Our core services are social media management, digital advertising (including Facebook and Instagram ads), content marketing, website solutions (design, landing pages, and optimization), and brand development. You can engage us for a single service or a fully managed growth program where we run your entire digital marketing system. Most clients start with the service that addresses their most urgent goal and expand as results come in.",
    },
    {
      question: "How do you create marketing strategies?",
      answer:
        "Every strategy starts with discovery: your goals, your customers, your market, and your numbers. We then research your competitors and audit your current digital presence to find gaps and opportunities. From there we build a documented strategy covering audiences, channels, messaging, budget allocation, and — critically — the specific metrics we'll be accountable for. You review and approve everything before we execute. No templates, no guesswork: your strategy is built from evidence, for your business specifically.",
    },
    {
      question: "How long does it take to see results?",
      answer:
        "It depends on the service and your starting point, so here's an honest breakdown. Paid advertising generates data within days and typically reaches reliable, optimized performance within 60–90 days as we test and refine. Social media and content marketing build momentum over 3–6 months — they compound rather than spike. Website improvements often show conversion gains within weeks of launch. During your consultation we'll give you a realistic timeline for your specific goals — and we'd rather set honest expectations than impressive ones.",
    },
    {
      question: "Do you offer customized solutions?",
      answer:
        "Yes — exclusively. We don't sell pre-packaged bundles, because your business isn't pre-packaged. Every engagement is scoped around your goals, industry, and budget: the channels that fit your customers, the content that fits your brand, and a budget allocation that fits your economics. As your business evolves, your strategy evolves with it. You'll never pay for services you don't need.",
    },
    {
      question: "How do you measure success?",
      answer:
        "By the metrics that matter to your business — agreed with you before we launch anything. Depending on your goals, that means qualified leads, cost per lead, conversion rates, return on ad spend, revenue attributed to marketing, audience growth, and engagement. We set up proper tracking from day one, report monthly in plain language, and never hide behind vanity metrics. If the needle isn't moving, we'll tell you — and tell you what we're changing.",
    },
    {
      question: "Can you work with businesses in different industries?",
      answer:
        "Yes. We've delivered results across e-commerce, healthcare, education, real estate, retail, hospitality, professional services, local businesses, startups, and personal brands. What makes that possible is our process: deep discovery and research at the start of every engagement means we learn your industry's buying journey, regulations, and customer expectations before we build your strategy. The rigor stays the same; the playbook adapts to your market.",
    },
    {
      question: "What makes your agency different?",
      answer:
        "Three things. First, accountability: we agree on measurable targets up front and report against them honestly — including when results fall short. Second, strategy before tactics: we never start posting or spending until there's a documented plan tied to your business goals. Third, genuine partnership: we keep our client roster deliberately sized so every account gets senior attention, and we measure our success by how long clients stay and how much they grow — not how many logos we collect.",
    },
    {
      question: "How do we get started?",
      answer:
        "Simple: book a free consultation through the contact form below (or email hello@pxl.digital). In that first conversation we'll learn about your business and goals, give you our honest read on your biggest opportunities, and outline what a partnership could look like. If we're a fit, we'll send a customized proposal with clear scope, pricing, and targets. No pressure, no obligation — just a useful conversation about growing your business.",
    },
  ],
};

// SECTION 10: FINAL CALL TO ACTION ------------------------------------------------------

export const finalCta = {
  headline: "Your Competitors Are Marketing Right Now. Let's Out-Market Them.",
  supporting:
    "Every month without a real marketing system is a month of leads, customers, and revenue going somewhere else. You don't need more noise — you need a partner with a plan, the skills to execute it, and the discipline to measure it. That's exactly what we do.",
  consultationInvite:
    "Book a free, no-obligation consultation. We'll review your current marketing, show you your biggest opportunities, and give you an honest read on what's possible — whether you work with us or not.",
  proposalInvite:
    "Prefer to see the plan first? Request a free customized proposal and we'll map out the strategy, scope, and targets we'd recommend for your business.",
  contactEncouragement:
    "Growth starts with a conversation. The next move is yours — and it takes less than a minute.",
  primaryCta: "Book My Free Consultation",
  secondaryCta: "Request a Proposal",
};

// SECTION 11: CONTACT --------------------------------------------------------------------

export const contact = {
  heading: "Let's Talk About Growing Your Business",
  intro:
    "Whether you're ready to start or just exploring your options, we'd love to hear from you. Tell us about your business and your goals, and we'll come back within one business day with honest, useful next steps.",
  invitation:
    "Have a goal in mind — more leads, a stronger brand, a better website, or all of the above? Let's discuss it. The consultation is free, the advice is real, and there's zero obligation.",
  encouragement:
    "No question is too small and no project is too early. If it touches your growth, it's worth a conversation.",
  closing:
    "We're looking forward to learning about your business — and showing you what it could become.",
  email: "hello@pxl.digital",
  phone: "+63 (2) 8888 0000",
  address: "Manila, Philippines — serving clients worldwide",
  formCta: "Send My Message",
  successTitle: "Message sent successfully",
  successBody:
    "Thanks for reaching out — we'll get back to you within one business day. While you wait, why not explore our services?",
};

// FUNNEL PAGE (/get-started) -----------------------------------------------------------------

export const funnel = {
  badge: "Free Growth Plan",
  headline: "Get Your Free Custom Growth Plan",
  subheadline:
    "Answer five quick questions and we'll build a marketing game plan tailored to your business — your biggest opportunities, the channels to focus on, and realistic projections. Free, no obligation, no sales pressure.",
  bullets: [
    { icon: "target", text: "A strategy built around your goals — not a generic package" },
    { icon: "chart", text: "Honest projections based on your budget and market" },
    { icon: "clock", text: "Delivered within 2 business days, yours to keep either way" },
  ],
  startCta: "Start My Free Plan",
  timeHint: "Takes about 60 seconds · No credit card · No spam",
  steps: [
    {
      id: "business",
      question: "What kind of business do you run?",
      hint: "This helps us match strategies that work in your market.",
      options: [
        { value: "ecommerce", icon: "shopping-cart", label: "E-commerce / Online store" },
        { value: "local", icon: "map-pin", label: "Local / Physical business" },
        { value: "services", icon: "briefcase", label: "Professional services" },
        { value: "startup", icon: "rocket", label: "Startup / New venture" },
        { value: "personal", icon: "user", label: "Personal brand / Creator" },
        { value: "other", icon: "ellipsis", label: "Something else" },
      ],
    },
    {
      id: "goal",
      question: "What's your #1 growth goal right now?",
      hint: "Pick the one that matters most — your plan will be built around it.",
      options: [
        { value: "leads", icon: "users", label: "More leads & inquiries" },
        { value: "sales", icon: "circle-dollar", label: "More sales & conversions" },
        { value: "awareness", icon: "megaphone", label: "Brand awareness & audience" },
        { value: "website", icon: "globe", label: "A better website" },
        { value: "unsure", icon: "circle-help", label: "Not sure — show me what's possible" },
      ],
    },
    {
      id: "budget",
      question: "What's your monthly marketing budget?",
      hint: "A ballpark is fine — we'll recommend the best use of it.",
      options: [
        { value: "starter", icon: "wallet", label: "Under ₱25,000" },
        { value: "growth", icon: "trending", label: "₱25,000 – ₱50,000" },
        { value: "scale", icon: "chart", label: "₱50,000 – ₱150,000" },
        { value: "enterprise", icon: "building", label: "₱150,000+" },
        { value: "tbd", icon: "circle-help", label: "Still figuring it out" },
      ],
    },
    {
      id: "timeline",
      question: "How soon do you want to start growing?",
      hint: "No wrong answer — this just helps us prioritize your plan.",
      options: [
        { value: "asap", icon: "fast-forward", label: "As soon as possible" },
        { value: "month", icon: "calendar", label: "Within the next month" },
        { value: "quarter", icon: "calendar-range", label: "In the next 2–3 months" },
        { value: "exploring", icon: "compass", label: "Just exploring for now" },
      ],
    },
  ],
  contactStep: {
    question: "Last step — where do we send your plan?",
    hint: "Your custom growth plan will land in your inbox within 2 business days.",
    submitCta: "Get My Free Growth Plan",
    privacyNote: "We'll only use this to send your plan and follow up once. No spam, ever.",
  },
  recommendations: {
    leads: {
      title: "Lead Generation Engine",
      blurb:
        "Based on your answers, we'd focus on high-intent digital advertising paired with dedicated landing pages — the fastest, most measurable way to fill your pipeline with qualified inquiries.",
      services: ["Digital Advertising", "Landing Page Creation", "Retargeting Campaigns"],
    },
    sales: {
      title: "Conversion Acceleration Plan",
      blurb:
        "Based on your answers, we'd prioritize conversion-focused campaigns and website optimization — turning more of your existing traffic and audience into paying customers before scaling spend.",
      services: ["Conversion Campaigns", "Website Optimization", "Retargeting Campaigns"],
    },
    awareness: {
      title: "Brand & Audience Builder",
      blurb:
        "Based on your answers, we'd build your visibility through consistent social media management and content marketing — growing an audience that knows, likes, and trusts your brand.",
      services: ["Social Media Management", "Content Marketing", "Brand Development"],
    },
    website: {
      title: "High-Converting Web Presence",
      blurb:
        "Based on your answers, we'd start with your website — a fast, credible, conversion-optimized home base that makes every other marketing effort more effective.",
      services: ["Website Design", "Landing Page Creation", "Website Optimization"],
    },
    unsure: {
      title: "Full Growth Audit",
      blurb:
        "No problem — we'd start with a complete audit of your market, competitors, and current presence, then show you exactly where the biggest opportunities are and what to do first.",
      services: ["Research & Analysis", "Strategy Development", "Custom Roadmap"],
    },
  } as Record<string, { title: string; blurb: string; services: string[] }>,
  success: {
    title: "You're all set",
    body:
      "Your answers are in. Our strategists will build your custom growth plan and send it to your inbox within 2 business days. Want to skip the line? Book a free consultation and we'll walk you through it live.",
    bookCta: "Book a Free Consultation",
    homeCta: "Back to the Website",
  },
  trustStrip: ["250+ brands grown", "4.7x average ROAS", "98% client retention"],
};

// LOGIN PAGE (/login) ------------------------------------------------------------------------

export const login = {
  heading: "Welcome back",
  subheading: "Sign in to your PXL client portal to view campaigns, reports, and results.",
  submitCta: "Sign In",
  noAccountText: "Not a client yet?",
  noAccountCta: "Get your free growth plan",
  panelHeadline: "Your growth, all in one place.",
  panelBody:
    "The PXL client portal gives you a live window into everything we're doing for your business — campaign performance, content calendars, reports, and results, updated as they happen.",
  panelPoints: [
    "Live campaign dashboards and spend tracking",
    "Monthly reports and strategy documents",
    "Content calendars and approval queues",
    "Direct line to your account team",
  ],
  securityNote: "Protected with industry-standard encryption. Your data stays yours.",
  noticeTitle: "The client portal is launching soon",
  noticeBody:
    "We're putting the finishing touches on it. If you're an active client, your account manager will email your invite the moment it's live — no action needed.",
  noticeCta: "Not a client yet? Start here",
};

// SECTION 12: FOOTER -----------------------------------------------------------------------

export const footer = {
  summary:
    "PXL is a full-service digital marketing agency helping brands and organizations grow through social media, advertising, content, branding, and web solutions — with strategy at the core and results as the standard.",
  mission: "Turning digital marketing into measurable business growth.",
  brandMessage: "Built on strategy. Proven by results. Driven by your growth.",
  newsletterInvite:
    "Get one short, genuinely useful growth tip in your inbox each week. No spam, no fluff — unsubscribe anytime.",
  newsletterCta: "Subscribe",
  newsletterSuccess: "You're subscribed. Watch your inbox for your first growth tip.",
  footerCta: "Ready to grow? Book your free consultation today.",
  columns: [
    {
      title: "Services",
      links: [
        "Social Media Management",
        "Digital Advertising",
        "Content Marketing",
        "Website Solutions",
        "Brand Development",
      ],
    },
    {
      title: "Company",
      links: ["About Us", "Our Process", "Results", "Industries", "FAQ"],
    },
  ],
};
