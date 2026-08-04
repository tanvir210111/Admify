export const universityDatabase = {
  "stanford-university": {
    name: "Stanford University",
    location: "Stanford, California, USA",
    logo: "/stanford-university.png",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #3",
    acceptanceRate: "4%",
    totalStudents: "17,000+",
    internationalPct: "24%",
    
    // Overview
    about: "Stanford University is a private research university in Stanford, California. The campus occupies 8,180 acres, among the largest in the United States, and enrolls over 17,000 students. Stanford is ranked among the best universities in the world.",
    history: "Founded in 1885 by Leland and Jane Stanford in memory of their only child, Leland Stanford Jr. The university opened in 1891 as a coeducational and non-denominational institution.",
    
    // Academics
    programs: [
      { name: "Computer Science", degree: "B.S. / M.S. / Ph.D." },
      { name: "Business Administration", degree: "MBA" },
      { name: "Engineering", degree: "B.S. / M.S." },
      { name: "Medicine", degree: "M.D." },
      { name: "Law", degree: "J.D. / LL.M." }
    ],
    facultyStudentRatio: "5:1",
    intakeSeasons: ["Fall (September)"],

    // Admissions
    admissionReqs: {
      gpa: "Average 3.96 unweighted GPA",
      testScores: "SAT: 1470-1570 | ACT: 34-35 (Test Optional currently)",
      englishProficiency: "TOEFL iBT: 100+ | IELTS: 7.5+",
      documents: ["Common Application", "Stanford Questions", "High School Transcript", "2 Teacher Evaluations", "Counselor Recommendation"]
    },
    applicationDeadline: "Restrictive Early Action: Nov 1 | Regular Decision: Jan 5",

    // Financials
    costs: {
      tuition: "$61,731 / year",
      housingAndFood: "$19,922 / year",
      studentFees: "$2,298 / year",
      booksAndSupplies: "$1,305 / year",
      totalEstimated: "$85,256 / year"
    },
    scholarshipsList: [
      { name: "Institutional Need-Based Aid", amount: "Up to 100% of demonstrated need", description: "Stanford meets the full demonstrated financial need of every admitted student, regardless of citizenship." },
      { name: "Knight-Hennessy Scholars", amount: "Full tuition + stipend", description: "Fully funded graduate fellowship across all disciplines." },
      { name: "Athletic Scholarships", amount: "Partial to Full", description: "Awarded to exceptional student-athletes competing in NCAA Division I." }
    ],
    
    // Campus Life
    housing: "On-campus housing is guaranteed for all four years of undergraduate education. Over 97% of undergraduates live on campus in 81 undergraduate student residences.",
    facilities: ["SLAC National Accelerator Laboratory", "Stanford Research Park", "Cantor Arts Center", "Arrillaga Center for Sports & Recreation"],
    clubs: "Over 600 organized student groups, including academic, cultural, athletic, and pre-professional organizations.",
    
    // Careers & Alumni
    careerServices: "Stanford Career Education (CareerEd) offers 1-on-1 coaching, career fairs, and networking events.",
    employmentRate: "94% employed or in graduate school within 6 months of graduation.",
    averageStartingSalary: "$93,000 (Undergraduates)",
    alumniNetwork: "Over 220,000 active alumni globally, heavily concentrated in Silicon Valley and tech leadership.",
    topEmployers: ["Google", "Apple", "Meta", "McKinsey & Company", "Goldman Sachs"],
    industryBreakdown: [
      { sector: "Technology & Software", pct: "35%" },
      { sector: "Finance & Consulting", pct: "22%" },
      { sector: "Healthcare & Biotech", pct: "15%" },
      { sector: "Academia & Research", pct: "12%" }
    ]
  },

  "university-of-toronto": {
    name: "University of Toronto",
    location: "Toronto, Ontario, Canada",
    logo: "/university-of-toronto.jpg",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #21",
    acceptanceRate: "43%",
    totalStudents: "97,000+",
    internationalPct: "27%",
    
    // Overview
    about: "The University of Toronto is a globally top-ranked public research university in Toronto, Ontario, Canada. Known for its historic campus and groundbreaking research, it's a prime destination for international students seeking the 3-Year PGWP.",
    history: "Founded in 1827 by royal charter as King's College, it is the oldest university in the province of Ontario.",
    
    // Academics
    programs: [
      { name: "Computer Science", degree: "B.Sc. / M.Sc." },
      { name: "Rotman Commerce", degree: "B.Com. / MBA" },
      { name: "Life Sciences", degree: "B.Sc." },
      { name: "Engineering", degree: "B.A.Sc. / M.Eng." }
    ],
    facultyStudentRatio: "11:1",
    intakeSeasons: ["Fall (September)", "Winter (January - limited programs)"],

    // Admissions
    admissionReqs: {
      gpa: "Mid-to-high 80s / Low 90s (Ontario scale) depending on program",
      testScores: "SAT/ACT not required for most programs; highly recommended for competitive fields.",
      englishProficiency: "IELTS: 6.5 (no band below 6.0) | TOEFL iBT: 89 (22 in Writing/Speaking)",
      documents: ["Transcripts", "Supplemental Application (Engineering/Commerce)", "English Proficiency Proof"]
    },
    applicationDeadline: "Early Recommendation: Nov 7 | Final Deadline: Jan 15",

    // Financials
    costs: {
      tuition: "CAD $60,510 - $65,510 / year (International)",
      housingAndFood: "CAD $15,000 - $20,000 / year",
      studentFees: "CAD $2,000 / year",
      booksAndSupplies: "CAD $1,500 / year",
      totalEstimated: "CAD $79,010 - $89,010 / year"
    },
    scholarshipsList: [
      { name: "Lester B. Pearson International Scholarship", amount: "Full tuition + residence", description: "Recognizes international students who demonstrate exceptional academic achievement and creativity." },
      { name: "U of T Scholars Program", amount: "CAD $7,500", description: "Awarded automatically to the most outstanding students entering first-year studies." },
      { name: "Faculty-Specific Entrance Awards", amount: "CAD $2,000 - $10,000", description: "Automatic entrance scholarships based on high school grades for specific faculties like Engineering and Rotman Commerce." }
    ],
    
    // Campus Life
    housing: "Guaranteed residence for first-year undergrads who apply by the deadline. Three distinct campuses (St. George, Mississauga, Scarborough) offer different living experiences.",
    facilities: ["Robarts Library (largest academic library in Canada)", "Hart House", "Athletic Centre", "MaRS Discovery District integration"],
    clubs: "1000+ student clubs, radio station (CIUT-FM), and Canada's oldest student newspaper.",
    
    // Careers & Alumni
    careerServices: "Career Exploration & Education center provides career advising, resume workshops, and industry networking.",
    employmentRate: "90% employed within 6 months of graduation.",
    averageStartingSalary: "CAD $65,000 (Undergraduates)",
    alumniNetwork: "600,000+ alumni, including 4 Canadian Prime Ministers and Nobel laureates.",
    topEmployers: ["RBC", "TD Bank", "IBM", "Deloitte", "Microsoft Canada"],
    industryBreakdown: [
      { sector: "Financial Services", pct: "28%" },
      { sector: "Technology", pct: "25%" },
      { sector: "Healthcare", pct: "18%" },
      { sector: "Public Sector", pct: "10%" }
    ]
  },

  "oxford-university": {
    name: "Oxford University",
    location: "Oxford, Oxfordshire, UK",
    logo: "/university-of-oxford.webp",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #2",
    acceptanceRate: "17%",
    totalStudents: "24,000+",
    internationalPct: "45%",
    
    // Overview
    about: "As the oldest university in the English-speaking world, Oxford is a unique and historic institution. It is made up of 39 semi-autonomous constituent colleges and a range of academic departments.",
    history: "There is no clear date of foundation, but teaching existed at Oxford in some form in 1096 and developed rapidly from 1167, when Henry II banned English students from attending the University of Paris.",
    
    // Academics
    programs: [
      { name: "Philosophy, Politics and Economics (PPE)", degree: "B.A." },
      { name: "Law (Jurisprudence)", degree: "B.A." },
      { name: "Medicine", degree: "B.M. / B.Ch." },
      { name: "Mathematics", degree: "MMath" }
    ],
    facultyStudentRatio: "11:1",
    intakeSeasons: ["Michaelmas Term (October)"],

    // Admissions
    admissionReqs: {
      gpa: "AAA or A*A*A* at A-Level (or equivalent 38-40 IB points)",
      testScores: "Specific admissions tests required for most subjects (e.g., MAT, LNAT, BMAT).",
      englishProficiency: "IELTS: 7.5 (minimum 7.0 per component) | TOEFL iBT: 110 (min 24)",
      documents: ["UCAS Application", "Personal Statement", "Academic Reference", "Admissions Test", "Interview (if shortlisted)"]
    },
    applicationDeadline: "October 15 (strict UCAS deadline for all courses)",

    // Financials
    costs: {
      tuition: "£33,050 - £48,620 / year (International)",
      housingAndFood: "£12,000 - £16,000 / year (varies by college)",
      studentFees: "Included in tuition",
      booksAndSupplies: "£600 / year",
      totalEstimated: "£45,650 - £65,220 / year"
    },
    scholarshipsList: [
      { name: "Rhodes Scholarship", amount: "Full tuition + living stipend", description: "The oldest international scholarship programme, covering full postgraduate study costs for exceptional students worldwide." },
      { name: "Clarendon Fund", amount: "Full tuition + living costs", description: "Offers over 130 fully-funded scholarships each year to outstanding graduate students." },
      { name: "Reach Oxford Scholarships", amount: "Full tuition + living costs", description: "For undergraduate students from low-income countries who cannot study in their own countries for political or financial reasons." }
    ],
    
    // Campus Life
    housing: "College-based accommodation provided for most students for at least their first year and often the entirety of their degree.",
    facilities: ["Bodleian Library", "Ashmolean Museum", "Oxford University Museum of Natural History", "College chapels and dining halls"],
    clubs: "Oxford Union (world-renowned debating society), rowing clubs, and over 400 university societies.",
    
    // Careers & Alumni
    careerServices: "Oxford University Careers Service offers life-long support to alumni, global internships, and exclusive recruiting events.",
    employmentRate: "91% employed or in further study within 15 months of graduation.",
    averageStartingSalary: "£32,000 - £45,000 (varies heavily by sector)",
    alumniNetwork: "30+ modern world leaders (including 28 UK Prime Ministers), 73 Nobel laureates.",
    topEmployers: ["NHS", "PwC", "Deloitte", "Civil Service (UK)", "Goldman Sachs"],
    industryBreakdown: [
      { sector: "Education & Academia", pct: "20%" },
      { sector: "Finance & Consulting", pct: "25%" },
      { sector: "Government/Public Sector", pct: "15%" },
      { sector: "Law", pct: "10%" }
    ]
  },

  "university-of-melbourne": {
    name: "University of Melbourne",
    location: "Melbourne, Victoria, Australia",
    logo: "https://logo.clearbit.com/unimelb.edu.au",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #14",
    acceptanceRate: "70%",
    totalStudents: "54,000+",
    internationalPct: "44%",
    
    // Overview
    about: "The University of Melbourne is a public research university located in Melbourne, Australia. Known for its distinct 'Melbourne Model' curriculum which emphasizes broad undergraduate studies followed by specialized graduate degrees.",
    history: "Founded in 1853, it is Australia's second oldest university and the oldest in Victoria.",
    
    // Academics
    programs: [
      { name: "Biomedicine", degree: "B.Biomed" },
      { name: "Commerce", degree: "B.Com" },
      { name: "Engineering", degree: "M.Eng" },
      { name: "Arts", degree: "B.A." }
    ],
    facultyStudentRatio: "21:1",
    intakeSeasons: ["Semester 1 (February)", "Semester 2 (July)"],

    // Admissions
    admissionReqs: {
      gpa: "ATAR of 85.00+ or equivalent (varies by program)",
      testScores: "SAT/ACT accepted for US curriculum students.",
      englishProficiency: "IELTS: 6.5 (no band below 6.0) | TOEFL iBT: 79",
      documents: ["Academic Transcripts", "English Proficiency Proof", "Prerequisite subject proofs"]
    },
    applicationDeadline: "Late November for Semester 1 | Late May for Semester 2",

    // Financials
    costs: {
      tuition: "AUD $37,000 - $55,000 / year (International)",
      housingAndFood: "AUD $25,000 - $30,000 / year",
      studentFees: "AUD $324 / year (SSAF)",
      booksAndSupplies: "AUD $1,000 / year",
      totalEstimated: "AUD $63,324 - $86,324 / year"
    },
    scholarshipsList: [
      { name: "Melbourne International Undergraduate Scholarship", amount: "Up to AUD $10,000 fee remission", description: "Awarded automatically to high-achieving international students entering an undergraduate program." },
      { name: "Graduate Research Scholarships", amount: "Full fee offset + AUD $34,400 stipend", description: "For high-achieving students undertaking a graduate research degree (Masters by Research or PhD)." },
      { name: "Commerce Achievement Scholarship", amount: "AUD $5,000 per year", description: "For international students entering the Bachelor of Commerce with exceptional high school results." }
    ],
    
    // Campus Life
    housing: "Residential colleges provide traditional collegiate experiences; student apartments available in the city.",
    facilities: ["Ian Potter Museum of Art", "System Garden", "Melbourne Connect innovation precinct", "Beaurepaire Centre (sports)"],
    clubs: "UMSU (University of Melbourne Student Union) runs 200+ clubs and societies.",
    
    // Careers & Alumni
    careerServices: "Careers and Employability studio provides mentorship, internships, and global mobility programs.",
    employmentRate: "Ranked #8 globally for graduate employability.",
    averageStartingSalary: "AUD $68,000 (Undergraduates)",
    alumniNetwork: "400,000+ alumni globally, including 4 Australian Prime Ministers.",
    topEmployers: ["Commonwealth Bank", "Macquarie Group", "Telstra", "BHP", "KPMG"],
    industryBreakdown: [
      { sector: "Financial & Professional Services", pct: "30%" },
      { sector: "Healthcare & Medicine", pct: "20%" },
      { sector: "Technology & Engineering", pct: "18%" },
      { sector: "Education", pct: "15%" }
    ]
  },

  "technical-university-of-munich": {
    name: "Technical University of Munich",
    location: "Munich, Bavaria, Germany",
    logo: "https://logo.clearbit.com/tum.de",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #37",
    acceptanceRate: "8%",
    totalStudents: "50,000+",
    internationalPct: "38%",
    
    // Overview
    about: "The Technical University of Munich (TUM) is a public research university in Munich. A University of Excellence, TUM is consistently ranked among Europe's top universities for engineering, technology, and natural sciences.",
    history: "Founded in 1868 by King Ludwig II of Bavaria to provide the state with a center of learning dedicated to the natural sciences and engineering.",
    
    // Academics
    programs: [
      { name: "Informatics", degree: "B.Sc. / M.Sc." },
      { name: "Mechanical Engineering", degree: "B.Sc. / M.Sc." },
      { name: "Physics", degree: "B.Sc. / M.Sc." },
      { name: "Management", degree: "B.Sc. / M.Sc." }
    ],
    facultyStudentRatio: "45:1",
    intakeSeasons: ["Winter Semester (October)", "Summer Semester (April)"],

    // Admissions
    admissionReqs: {
      gpa: "Abitur equivalent (High academic standing). Subject-specific assessments.",
      testScores: "GRE sometimes required for Master's programs.",
      englishProficiency: "Many Master's programs are in English (IELTS 6.5). Bachelor's usually require German (DSH-2 or TestDaF 4).",
      documents: ["Hochschulzugangsberechtigung (HZB)", "CV", "Letter of Motivation", "Language Certificates"]
    },
    applicationDeadline: "May 31 - July 15 (Winter) | Nov 15 - Jan 15 (Summer)",

    // Financials
    costs: {
      tuition: "€0 - €3,000 / semester (Tuition free for EU. Non-EU international students now pay tuition depending on program).",
      housingAndFood: "€10,000 - €12,000 / year",
      studentFees: "€85 - €152 / semester (Student Union fee)",
      booksAndSupplies: "€500 / year",
      totalEstimated: "€11,000 - €18,000 / year"
    },
    scholarshipsList: [
      { name: "Deutschlandstipendium", amount: "€300 / month", description: "Merit-based scholarship funded equally by the German government and private sponsors/companies." },
      { name: "DAAD Scholarships", amount: "Varies (often covers living costs)", description: "The German Academic Exchange Service offers comprehensive funding for international students." },
      { name: "TUM International Student Grants", amount: "One-time €500 - €1,500", description: "Support for international students facing unexpected financial hardship." }
    ],
    
    // Campus Life
    housing: "Studentenwerk housing is available but highly competitive. Most students rent privately in Munich or Garching.",
    facilities: ["Forschungs-Neutronenquelle Heinz Maier-Leibnitz (FRM II)", "SuperMUC supercomputer", "TUM Institute for Advanced Study"],
    clubs: "Active student councils (Fachschaften) and tech-focused initiatives like TUM Hyperloop.",
    
    // Careers & Alumni
    careerServices: "TUM Career Service and extensive startup incubation (UnternehmerTUM - the largest innovation center in Europe).",
    employmentRate: "Consistently ranked highly in Global University Employability Rankings (#12 globally).",
    averageStartingSalary: "€55,000 - €75,000 (Highly dependent on engineering discipline)",
    alumniNetwork: "18 Nobel laureates, inventors of the refrigerator and diesel engine.",
    topEmployers: ["BMW", "Siemens", "Allianz", "Infineon", "Airbus"],
    industryBreakdown: [
      { sector: "Automotive & Aerospace", pct: "35%" },
      { sector: "IT & Software Development", pct: "30%" },
      { sector: "Research & Development", pct: "15%" },
      { sector: "Management Consulting", pct: "10%" }
    ]
  },

  "imperial-college-london": {
    name: "Imperial College London",
    location: "London, England, UK",
    logo: "https://logo.clearbit.com/imperial.ac.uk",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #6",
    acceptanceRate: "14%",
    totalStudents: "20,000+",
    internationalPct: "60%",
    
    // Overview
    about: "Imperial College London is a public research university focused exclusively on science, engineering, medicine, and business. It is located in South Kensington, one of London's most cultural and intellectual hubs.",
    history: "Grew out of Prince Albert's vision of an area for culture and science. Formally established by royal charter in 1907.",
    
    // Academics
    programs: [
      { name: "Computing", degree: "B.Eng / M.Eng" },
      { name: "Medicine", degree: "MBBS" },
      { name: "Aeronautical Engineering", degree: "M.Eng" },
      { name: "Physics", degree: "B.Sc. / M.Sci." }
    ],
    facultyStudentRatio: "11:1",
    intakeSeasons: ["Autumn Term (October)"],

    // Admissions
    admissionReqs: {
      gpa: "A*A*A to AAB at A-Level (or 38-42 IB points).",
      testScores: "MAT/STEP for Math/Computing, BMAT for Medicine.",
      englishProficiency: "IELTS: 7.0 (min 6.5 per element) | TOEFL iBT: 100 (min 22)",
      documents: ["UCAS Application", "Personal Statement", "Reference", "Admissions Test"]
    },
    applicationDeadline: "October 15 (Medicine) | January 31 (Most other programs)",

    // Financials
    costs: {
      tuition: "£35,000 - £50,000 / year (International)",
      housingAndFood: "£13,000 - £18,000 / year (London living costs)",
      studentFees: "Included in tuition",
      booksAndSupplies: "£500 / year",
      totalEstimated: "£48,500 - £68,500 / year"
    },
    scholarshipsList: [
      { name: "President's Undergraduate Scholarships", amount: "£1,000 / year", description: "Awarded to applicants with extraordinary academic potential." },
      { name: "Imperial Bursary", amount: "Up to £5,000 / year", description: "Guaranteed support for home students from lower-income backgrounds." },
      { name: "Departmental Scholarships", amount: "Varies", description: "Many specific engineering and science departments offer their own merit-based awards." }
    ],
    
    // Campus Life
    housing: "Guaranteed for first-year undergraduates. Most halls are a short walk or tube ride from the main campus.",
    facilities: ["White City Innovation District", "Blyth Music and Arts Centre", "Ethos Sports Centre", "Directly adjacent to Science, Natural History, and V&A museums."],
    clubs: "Imperial College Union operates over 380 clubs and societies.",
    
    // Careers & Alumni
    careerServices: "Close ties with London's financial and tech sectors. Robust Careers Service.",
    employmentRate: "94% employed or in further study within 6 months.",
    averageStartingSalary: "£35,000 (highest average starting salary among UK universities).",
    alumniNetwork: "14 Nobel laureates, numerous CEOs of FTSE 100 companies.",
    topEmployers: ["NHS", "Goldman Sachs", "McKinsey", "Google", "Rolls-Royce"],
    industryBreakdown: [
      { sector: "Banking & Finance", pct: "30%" },
      { sector: "Engineering & Manufacturing", pct: "25%" },
      { sector: "IT & Telecommunications", pct: "20%" },
      { sector: "Healthcare & Pharmaceuticals", pct: "15%" }
    ]
  },

  "eth-zurich": {
    name: "ETH Zurich",
    location: "Zurich, Switzerland",
    logo: "/eth-zurich.jpg",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    rank: "QS World Rank #7",
    acceptanceRate: "27%",
    totalStudents: "22,000+",
    internationalPct: "40%",
    
    // Overview
    about: "ETH Zurich (Swiss Federal Institute of Technology) is a public research university in the city of Zürich. It is widely regarded as one of the best universities in the world for engineering and natural sciences.",
    history: "Founded by the Swiss Federal Government in 1854 with the stated mission to educate engineers and scientists and serve as a national center of excellence in science and technology.",
    
    // Academics
    programs: [
      { name: "Computer Science", degree: "B.Sc. / M.Sc." },
      { name: "Architecture", degree: "B.Sc. / M.Sc." },
      { name: "Physics", degree: "B.Sc. / M.Sc." },
      { name: "Mathematics", degree: "B.Sc. / M.Sc." }
    ],
    facultyStudentRatio: "38:1",
    intakeSeasons: ["Autumn Semester (September)"],

    // Admissions
    admissionReqs: {
      gpa: "Swiss Matura or recognized foreign equivalent. Comprehensive entrance exam often required for non-recognized foreign certificates.",
      testScores: "ETH Entrance Exam (reduced or comprehensive).",
      englishProficiency: "Bachelors are predominantly in German (C1 required). Masters are mostly in English (IELTS 7.0 / TOEFL 100).",
      documents: ["High School Diploma", "Language Certificate", "CV", "Entrance exam results (if applicable)"]
    },
    applicationDeadline: "Nov 15 - Dec 15 (Master's) | April 30 (Bachelor's)",

    // Financials
    costs: {
      tuition: "CHF 1,460 / year (Standard for all students, including international)",
      housingAndFood: "CHF 20,000 - CHF 24,000 / year (Zurich is expensive)",
      studentFees: "CHF 138 / year",
      booksAndSupplies: "CHF 1,000 / year",
      totalEstimated: "CHF 22,598 - CHF 26,598 / year"
    },
    scholarshipsList: [
      { name: "Excellence Scholarship & Opportunity Programme (ESOP)", amount: "Full tuition + CHF 12,000/semester", description: "For outstanding Master's students, covering living and study expenses." },
      { name: "ETH D-Scholarship", amount: "CHF 7,500/semester", description: "Merit-based partial stipend for Master's students." },
      { name: "Solidarity Fund", amount: "Varies", description: "Financial assistance for current students facing unexpected hardship." }
    ],
    
    // Campus Life
    housing: "Housing is not guaranteed or managed directly by ETH. Students must find their own housing, often through the Housing Office of University of Zurich/ETH (WOKO).",
    facilities: ["ETH Library (largest in Switzerland)", "CSCS (Swiss National Supercomputing Centre)", "Hönggerberg Science City"],
    clubs: "VSETH (student union) organizes numerous events, including the massive Polyball.",
    
    // Careers & Alumni
    careerServices: "ETH Career Center provides counseling, application checks, and hosts company fairs (Polymesse).",
    employmentRate: "High employability, particularly in Switzerland and Europe's tech/finance sectors.",
    averageStartingSalary: "CHF 85,000 - CHF 100,000 (Master's graduates in CH)",
    alumniNetwork: "22 Nobel laureates, including Albert Einstein.",
    topEmployers: ["Credit Suisse / UBS", "Novartis", "Roche", "Google (Zurich HQ)", "ABB"],
    industryBreakdown: [
      { sector: "Technology & Software", pct: "30%" },
      { sector: "Engineering & Machinery", pct: "25%" },
      { sector: "Banking & Financial Services", pct: "20%" },
      { sector: "Pharmaceuticals & Biotech", pct: "15%" }
    ]
  }
};
