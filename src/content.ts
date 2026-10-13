/**
 * Everything the site says. All of it comes from abhinavchutani.github.io
 * (the skill entries, the showcase and the contact details); edit copy here
 * and nowhere else. `render.ts` turns this into static HTML at
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
  kind?: "hero" | "economics" | "contact";
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
  line: "Economics student at Aalto University, building across AI, finance, and hardware.",
  place: "Aalto University · Helsinki",
  edition: "Portfolio — MMXXVI",
  email: "abhinavchutani3@gmail.com",
  linkedin: "https://linkedin.com/in/abhinavchutani/",
  location: "Helsinki, Finland",
};

/** Projects: economics and code, put to work. */
export const builds = [
  { key: "quantum", name: "Quantum × Finance", sub: "Ultrahack · 3rd place", text: "Benchmarking randomised ESG constraints with quantum methods." },
  { key: "engram", name: "Engram", sub: "Aalto AI Hackathon · Built for RELEX", text: "AI organizational memory auditor: every answer is a case, with evidence and verified receipts." },
  { key: "monte", name: "Monte Carlo Options", sub: "Quant finance · Research", text: "A simulator checked against the Black-Scholes formula." },
  { key: "chain", name: "Blockchain Simulator", sub: "Python · Systems research", text: "Hashing, block creation, and chain validation." },
];

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
    // A violin and a drum kit under warm stage light.
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
            done: "I taught myself Python by building things instead of only studying syntax: Orbital Guardian, automation scripts, web experiments, and small data projects.",
            feel: "Coding makes vague ideas testable. If it fails, the feedback is immediate.",
            level: 72,
            levelLabel: "Intermediate — Advancing",
          },
          {
            name: "Web & App Design",
            badge: "HTML · CSS · JS · Tailwind",
            done: "Websites and lightweight apps. MarksMaxxing was built and launched in under 10 days.",
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
    // Low Earth orbit: the satellite, its net, the debris.
    id: "orbit",
    name: "Orbit",
    accent: "#a99bff",
    ground: "#04051a",
    look: "dark",
    stages: [
      {
        skills: [
          {
            name: "Orbital Guardian",
            badge: "Space debris · Solo project · 2024",
            done: "Computer vision detects a piece of debris, and a servo-aligned net moves toward the target.",
            feel: "It pushed me to translate an idea into a working mechanism.",
            level: 80,
            levelLabel: "Solo Project — Complete",
          },
          {
            name: "Innovation",
            badge: "Pariksha Pe Charcha 2024",
            done: "I presented it directly to the Prime Minister of India. Most of my projects start with a problem that stays in my head until I build around it.",
            level: 88,
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
            done: "I represented India at the FIRST Lego League World Festival in Detroit: 8th in the world out of 110+ nations, after qualifying #1 in North India. National finalist, IRC 2025.",
            feel: "It made global competition feel real rather than distant.",
            level: 82,
            levelLabel: "World Top-10 · FLL",
          },
          {
            name: "Techne",
            badge: "CAD · Dassault 3DExperience",
            done: "CAD for robotics and hardware: Terra Mitra, an AI-enabled farming device (Top 24 of 13,000), and Shravan Doot, speech-to-text smart glasses (national semifinalist).",
            level: 68,
          },
        ],
        caption: "Exploded view, every few seconds",
      },
    ],
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
            badge: "Yale certified · Financial Markets",
            done: "Yale University's Financial Markets course, independent reading, and now formally: Economics & Business Administration at Aalto University.",
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
            done: "Head Boy for 3,500+ students, coordinating a 70-member council across assemblies, operations, conflict resolution, and the launch of the Mental Health Corner.",
            feel: "Leadership has taught me to be useful before being visible.",
            level: 92,
            levelLabel: "Head Boy · School-Wide",
          },
          {
            name: "Public Speaking",
            badge: "High commendation · MUN",
            done: "Assemblies, national platforms, and MUN awards at Concordia, SHISMUN, and BBI.",
            level: 80,
          },
          {
            name: "Symposium",
            badge: "Scifest · Melange · ACON",
            done: "Organised and hosted three events: roughly 2,000 attendees across them.",
            level: 85,
          },
        ],
        caption: "Every light is a student — 3,500 of them",
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
            badge: "Daily reflection · Fountain pen",
            done: "Private reflection and a decision-making tool: a written record of what I am actually trying to improve.",
            feel: "Most of my clearest thinking happens on paper.",
            level: 76,
            levelLabel: "Daily Practice",
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
