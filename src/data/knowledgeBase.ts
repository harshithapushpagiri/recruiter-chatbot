import { KnowledgeEntry, ResumeData } from '../types/knowledge';

// This is where you'll add your actual resume data
export const resumeData: ResumeData = {
  personalInfo: {
    name: "Harshitha Pushpagiri",
    title: "Product Manager",
    summary:
      "Product Manager with ~7 years of experience across FinTech, EdTech, Lending, and SaaS. Recognized for delivering AI-powered automation, GenAI prototypes, and scaling high-impact systems that align UX, operations, and business goals. Skilled in building zero-to-one products, credit insights, intelligent automation, and story-driven emotional design.",
    yearsExperience: 7,
    location: "India"
  },
  experience: [
    {
      company: "Paytm (One97 Communications)",
      role: "Product Manager – Lending Business",
      duration: "May 2022 – Mar 2024",
      achievements: [
        "Revamped CIR, resulting in 70% lift in report pulls and 3.75x daily impressions.",
        "Launched 'What's Changed' feature to drive retention, doubling engagement.",
        "Enabled 1-click credit report pulls with 85% cost reduction and 50% faster response.",
        "Deployed pre-approved credit offers using dynamic credit policies, boosting sign-ups 4x and disbursals 1.2x.",
        "Owned credit underwriting engine with 150+ policy interventions for merchant loans.",
        "Improved approval rates ~5% using multi-bureau fallback risk policies.",
        "Built contextual user journeys and credit insight layers for lending personalization."
      ],
      technologies: ["Credit Risk", "FinTech", "Product Analytics", "APIs", "Bureau Data"]
    },
    {
      company: "TalentGum",
      role: "Product Manager",
      duration: "Sep 2024 – May 2025",
      achievements: [
        "Designed AI-powered Parent Support Chatbot, reducing onboarding ops load by 40%.",
        "Built Slot Recommendation Engine, improving batch utilization by 38%.",
        "Ran A/B tests that led to 18% boost in lead-to-demo conversions.",
        "Redesigned Student Dashboard with gamification, progress tracking, upsells, and feedback loops.",
        "Streamlined curriculum-driven live class automation, reducing planning overhead by 40%.",
        "Created Special Slot Approval System to reduce teacher no-shows by 80%.",
        "Revamped analytics stack (GTM + GA4), enabling data-informed product decisions."
      ],
      technologies: ["SaaS", "EdTech", "CX Automation", "Scheduling Logic", "Analytics"]
    },
    {
      company: "Freelance / AI Projects",
      role: "Product Manager – AI Initiatives",
      duration: "Apr 2025 – Present",
      achievements: [
        "Built Recruiter Chatbot using GPT, embeddings, Pinecone, and n8n for real-time Q&A.",
        "Created Feedback Analyzer for churn detection, feature asks, and CX signals.",
        "Developed BiasHunter AI to detect media bias using tone, framing, and factual drift.",
        "Launched GenAI storytelling engine 'Stories of Life' for emotionally adaptive stories.",
        "Shipped MVP for 2-sided matching platform with auth, RFP, and role-based access via Bolt.",
        "Designed credit insights system using explainable scoring and user context."
      ],
      technologies: ["LangChain", "OpenAI", "Pinecone", "Supabase", "Bolt", "n8n"]
    },
    {
      company: "Mercedes Benz",
      role: "Product Engineer",
      duration: "Nov 2018 – Jul 2020",
      achievements: [
        "Delivered 120+ system models and implemented simulation automation.",
        "Monitored 10+ critical issues and initiated digital trackers, saving 30% team effort.",
        "Improved traceability by 45% across 5 teams through enhanced review processes.",
        "Represented 16-member team in audit and improved documentation compliance."
      ],
      technologies: ["Model-Based Dev", "Automotive Simulation", "Process Automation"]
    },
    {
      company: "Tata Consultancy Services",
      role: "Systems Engineer",
      duration: "Jul 2016 – Nov 2018",
      achievements: [
        "Developed 250+ integrated models and tools reducing defect rates and turnaround by 40%.",
        "Automated model development cycle from 1000h to 80h; received client award.",

      ],
      technologies: ["Embedded Systems", "Diagnostics", "Quality Assurance"]
    },
    {
      company: "Philips India",
      role: "Product Marketing Intern",
      duration: "Apr 2021 – Jun 2021",
      achievements: [
        "Led 20+ interviews to identify digital gaps in CapEx MedTech adoption.",
        "Proposed 2-year product roadmap with 5+ recommendations for transformation."
      ],
      technologies: ["Product Research", "Healthcare GTM", "Roadmapping"]
    }
  ],
  skills: {
    technical: [
      "LangChain",
      "Prompt Engineering",
      "Embeddings",
      "OpenAI API",
      "Pinecone",
      "Supabase",
      "n8n",
      "SQL"
    ],
    product: [
      "Product Strategy",
      "CX Automation",
      "User Research",
      "A/B Testing",
      "Data Analysis",
      "PRD Writing"
    ],
    leadership: [
      "Stakeholder Management",
      "Team Leadership",
      "Project Management",
      "Cross-functional Alignment"
    ]
  },
  projects: [
    {
      name: "Feedback Analyzer",
      description: "LLM-based analyzer for parsing user feedback to extract churn signals, feature requests, and pain points.",
      impact: "Delivered actionable CX insights across product & support functions; enabled proactive churn intervention.",
      technologies: ["LangChain", "OpenAI", "Churn Detection", "Sentiment Analysis", "Clustering"],
      deploymentLink: "https://client-pulse-ai.vercel.app/"
    },
    {
      name: "Recruiter Chatbot",
      description: "Built GPT + Embeddings chatbot to answer questions about resume, projects, and skills.",
      impact: "Enabled real-time recruiter interaction with ~90% precision.",
      technologies: ["OpenAI", "SemanticSearch", "Bolt", "Supabase", "Embeddings"],
      deploymentLink: "https://recruiter-chatbot.vercel.app/"
    },
    {
      name: "MVP for 2-sided Match Platform",
      description: "MVP for a role-based access system supporting onboarding of service seekers & service providers, auth, RFP creation, and response sync.",
      impact: "Launched secure, scalable 2-sided workflow to connect service seekers with service providers; deployed via Bolt.",
      technologies: ["Role-Based Access", "RFP Flow", "PostgreSQL", "SaaS", "MVP"]
    },
    {
      name: "GenAI Story Engine – Stories of Life",
      description: "Trait-based storytelling engine for children, integrating emotional tone and narration.",
      impact: "Built emotionally engaging stories with high personalization.",
      technologies: ["OpenAI", "Trait Input", "Narration Control", "Emotion Tagging"],
      deploymentLink: "https://new-stories-of-life.vercel.app/"
    }
  ]
};

