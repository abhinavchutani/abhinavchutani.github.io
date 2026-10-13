/**
 * Everything the site says. It comes from abhinavchutani.github.io, from his
 * CV and from the profile he wrote for LinkedIn; edit copy here and nowhere
 * else. `render.ts` turns this into static HTML at
 * build time, and the 3D stage reads the same list for its labels.
 */

export type Skill = {
  /** One of the nineteen. */
  name: string;
  badge: string;
  /** What was done, cut down to what fits on a sign. */
  done: string;
  /** How it feels, in his words. Shown for the first skill on a sign. */
  feel?: string;
  /** Self-rated level from the original site, 0 to 100, with its label. */
  level?: number;
  levelLabel?: string;
};

export type Stage = {
  /** Small line above the block. */
  kicker?: string;
  /** The first is the sign's headline; the rest sit under it, smaller. */
  skills?: Skill[];
  /** Anything that is not a plain skill block. */
  kind?: "hero" | "economics" | "projects" | "contact";
  /** A caption that points at the scene ("every light is a student"). */
  caption?: string;
};

export type Chapter = {
  id: string;
  /** Short name for the rail and the readout. */
  name: string;
  /** Accent and ground as sRGB hex. The stage paints the same ground behind the page. */
  accent: string;
  ground: string;
  /** "dark" chapters carry light type; "light" ones carry ink. */
  look: "dark" | "light";
  stages: Stage[];
};

export const person = {
  first: "Abhinav",
  last: "Chutani",
  line: "Economics & Business student at Aalto University, building across AI, finance, and hardware.",
  place: "Aalto University · Helsinki",
  edition: "Portfolio — MMXXVI",
  /** What he is open to, in his words (the last line of his profile). */
  open: "Always open to connecting with people working across finance, economics, AI, software engineering, startups, and technology.",
  email: "abhinavchutani3@gmail.com",
  linkedin: "https://linkedin.com/in/abhinavchutani/",
  location: "Helsinki, Finland",
};

export type Build = { key: string; name: string; sub: string; text: string };

/** Finance, in code: the two that sit with Economics. */
export const models: Build[] = [
  { key: "monte", name: "Monte Carlo Options", sub: "Python · 2026", text: "European option pricing by simulation, checked against the analytical Black-Scholes result." },
  { key: "chain", name: "Blockchain", sub: "Python · 2026", text: "A proof-of-work chain and a visualiser for mining, hash linking, and chain integrity." },
];

/** The projects, most recent first, that stand beside Orbital Guardian. */
export const projects: Build[] = [
  { key: "fairbench", name: "FairBench", sub: "ESG finance × quantum · 3rd place", text: "A benchmark that separates an ESG fund manager's skill from the cost of the constraints. Third at the Hanken Quantum × Finance Hackathon." },
  { key: "engram", name: "Engram", sub: "Enterprise decision search · 2026", text: "Searches 257 unstructured company documents so a manager can ask how any decision was made; challenger agents contest each answer." },
  { key: "shravan", name: "Shravan Doot", sub: "Assistive tech · Team lead · 2025", text: "Smart glasses for the hearing-impaired on a Raspberry Pi, built for under ₹4,000." },
  { key: "terra", name: "Terra Mitra", sub: "Sustainability · Designer · 2023", text: "An AI-enabled farming device: Top 24 of 13,000+ projects at the national NEP celebrations." },
];

/**
 * The chapters, in his order of importance: what he is doing now, what he has led and built,
 * the making behind it, and then the person (the violin, the books, the pens).
 */