// This is your comprehensive Q&A knowledge base
// Add your actual questions and answers here
export const knowledgeBase: KnowledgeEntry[] = [
  // Greeting responses
  {
    id: "greeting_hi",
    question: "Hi / Hello / Hey / Good morning / Good afternoon / Good evening / Good night",
    answer: "Hello! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. How can I help you today?",
    category: "general_questions",
    keywords: ["Hi", "Hello", "Hey", "Good morning", "Good afternoon", "Good evening", "Good night", "Greeting", "Introduction","Icebreaker"],
    timePeriod: null,
    organization: null,
    relevance: "Greeting, Introduction, Icebreaker, Chat Start"
  },
  {
    id: "greeting_how_are_you",
    question: "How are you / How are you doing / How's it going",
    answer: "I'm doing well, thank you for asking! I'm excited about new opportunities and always eager to discuss how my experience in product management, AI automation, and building scalable systems can add value to the right team. What would you like to know about my background?",
    category: "general_questions",
    keywords: ["How are you", "How are you doing", "How's it going", "Greeting"],
    timePeriod: null,
    organization: null,
    relevance: "Greeting, Personal, Icebreaker, Chat Start"
  },
  
  // Salary and interview scheduling redirects
  {
    id: "salary_compensation",
    question: "What are your salary expectations / compensation / package / CTC / expected salary",
    answer: "I'd be happy to discuss compensation details directly. Please feel free to reach out to me at harshithap20@iimb.ac.in or call me at +91 8985662239 to discuss this further. I'm open to having a detailed conversation about compensation based on the role and responsibilities.",
    category: "general_questions",
    keywords: ["Salary", "Compensation", "Package", "CTC", "Expected salary", "Money", "Pay"],
    timePeriod: null,
    organization: null,
    relevance: "Salary, Compensation, Remuneration"
  },
  {
    id: "interview_scheduling",
    question: "Can we schedule an interview / interview time / when can we meet / availability / schedule a call",
    answer: "I'd love to schedule an interview with you! Please reach out to me directly at harshithap20@iimb.ac.in or call me at +91 8985662239 to coordinate our schedules. I'm flexible with timing and would be happy to discuss the role and how I can contribute to your team.",
    category: "general_questions",
    keywords: ["Interview", "Schedule", "Meeting", "Availability", "Call", "Time", "Appointment", "Connect"],
    timePeriod: null,
    organization: null,
    relevance: "Interview, Scheduling, Contact"
  },
  {
    id: "contact_connect",
    question: "How can we contact you / connect with you / reach out / get in touch",
    answer: "You can reach me directly at harshithap20@iimb.ac.in or call me at +91 8985662239. I'm always happy to connect and discuss opportunities, answer questions about my experience, or explore how I can contribute to your organization.",
    category: "general_questions",
    keywords: ["Contact", "Connect", "Reach out", "Get in touch", "Email", "Phone"],
    timePeriod: null,
    organization: null,
    relevance: "Contact, Communication"
  },

  // Updated responses to use first person
  {
    id: "d5ccfbc3",
    question: "Tell me about yourself",
    answer: "I have ~7 years of overall experience, including 3 years in product management roles across EdTech, FinTech, Lending, and SaaS. I specialize in building automation-led features, simplifying complex user journeys, and driving measurable improvements in engagement and operational efficiency.\n\nAt TalentGum, I most recently led initiatives to enhance parent support systems and optimize batch utilization. My approach is rooted in solving real problems at scale — combining user empathy with data to build human-centered, outcome-driven products.",
    category: "general_questions",
    keywords: ["Introduction", "Overview", "Product Management", "About yourself", "Background"],
    timePeriod: null,
    organization: null,
    relevance: "Intro, Strengths"
  },
  {
    id: "95a18811",
    question: "Summary of experience at Paytm",
    answer: "At Paytm, I owned multiple lending product initiatives. I pioneered personalized credit insights, launched a pre-approved offer engine, and revamped the CIR report UX. My efforts resulted in a 2X increase in user retention, 4X sign-ups, and 1.2X increase in loan disbursals. I also optimized credit report pulls to cut costs by 85%. I led 150+ risk policy interventions across lenders.",
    category: "experience",
    keywords: ["Fintech", "Lending", "Product Strategy", "Paytm", "Why should we hire you"],
    timePeriod: "May 2022 - Mar 2024",
    organization: "Paytm",
    relevance: "Experience, Strategy, Why should we hire you"
  },
  {
    id: "dddbdf72",
    question: "CIR Report Revamp",
    answer: "Problem: CIR (Credit Information Report) was underutilized - users found it too complex and lacked contextual guidance to understand or act on it.\n\nSolution: I led a UX and product revamp of the CIR, adding personalized credit health nudges, simplified visuals, and actionable insights tailored to the user's credit stage.\n\nChallenges: Working within regulatory bounds while reinterpreting technical data for user-friendly presentation; aligning multiple stakeholders across legal, design, and data.\n\nMetrics/Impact:\n✅ 3.75x increase in daily CIR impressions\n✅ 70% increase in report pulls\n✅ Higher credit feature discovery (post-view)\n\nLessons Learned: Simplifying doesn't mean dumbing down - it means translating complexity into clarity. Good UX is product strategy in disguise.",
    category: "projects_&_impact",
    keywords: ["Analytics", "Biggest achievement", "Fintech", "Greatest achievement", "Proud work", "UX", "CIR"],
    timePeriod: "Jun 2022 - Jan 2023",
    organization: "Paytm",
    relevance: "Analytics, Biggest Achievement, Greatest Achievement, Product Thinking, Proud work, Strengths, UX"
  },
  {
    id: "d34ab3e5",
    question: "Pre-approved Offer Generation",
    answer: "I implemented a pre-approved offer generation engine at Paytm using credit and risk policies across multiple lending products. This resulted in a 4X increase in sign-ups and 1.2X rise in disbursals.",
    category: "projects_&_impact",
    keywords: ["Biggest achievement", "Fintech", "Greatest achievement", "Lending", "Personalization", "Proud work"],
    timePeriod: "Jun 2022 - Jan 2023",
    organization: "Paytm",
    relevance: "Biggest Achievement, FinTech, Greatest Achievement, Lending, Personalization, Proud work, UX"
  },
  {
    id: "261c9531",
    question: "Merchant Loans",
    answer: "At Paytm, I led critical parts of our merchant lending platform. I managed the credit underwriting engine and implemented 150+ dynamic risk interventions across lenders. I introduced a multi-bureau fallback logic to improve approval rates and reduce rejection latency. One of the more complex workflows I designed was a loan transfer feature that automated internal policy enforcement, allowed flexible tenures, and significantly eased operations through an internal recommendation engine.",
    category: "projects_&_impact",
    keywords: ["Fintech", "Lending", "Risk Policies"],
    timePeriod: "Sep 2023 - Mar 2024",
    organization: "Paytm",
    relevance: "Lending, Product Execution, Risk Strategy"
  },
  {
    id: "bd6758a6",
    question: "Summary of experience at TalentGum",
    answer: "At TalentGum, I led multiple high-impact product initiatives. I designed and aligned stakeholders on a Parent Support Chatbot, reducing ops load by 40%. I also spearheaded a Slot Recommendation Engine that improved batch utilization by 38% across time zones. Other contributions include a Student Dashboard revamp to boost engagement, special-slot approval automation to improve conducted classes reliability by 80%, and GA4-GTM analytics overhaul for better decision-making.",
    category: "experience",
    keywords: ["Automation", "Chatbot", "EdTech", "UX", "TalentGum", "Why should we hire you"],
    timePeriod: "Sep 2024 - May 2025",
    organization: "TalentGum",
    relevance: "Achievements, Customer Support, Experience, Why should we hire you"
  },
  {
    id: "7237367b",
    question: "Parent Support Chatbot",
    answer: "Problem: TalentGum's support team was overwhelmed by repeat queries from parents - scheduling issues, demo reminders, platform access, and class feedback were consuming valuable ops time.\n\nSolution (Planned): I scoped and designed a parent-facing WhatsApp chatbot powered by Freshdesk, with dynamic API fetches to handle live data on demo slots, child progress, and batch schedules. The goal was to automate high-volume queries while improving self-service for parents.\n\nChallenges: The hardest part was not technical - it was strategic. Just as the build phase was about to begin, the company shifted focus to other growth priorities, and this initiative was paused.\n\nImpact (If Executed): Projected to reduce ops query volume by 40% and improve parent satisfaction through faster, on-demand answers.\n\nLessons Learned: Even when a project doesn't go live, driving clarity on 'what to build and why' is product leadership. I gained experience aligning implementation with support pain points and how to gracefully handle pivots.",
    category: "projects_&_impact",
    keywords: ["Chatbot", "Customer Support", "EdTech"],
    timePeriod: "Jan 2025 - Feb 2025",
    organization: "TalentGum",
    relevance: "Chatbot, Customer Support"
  },
  {
    id: "b232ed91",
    question: "Slot Recommendation Engine",
    answer: "Problem: Many batches at TalentGum were underfilled due to manual slot allocation, timezone conflicts, and inconsistent grouping based on age and level — leading to high operational overhead and poor utilization.\n\nSolution: I designed a Slot Recommendation Engine that auto-matched students into optimal batches based on age group, curriculum level, timezone compatibility, and session history — enforcing grouping logic and curriculum continuity.\n\nChallenges: Handling conflicting student preferences while maintaining batch logic integrity, edge cases with special requests, and ensuring dynamic batch creation worked across 24/7 time zones.\n\nMetrics/Impact:\n✅ 38% increase in batch utilization\n✅ 20% reduction in scheduling-related support queries\n✅ 50% faster onboarding for new students\n\nLessons Learned: Designing for scale isn't just about automation — it's about ensuring logic holds across real-world constraints, especially in a global, always-on learning environment.",
    category: "projects_&_impact",
    keywords: ["Automation", "EdTech", "Recommendation Engine", "Scheduling"],
    timePeriod: "Mar-25",
    organization: "TalentGum",
    relevance: "Automation, Product Thinking"
  },
  {
    id: "628a3119",
    question: "Student Dashboard Revamp",
    answer: "Problem: The original student dashboard at TalentGum lacked meaningful visibility into class schedules, progress tracking, and session continuity - leading to high dependency on support and reduced learner motivation.\n\nSolution (Planned): I spearheaded a complete redesign of the student dashboard to make learning journeys visible, intuitive, and motivational. I defined key experience goals, wrote the PRD, collaborated with design to visualize session progress and milestones, and aligned with ops and academics on backend logic for certificate unlocking, feedback capture, and class status displays.\n\nChallenges: This was a cross-functional UX-heavy revamp that required careful prioritization of features for both students and parents. After full stakeholder buy-in, the project was paused due to strategic shifts in roadmap focus.\n\nImpact (If Executed): Projected to reduce session-related support queries by 30% and improve learner engagement through milestone visibility and gamified feedback.\n\nLessons Learned: Shipping is one part of product success but structured thinking, PRD clarity, and stakeholder orchestration are equally critical. This project taught me how to scope UX-led revamps and adapt gracefully to shifting priorities while preserving momentum.",
    category: "projects_&_impact",
    keywords: ["Dashboard", "EdTech", "Engagement", "Gamification", "UX"],
    timePeriod: "Dec-24",
    organization: "TalentGum",
    relevance: "Engagement, UI"
  },
  {
    id: "00dcb50f",
    question: "Special Slot Scheduling",
    answer: "Problem: Teachers at TalentGum had non-regular (special) slots reserved for specific students, but these were often misused or overbooked, leading to confusion, no-shows, and scheduling inefficiencies.\n\nSolution: I designed a rules-based scheduling framework that enforced eligibility checks, reserved slots for specific students only, and automatically released unused slots after a fixed window.\n\nChallenges: Mapping existing ad-hoc slot logic into a scalable, rule-driven system while accounting for hold periods, grace windows, and exceptions due to timezone mismatches.\n\nMetrics/Impact:\n✅ 80% reduction in special slot misuse\n✅ 3x faster support resolution for schedule conflicts\n✅ Higher parent satisfaction due to predictable class timings\n\nLessons Learned: Operational friction often hides in edge cases - designing a system that reflects real-world messiness (and doesn't overfit to ideal logic) was key to adoption and impact.",
    category: "projects_&_impact",
    keywords: ["Automation", "EdTech", "Teacher Scheduling"],
    timePeriod: "Apr-25",
    organization: "TalentGum",
    relevance: "Automation, Ops, Scheduling"
  },
  {
    id: "943013be",
    question: "GTM + GA4 Setup",
    answer: "At TalentGum, I led the setup of a robust analytics framework using Google Tag Manager and GA4. This wasn't just about implementation - I worked closely with marketing to map the full user journey across landing pages, forms, and dashboards. The insights allowed us to identify drop-off points, run conversion A/B tests, and align product changes with actual user behavior. It became a foundational system for all future experiments.",
    category: "projects_&_impact",
    keywords: ["Analytics", "Tag Management", "User Behavior"],
    timePeriod: "Mar-25",
    organization: "TalentGum",
    relevance: "Data-Driven Decisions, Measurement"
  },
  {
    id: "ee8bc366",
    question: "Stories of Life - AI Storytelling Platform",
    answer: "Stories of Life is a personal side project (featured in Lenny Newsletter) where I created an AI-powered storytelling platform to deliver emotionally rich, culturally grounded tales for children. It includes multilingual narration, personalized story generation, and a soothing audio-first experience.",
    category: "side_projects",
    keywords: ["AI", "Children", "MVP", "NLP", "Storytelling"],
    timePeriod: "Apr-25",
    organization: "Stories of Life",
    relevance: "AI, Side Project, Storytelling"
  },
  {
    id: "5df5c1b8",
    question: "AI Recruiter Chat Assistant - Notion + n8n",
    answer: "I built an AI-powered recruiter assistant using OpenAI, Notion, and n8n. The system semantically matches recruiter questions with relevant answers from my portfolio, simulating real-time conversations and providing an always-on personal assistant.",
    category: "side_projects",
    keywords: ["AI", "Automation", "Chatbot", "Recruiting", "n8n"],
    timePeriod: "May-25",
    organization: "AI Recruiter Assistant",
    relevance: "Automation, Recruiting, Side Project"
  },
  {
    id: "d9b5bd44",
    question: "Client Feedback Analyzer: Structuring Chaos into Clarity with LLMs",
    answer: "Problem: Customer feedback is often scattered across emails, calls, and tickets - rarely structured or actionable. CX and product teams waste time triaging instead of acting.\n\nSolution: I built a lightweight LLM-powered tool that transforms unstructured feedback into clear insights. The interface extracts pain points, feature requests, churn risks, and an AI-generated response playbook. It requires no training, tagging, or database - just input and insight.\n\nChallenges: Designing prompts that reliably output multi-section summaries. Balancing output completeness vs verbosity. Avoiding hallucinations without grounding. Also focused on making outputs feel 'triage-ready' for PMs and CX teams.\n\nMetrics/Impact:\n✅ ~10x faster analysis of support logs for prioritization\n✅ Used by CX to score feedback urgency & risk without spreadsheets\n✅ Built in <1 week with zero backend infrastructure\n\nLessons Learned: Prompt-first tools can be powerful if you treat LLMs like collaborators, not black boxes. This project sharpened my ability to coax structured thinking from LLMs and deliver fast value with minimal system overhead.",
    category: "side_projects",
    keywords: ["AI Tools", "CX Enablement", "Feedback Loop", "Generative AI", "Internal Product", "LLM Prompts", "NLP Tools", "Sentiment Analysis", "Text Analytics"],
    timePeriod: "Jun-25",
    organization: "Independent (Personal Project)",
    relevance: "AI Copilot Tools, Automation, Feedback Analytics, Internal Ops, Light Weight AI Uitility, Prompt Design"
  },
  {
    id: "c9750eb7",
    question: "Two-Sided SaaS Recommendation Platform: Verified RFP Workflows for B2B Discovery",
    answer: "Problem: B2B companies struggle to find the right service providers through outdated methods - cold outreach, biased directories, or vague referrals with no transparency or secure collaboration during RFP workflows.\n\nSolution: I built an MVP of a two-sided SaaS platform where service seekers and providers can connect via invite-only workspaces. Seekers create verified company profiles, submit RFPs, and collaborate internally. Providers respond with proposals. A Super Admin layer ensures compliance, profile verification, and deal handover monitoring.\n\nChallenges: Designing role-based access flows, auto-verification gating, and end-to-end RFP workflows while ensuring secure edit rights and progressive feature unlocking. Simulated enterprise-grade process compliance using Supabase RLS and low-code logic.\n\nMetrics/Impact:\n✅ Built in <4 weeks with full company-level access control\n✅ Real-time RFP submission and matching logic in place\n✅ Scalable structure for adding contracts, escrow, or ratings later\n\nLessons Learned: MVPs with multi-role logic demand precise control over what each user can do and when. This project deepened my understanding of gating workflows, data integrity, and simulating complex compliance without overbuilding.",
    category: "mvp",
    keywords: ["Access Control", "B2B MarketPlace", "RFP", "Role-Based Access", "SaaS", "Verification"],
    timePeriod: "May 2025 (Ongoing)",
    organization: "Personal Project",
    relevance: "Marketplace Design, Role-Based Access, SaaS, SaaS MVP's, Trust Layers"
  },
  {
    id: "10bef082",
    question: "Prompt Engineering Experience",
    answer: "I have hands-on experience in Prompt Engineering, particularly around structured system prompts, semantic matching, and context-rich prompt chains. This was applied in my AI recruiter chatbot, RAG-based recommendation engine, and children's story generator.",
    category: "skills",
    keywords: ["AI", "NLP", "Prompting"],
    timePeriod: "2024 - 2025",
    organization: "Multiple Projects",
    relevance: "AI, Prompt Engineering"
  },
  {
    id: "b71f3b1d",
    question: "My Strengths as a Product Manager",
    answer: "My strengths lie in translating ambiguity into clarity, balancing user empathy with business goals, and delivering data-informed, automation-led solutions. I excel in stakeholder alignment, execution under constraints, and iterative discovery.",
    category: "general_questions",
    keywords: ["Leadership", "Problem Solving", "Strengths"],
    timePeriod: null,
    organization: null,
    relevance: "Strength"
  },
  {
    id: "4ad0bc11",
    question: "Why I pursued an MBA",
    answer: "I pursued an MBA at IIM Bangalore to sharpen my business acumen, explore product strategy, and work at the intersection of technology and impact. It helped me pivot from engineering to product management and gain strong cross-functional and GTM capabilities.",
    category: "education",
    keywords: ["Career Growth", "MBA"],
    timePeriod: "2020 - 2022",
    organization: "IIM Bangalore",
    relevance: "Career Journey, Education"
  },
  {
    id: "3007fd45",
    question: "Why did you transition from engineering to product management?",
    answer: "While working in engineering roles at TCS and Mercedes Benz, I often found myself gravitating toward problem-solving at the product and user level. I enjoyed asking 'why' before 'how,' and wanted to contribute to strategy, user experience, and value creation. My MBA at IIM Bangalore gave me the perfect platform to pivot into product management and formalize this transition.",
    category: "general_questions",
    keywords: ["Career Journey", "Engineering to PM", "Transition"],
    timePeriod: null,
    organization: null,
    relevance: "Career Journey"
  },
  {
    id: "06b5c59c",
    question: "Why did you leave your last role?",
    answer: "My recent role at TalentGum was part of an exciting growth phase, but due to company restructuring, my position was impacted. I'm now looking for the next opportunity where I can bring my expertise in AI, automation, and user-centric product design to solve meaningful problems at scale.",
    category: "general_questions",
    keywords: ["Career Move", "Motivation", "TalentGum"],
    timePeriod: "2025",
    organization: "TalentGum",
    relevance: "Career Move, Motivation"
  },
  {
    id: "782e9b04",
    question: "What are you looking for in your next role?",
    answer: "I'm looking for a product role where I can drive impact through AI, automation, or user experience innovation. I'm particularly looking for companies who are building thoughtful, technically robust solutions with cross-functional ownership and learning opportunities.",
    category: "general_questions",
    keywords: ["Career Aspiration", "Motivation"],
    timePeriod: null,
    organization: null,
    relevance: "Motivation"
  },
  {
    id: "c362b57f",
    question: "How do you handle ambiguity in product development?",
    answer: "I thrive in ambiguity by first identifying the knowns vs. unknowns and turning open-ended problems into structured learning loops. I validate assumptions through data, user interviews, and quick experiments. This approach helps break down complexity into clear next steps for the team.",
    category: "pm_mindset",
    keywords: ["Ambiguity", "Decision Making", "Problem Solving"],
    timePeriod: null,
    organization: null,
    relevance: "Ways of Working"
  },
  {
    id: "8fbba3e3",
    question: "What's your approach to product prioritization?",
    answer: "I use a mix of impact vs. effort analysis, OKR alignment, and urgency of user problems to prioritize features. I also consider technical dependencies, opportunity cost, and qualitative feedback to build a balanced roadmap that adapts to learnings.",
    category: "pm_mindset",
    keywords: ["Frameworks", "PM Skills", "Prioritization"],
    timePeriod: null,
    organization: null,
    relevance: "Ways of Working"
  },
  {
    id: "d16c1b0c",
    question: "Short Introduction",
    answer: "I'm Harshitha, a Product Manager with 7 years of experience across EdTech, FinTech, and SaaS. I specialize in automation-led product design, AI-driven features, and enhancing UX to deliver business results. I've led impactful products at Paytm and TalentGum and am now excited for my next opportunity.",
    category: "general_questions",
    keywords: ["Elevator Pitch", "Introduction"],
    timePeriod: null,
    organization: null,
    relevance: "Intro"
  },
  {
    id: "0cc0f6d0",
    question: "Walk me through your profile (Detailed)",
    answer: "I started my career in engineering roles at TCS and Mercedes, building automation tools and system models. After pursuing my MBA at IIM Bangalore, I transitioned into Product Management at Paytm where I led credit product initiatives including personalized insights and lending automation. At TalentGum, I focused on EdTech problems, designing parent support chatbot, optimizing batch allocation, and revamping the student dashboard. Across roles, I've driven measurable impact through user-centric automation and data-driven iteration.",
    category: "general_questions",
    keywords: ["Career Overview", "Introduction"],
    timePeriod: null,
    organization: null,
    relevance: "Career Journey, Intro"
  },
  {
    id: "378c9d60",
    question: "How do you stay updated & grow as a PM?",
    answer: "I actively follow product communities, experiment with side projects, and take part in AI, NLP, and prompt engineering trends. I also listen to podcasts like Lenny's and build hands-on with tools like GPT, GA4, and n8n. Learning by building is my core mantra.",
    category: "vision_&_learning",
    keywords: ["Growth", "Learning", "PM Skills"],
    timePeriod: null,
    organization: null,
    relevance: "Growth, Learning"
  },
  {
    id: "6cab953e",
    question: "How do you approach building for EdTech vs FinTech vs SaaS?",
    answer: "In EdTech, I prioritize engagement, learning outcomes, and parental trust. In FinTech, regulatory compliance, risk management, and user trust are key. For SaaS, I focus on scalability, modular design, and customer success metrics. Each domain demands unique sensitivity to user behavior, legal boundaries, and business models.",
    category: "pm_mindset",
    keywords: ["EdTech", "Fintech", "Product Strategy", "SaaS"],
    timePeriod: null,
    organization: null,
    relevance: "Product Thinking"
  },
  {
    id: "03fbb3aa",
    question: "Key regulatory or operational constraints you have worked within",
    answer: "In FinTech, I worked on lending products requiring strict adherence to credit bureau policies, KYC/AML guidelines, and lender-specific risk thresholds. In EdTech, I designed systems that align with COPPA, GDPR, and regional data laws concerning children's data and parental consent workflows.",
    category: "pm_mindset",
    keywords: ["Compliance", "EdTech", "Fintech", "Regulations"],
    timePeriod: null,
    organization: null,
    relevance: "Compliance, Operations"
  },
  {
    id: "bab5e278",
    question: "How do you work with design, engineering, & marketing teams?",
    answer: "I use a structured but empathetic approach. With design, I co-create wireframes and user flows. With engineering, I define clear requirements, unblock issues early, and review edge cases. With marketing, I align on user personas, positioning, and GTM. I emphasize transparent documentation and async communication to keep momentum.",
    category: "pm_mindset",
    keywords: ["Collaboration", "Cross-functional", "Teamwork"],
    timePeriod: null,
    organization: null,
    relevance: "Collaboration, Ways of Working"
  },
  {
    id: "972116ba",
    question: "What product trends or AI use-cases excite you right now?",
    answer: "I'm excited about agentic AI for automating complex tasks like sales support and onboarding, semantic search for knowledge bases, and AI copilots in education. I also find AI in personalization, low-code/no-code productivity, and emotional storytelling highly impactful for the next decade.",
    category: "vision_&_learning",
    keywords: ["AI", "Future", "Trends"],
    timePeriod: null,
    organization: null,
    relevance: "AI, Trends"
  },
  {
    id: "fca13abe",
    question: "A product idea you wish existed & why?",
    answer: "I wish there were a platform where parents could narrate AI-generated stories in their own voice, personalized to their child's age, emotion, and language. If possible, narrating the stories with personalized characters as animation videos. It would preserve emotional connection in a tech world while being culturally rooted and universally accessible.",
    category: "vision_&_learning",
    keywords: ["Innovation", "Product Thinking"],
    timePeriod: null,
    organization: "Stories of Life",
    relevance: "Innovation, Vision"
  },
  {
    id: "998fc0ab",
    question: "What's your leadership style?",
    answer: "My leadership style is collaborative and ownership-driven. I believe in empowering team members with context, autonomy, and trust. I lead by example, especially in ambiguity, and ensure psychological safety so people can challenge, learn, and grow together.",
    category: "personality_&_values",
    keywords: ["Leadership", "Teamwork"],
    timePeriod: null,
    organization: null,
    relevance: "Leadership"
  },
  {
    id: "4336e703",
    question: "How do you handle failure or feedback?",
    answer: "I treat failure as a signal, not a verdict. I analyze what went wrong, discuss it openly, and iterate forward. Feedback - both giving and receiving - is part of how I grow. I make it a practice to ask for feedback regularly and treat it as data, not judgment.",
    category: "personality_&_values",
    keywords: ["Feedback", "Growth", "Resilience"],
    timePeriod: null,
    organization: null,
    relevance: "Feedback, Growth"
  },
  {
    id: "592c670a",
    question: "What kind of team culture helps you thrive?",
    answer: "I thrive in teams that are curious, supportive, and execution-oriented. I value open communication, intellectual honesty, and a shared sense of ownership. Teams where learning is celebrated and feedback flows freely tend to unlock the best in me.",
    category: "personality_&_values",
    keywords: ["Culture", "Teamwork"],
    timePeriod: null,
    organization: null,
    relevance: "Culture, Team"
  },
  {
    id: "9a0cfeb3",
    question: "Summary of Experience at Philips",
    answer: "During my internship at Philips India, I focused on driving digital adoption in the MedTech space. I conducted in-depth primary research with over 20 stakeholders and benchmarked competitors to uncover gaps in digital maturity for capital equipment. Based on these insights, I proposed a two-year digital transformation roadmap for their mobile surgery business, which included actionable product recommendations.",
    category: "experience",
    keywords: ["Digital Strategy", "Internship", "MedTech"],
    timePeriod: "Apr 2021 - Jun 2021",
    organization: "Philips",
    relevance: "Experience, Strategy"
  },
  {
    id: "11fbb79e",
    question: "Summary of Experience at Mercedes Benz",
    answer: "At Mercedes Benz, I worked on improving simulation accuracy and engineering productivity. I led model-based development automation that streamlined simulation efforts across 120+ diagnostic models, ensuring 100% on-time delivery. I also introduced a digital tracker that improved cross-team traceability by 45%, and helped align audit practices across five teams. My work helped reduce planning overhead and brought consistency in system model validation.",
    category: "experience",
    keywords: ["Audit", "Automation", "System Modeling"],
    timePeriod: "Nov 2018 - Jul 2020",
    organization: "Mercedes Benz",
    relevance: "Efficiency, Experience"
  },
  {
    id: "cac5204e",
    question: "Summary of Experience at TCS",
    answer: "My time at TCS laid the foundation for building scalable tech solutions. I developed a tool that automated integrated model generation, cutting turnaround time by 40%. This was part of a broader model-based development initiative where I worked on over 250 models and trained managers across teams. I also designed 8+ UI frameworks that streamlined internal workflows, saving 80+ hours per month in review cycles.",
    category: "experience",
    keywords: ["Efficiency", "Process Automation", "Tooling"],
    timePeriod: "Jul 2016 - Nov 2018",
    organization: "TCS",
    relevance: "Automation, Experience, Process Improvement"
  },
  {
    id: "6fd11f45",
    question: "Interests & Hobbies",
    answer: "Outside of work, I love to read mythology books. I'm deeply interested in storytelling and cultural narratives which also inspired me to build Stories of Life, my personal side project. I also enjoy exploring AI tools and finding creative ways to connect technology with human experience. When I'm not working on product ideas, you'll probably find me curating story frameworks, reading about behavioral psychology, or listening to long-form podcasts.",
    category: "general_questions",
    keywords: ["Culture Fit", "Interests", "Outside Work", "Personality"],
    timePeriod: null,
    organization: "Stories of Life",
    relevance: "Culture Fit, Hobbies, Personality"
  },
];

// Add more entries here based on your actual resume and portfolio content
// You can organize them by categories: experience, skills, projects, achievements, general