export const chapters: Chapter[] = [
  {
    id: "top",
    name: "Origin",
    accent: "#f4efe4",
    ground: "#050506",
    look: "dark",
    stages: [{ kind: "hero" }],
  },
  {
    // A chart on salmon newsprint.
    id: "markets",
    name: "Markets",
    accent: "#9b1c2e",
    ground: "#f1d9c5",
    look: "light",
    stages: [
      {
        kind: "economics",
        skills: [
          {
            name: "Economics",
            badge: "Aalto BSc · Yale Financial Markets (Honors)",
            done: "Economics & Business Administration at Aalto University, after Yale's Financial Markets course and a lot of independent reading. Interested in FinTech, capital allocation, and how economic systems interact at scale.",
            feel: "Not just whether something is impressive, but whether it is sustainable, efficient, and worth the cost.",
            level: 75,
            levelLabel: "Yale Certified — Deep Interest",
          },
        ],
        caption: "180 simulated paths, one distribution",
      },
    ],
  },
  {
    // An auditorium, from the lectern.
    id: "stage",
    name: "Stage",
    accent: "#ff7d6e",
    ground: "#1a0507",
    look: "dark",
    stages: [
      {
        skills: [
          {
            name: "Leadership",
            badge: "Head Boy 2025–26 · DAV Public School",
            done: "Elected to represent 3,500+ students, coordinating a 70-member council across operations, conflict resolution, and policy. Founded the Mental Health Corner.",
            feel: "Leadership has taught me to be useful before being visible.",
            level: 92,
            levelLabel: "Head Boy · School-Wide",
          },
          {
            name: "Public Speaking",
            badge: "High commendation · MUN",
            done: "Assemblies and national platforms, with MUN awards at Concordia (high commendation), SHISMUN (special mention), and BBI.",
            level: 80,
          },
          {
            name: "Symposium",
            badge: "Scifest · Melange · ACON",
            done: "Led Scifest and Melange for 2,000+ attendees, and helped scale ACON into a regional symposium of 500+ students.",
            level: 85,
          },
        ],
        caption: "Every light is a student — 3,500 of them",
      },
    ],
  },
  {
    // Low Earth orbit: the satellite, its net, the debris.
    id: "projects",
    name: "Projects",
    accent: "#a99bff",
    ground: "#04051a",
    look: "dark",
    stages: [
      {
        kind: "projects",
        skills: [
          {
            name: "Orbital Guardian",
            badge: "Defence tech · Solo · 2024",
            done: "A computer-vision system that finds a piece of space debris and sends a servo-aligned net after it. I presented it personally to the Prime Minister of India at Pariksha Pe Charcha 2024.",
            feel: "Most of my projects start with a problem that stays in my head until I build around it.",
            level: 80,
            levelLabel: "Solo Project — Complete",
          },
        ],
        caption: "Detect · align · capture",
      },
    ],
  },
  {
    // The competition table, drawn on a blueprint.
    id: "machine",
    name: "Machine",
    accent: "#ffd84a",
    ground: "#1444c4",
    look: "dark",
    stages: [
      {
        skills: [
          {
            name: "Robotics",
            badge: "FLL World #8 · Detroit 2019",
            done: "I represented India at the FIRST Lego League World Festival in Detroit: 8th in the world out of 110+ nations, after qualifying #1 in North India. National finalist, International Robotics League 2025.",
            feel: "It made global competition feel real rather than distant.",
            level: 82,
            levelLabel: "World Top-10 · FLL",
          },
          {
            name: "Techne",
            badge: "CAD · Dassault 3DEXPERIENCE",
            done: "CAD, Arduino, and Raspberry Pi for robotics and hardware. ISRO's National Space Innovation Challenge 2023, and the North India zonals of La Fondation Dassault Systèmes.",
            level: 68,
          },
        ],
        caption: "Exploded view, every few seconds",
      },
    ],
  },
  {
    // A desk at night: editors, a browser, an artboard.
    id: "code",
    name: "Code",
    accent: "#5cf2a0",
    ground: "#06161c",
    look: "dark",
    stages: [
      {
        skills: [
          {
            name: "Syntax",
            badge: "Python · Self-taught",
            done: "I taught myself Python by building things instead of only studying syntax: computer vision, retrieval and LLM workflows, automation scripts, and small data projects.",
            feel: "Coding makes vague ideas testable. If it fails, the feedback is immediate.",
            level: 72,
            levelLabel: "Intermediate — Advancing",
          },
          {
            name: "Web & App Design",
            badge: "HTML · CSS · JS · Tailwind",
            done: "MarksMaxxing, co-founded in 2026: it read 1,000+ pages of past board papers for what recurs, and the web app was built in under 10 days.",
            level: 78,
          },
          {
            name: "Design",
            badge: "Photoshop · Figma · Canva",
            done: "Posters, interfaces, and small brand systems. Good design is usually quiet.",
            level: 74,
          },
        ],
      },
    ],
  },
  {
    // A violin and a drum kit under warm gallery light.
    id: "sound",
    name: "Sound",
    accent: "#ffb45c",
    ground: "#1c0c05",
    look: "dark",
    stages: [
      {
        skills: [
          {
            name: "Strings",
            badge: "Violin · Grade 6 ISOM",
            done: "Violin since the age of 8, through the ISOM grades to Grade 6, with performances at Hard Rock Cafe in Connaught Place and The Piano Man in New Delhi.",
            feel: "It trained my ear, my patience, and my tolerance for repetition.",
            level: 78,
            levelLabel: "Grade 6 · ISOM Certified",
          },
          {
            name: "Musicality",
            badge: "Drums · Self-taught",
            done: "Self-taught drummer: YouTube, music theory, and playing along to tracks. Rhythmically strong from the violin.",
            level: 65,
          },
        ],
      },
    ],
  },
  {
    // Paper and ink: a stair of books, a colonnade, a desk.
    id: "mind",
    name: "Mind",
    accent: "#3b33d6",
    ground: "#ece5d6",
    look: "light",
    stages: [
      {
        skills: [
          {
            name: "Reading",
            badge: "Finance · Economics · Philosophy · History",
            done: "50+ books. A lot of my thinking starts from reading one good idea closely enough to test it against my own life.",
            feel: "It gives me better questions, not just more information.",
            level: 85,
            levelLabel: "Cross-Disciplinary Habit",
          },
          {
            name: "Philosophy",
            badge: "Stoics · Systems thinking",
            done: "Aurelius, Seneca, Epictetus. Stoicism is the most practical framework I have for pressure and decisions.",
            level: 80,
          },
        ],
        caption: "One volume per book on the stair",
      },
      {
        kicker: "Daily practice",
        skills: [
          {
            name: "Journaling",
            badge: "Daily reflection · Creative writing",
            done: "Private reflection and a decision-making tool: a written record of what I am actually trying to improve.",
            feel: "Most of my clearest thinking happens on paper.",
            level: 76,
            levelLabel: "Daily Practice",
          },
          {
            name: "Fountain Pens",
            badge: "Enthusiast",
            done: "If you're going to take notes, you might as well enjoy the instrument.",
          },
          {
            name: "Art & Illustration",
            badge: "Sketchbooks · Visual thinking",
            done: "Drawing, for when words are too slow.",
            level: 62,
          },
          {
            name: "Discipline",
            badge: "Strength training · Daily",
            done: "Compound lifts, progressive overload. Show up, do the work, repeat.",
            level: 70,
          },
        ],
      },
    ],
  },
  {
    // Helsinki, at night, under the aurora: where to find him.
    id: "contact",
    name: "Contact",
    accent: "#7dffc0",
    ground: "#041320",
    look: "dark",
    stages: [{ kind: "contact", kicker: "Get in touch" }],
  },
];

/** Every discipline on the page, in journey order, each with the chapter it lives in. */
export const disciplines = chapters.flatMap((chapter, index) =>
  chapter.stages.flatMap((stage) => (stage.skills ?? []).map((skill) => ({ name: skill.name, chapter: index, key: slug(skill.name) }))),
);

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Every resting stage of the page, in order. */
export const stageList = chapters.flatMap((chapter, c) => chapter.stages.map((stage, step) => ({ chapter: c, step, stage })));

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
/** How many disciplines the page shows, as a word: the hero's line and the opener count from the data. */
export const count = { n: disciplines.length, word: WORDS[disciplines.length] ?? String(disciplines.length) };
