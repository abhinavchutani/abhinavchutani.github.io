// ─────────────────────────────────────────────────────────────────────────────
// graph-data.js  —  Knowledge Graph content file
// Open this file to add your own stories for each node.
// Changes here automatically update the mind map hover cards.
//
// Fields:
//   origin  — how you encountered / developed this (1–2 sentences)
//   shaped  — what it taught you / how it changed you (1–2 sentences)
//   now     — where it lives in your life right now (1 sentence)
// ─────────────────────────────────────────────────────────────────────────────

const GRAPH_DATA = {

  nodes: [
    { id:'violin',       label:'Violin',           group:'craft'  },
    { id:'economics',    label:'Economics',         group:'mind'   },
    { id:'robotics',     label:'Robotics',          group:'build'  },
    { id:'philosophy',   label:'Philosophy',        group:'mind'   },
    { id:'leadership',   label:'Leadership',        group:'people' },
    { id:'code',         label:'Code',              group:'build'  },
    { id:'writing',      label:'Writing',           group:'craft'  },
    { id:'systems',      label:'Systems Thinking',  group:'mind'   },
    { id:'stoicism',     label:'Stoicism',          group:'mind'   },
    { id:'discipline',   label:'Discipline',        group:'craft'  },
    { id:'markets',      label:'Markets',           group:'mind'   },
    { id:'incentives',   label:'Incentives',        group:'mind'   },
    { id:'fll',          label:'FLL World #8',      group:'build'  },
    { id:'headboy',      label:'Head Boy',          group:'people' },
    { id:'orbital',      label:'Orbital Guardian',  group:'build'  },
    { id:'mathematics',  label:'Mathematics',       group:'mind'   },
    { id:'terra',        label:'Terra Mitra',       group:'build'  },
    { id:'shravan',      label:'Shravan Doot',      group:'build'  },
    { id:'codex',        label:'Journaling',        group:'craft'  },
    { id:'blackscholes', label:'Black-Scholes',       group:'mind'   },
    { id:'f1',           label:'F1 & Motorsport',    group:'passion'},
    { id:'pens',         label:'Fountain Pens',       group:'craft'  },
    { id:'art',          label:'Art & Illustration',  group:'craft'  },
    { id:'space',        label:'Space & Cosmology',   group:'mind'   },
    { id:'indianmusic',  label:'Indian Classical',    group:'craft'  },
    { id:'content',      label:'Content Creation',    group:'craft'  },
  ],

  edges: [
    { s:'violin',       t:'discipline',   label:'requires'              },
    { s:'violin',       t:'systems',      label:'reveals harmony in'    },
    { s:'violin',       t:'mathematics',  label:'governed by'           },
    { s:'robotics',     t:'fll',          label:'produced'              },
    { s:'robotics',     t:'systems',      label:'develops'              },
    { s:'robotics',     t:'code',         label:'demands'               },
    { s:'economics',    t:'markets',      label:'studies'               },
    { s:'economics',    t:'incentives',   label:'maps'                  },
    { s:'economics',    t:'systems',      label:'applies'               },
    { s:'economics',    t:'blackscholes', label:'spawned'               },
    { s:'philosophy',   t:'stoicism',     label:'contains'              },
    { s:'philosophy',   t:'writing',      label:'channels'              },
    { s:'stoicism',     t:'discipline',   label:'demands'               },
    { s:'stoicism',     t:'markets',      label:'mirrors equilibrium of'},
    { s:'leadership',   t:'headboy',      label:'expressed as'          },
    { s:'leadership',   t:'incentives',   label:'leverages'             },
    { s:'code',         t:'orbital',      label:'built'                 },
    { s:'code',         t:'terra',        label:'built'                 },
    { s:'code',         t:'shravan',      label:'built'                 },
    { s:'systems',      t:'markets',      label:'explains'              },
    { s:'discipline',   t:'fll',          label:'enabled'               },
    { s:'incentives',   t:'terra',        label:'fixes broken'          },
    { s:'incentives',   t:'markets',      label:'drives'                },
    { s:'mathematics',  t:'markets',      label:'quantifies'            },
    { s:'mathematics',  t:'blackscholes', label:'founds'                },
    { s:'mathematics',  t:'violin',       label:'harmonic series in'    },
    { s:'writing',      t:'codex',        label:'produced'              },
    { s:'writing',      t:'philosophy',   label:'channels'              },
    { s:'blackscholes', t:'markets',      label:'prices'                },
    { s:'leadership',   t:'shravan',      label:'empathy drove'         },
    { s:'f1',           t:'systems',      label:'applies at extreme scale'},
    { s:'f1',           t:'discipline',   label:'demands'               },
    { s:'f1',           t:'mathematics',  label:'optimised by'          },
    { s:'pens',         t:'writing',      label:'tools of'              },
    { s:'pens',         t:'discipline',   label:'slows into'            },
    { s:'art',          t:'philosophy',   label:'visual form of'        },
    { s:'art',          t:'writing',      label:'parallel expression to' },
    { s:'space',        t:'orbital',      label:'obsession produced'    },
    { s:'space',        t:'mathematics',  label:'described by'          },
    { s:'indianmusic',  t:'violin',       label:'parallel tradition to' },
    { s:'indianmusic',  t:'mathematics',  label:'raga structured by'    },
    { s:'content',      t:'writing',      label:'writing in motion'     },
    { s:'content',      t:'philosophy',   label:'thinking in public via' },
  ],

  // ── Hover card details — edit these ────────────────────────────────────────
  details: {

    violin: {
      origin:  'I started learning violin at 8 and worked through the ISOM grades to Grade 6. It eventually led to performances at Hard Rock Cafe, Connaught Place, and a live showcase at The Piano Man in New Delhi.',
      shaped:  'Violin taught me patience before anything else did. It made repetition feel normal and showed me how small improvements compound over time.',
      now:     'I still practice, and I still notice how musical structure shows up in mathematics, rhythm, and the way I think.',
    },

    economics: {
      origin:  "Economics became serious for me through Yale's Financial Markets course, independent reading, and constantly asking what incentives are driving a system.",
      shaped:  'It changed the way I look at events, institutions, and even everyday decisions. I started caring more about cost, trade-offs, incentives, and long-term value creation.',
      now:     'I am studying Economics & Business Administration at Aalto University, where I started in August 2026.',
    },

    robotics: {
      origin:  'FIRST Lego League, starting around 12. Robot design, sensor fusion, and autonomous decision logic.',
      shaped:  'Robotics made systems thinking concrete. A robot that fails tells you exactly where your mental model broke. No ambiguity. That clarity became a standard.',
      now:     "Not actively building robots, but the systems mindset carries into everything — Terra Mitra, Orbital Guardian, school operations.",
    },

    philosophy: {
      origin:  'Started with Aurelius and Seneca out of curiosity, then deeper into epistemology and philosophy of mind.',
      shaped:  'Gave me a framework for thinking about thinking. Epistemology especially — how do we know what we know? That question reshapes every other answer.',
      now:     'Philosophy mainly shows up in how I read, journal, lead, and think about economics.',
    },

    leadership: {
      origin:  'I was elected Head Boy for DAV Public School in 2025-26, representing 3,500+ students and helping coordinate a 70-member council.',
      shaped:  'It taught me that leadership is mostly operational. When ACON registrations slowed down, I called previous schools directly and helped bring two of them back into the event.',
      now:     'The term ended when I graduated in 2026. What stayed is the habit of balancing representation, event work, and the less visible administrative side of any institution.',
    },

    code: {
      origin:  'I started with self-taught Python and learned mostly by building projects instead of waiting to feel ready.',
      shaped:  'Coding gave me a practical way to test ideas. It rewards clarity, iteration, and the willingness to debug patiently.',
      now:     'I use Python for simulation and experiments, and HTML/CSS/JS when I want to put something usable in front of people quickly.',
    },

    writing: {
      origin:  'I started journaling privately and kept returning to it because it helped me think more honestly and more clearly.',
      shaped:  'Writing slows thought down enough to inspect it. It is where I notice bad reasoning, vague goals, or ideas that sound better than they actually are.',
      now:     'Journaling is still both a reflection habit and a decision-making tool for me.',
    },

    systems: {
      origin:  'Emerged from robotics and economics converging. Formalised through Meadows\' Thinking in Systems.',
      shaped:  'Systems thinking is the lens through which everything else makes sense. Feedback loops are in markets, orchestras, leadership, and codebases.',
      now:     'Applied constantly — how I think about institutions, portfolios, economics papers, and code architecture.',
    },

    stoicism: {
      origin:  "Meditations by Marcus Aurelius at 15. Then Seneca's letters. Then Epictetus.",
      shaped:  "It helped me separate what I can control from what I cannot and spend more time on action than on noise.",
      now:     'Daily practice. Informs how I lead, how I respond to pressure, and how I write.',
    },

    discipline: {
      origin:  'Violin before anything else. You cannot fake a practice session.',
      shaped:  "It taught me that consistency is usually less dramatic than motivation, but much more reliable.",
      now:     'Shows up in daily strength training, studying, writing schedule, and code commits.',
    },

    markets: {
      origin:  "I got interested in markets through economics reading, Yale's Financial Markets course, and then option-pricing concepts.",
      shaped:  'Markets made human behaviour feel measurable without making it simple. That combination of data and psychology is what keeps me interested.',
      now:     'I am especially interested in how risk, incentives, and information shape decisions inside markets.',
    },

    incentives: {
      origin:  'Economics and leadership converging. Reading Freakonomics alongside running a student body.',
      shaped:  'Incentives explain more human behaviour than intentions do. Once you understand what someone is optimising for, you understand their choices.',
      now:     'I still think about incentives whenever I look at adoption problems, especially in projects like Terra Mitra.',
    },

    fll: {
      origin:  'FIRST Lego League, Detroit 2019. Robot design and autonomous programming.',
      shaped:  'Competing globally at 12 showed me that age is not a prerequisite for serious work. World #8 out of 110+ nations.',
      now:     "The discipline and systems thinking from FLL went directly into every project since. Detroit is one of the three coordinates on the globe.",
    },

    headboy: {
      origin:  'Elected by peers and faculty. DAV Public School, representing 3,500 students.',
      shaped:  'The title is less interesting than the constraint: you have to move a large institution with limited authority. Teaches you to rely on persuasion, systems, and quiet consistency.',
      now:     'Served through the 2025–26 academic year. Now at Aalto University.',
    },

    orbital: {
      origin:  'Orbital Guardian started as a solo computer-vision project around space debris detection and a servo-aligned capture mechanism.',
      shaped:  'It taught me how to move from a broad technical idea to a demonstrable prototype. Presenting it directly to the Prime Minister made the project memorable, but the useful part was the building process.',
      now:     'The project is complete, and a lot of what I learned there carried into later coding and simulation work.',
    },

    mathematics: {
      origin:  'Formalised through school but deepened through music theory and financial modelling.',
      shaped:  "Mathematics is the only language that is simultaneously precise and universal. Violin harmonics and bond yield curves sharing the same equations is not a coincidence — it's a hint.",
      now:     'I keep seeing mathematics recur across coding, market models, music, and systems thinking.',
    },

    terra: {
      origin:  "Observed that India's agricultural extension system fails smallholder farmers at the last mile — information asymmetry and language barriers.",
      shaped:  'Building Terra Mitra showed me that the hardest part of a technology project is rarely the technology. It\'s the incentive structure and last-mile distribution.',
      now:     'The prototype is complete, and I still think about how adoption and last-mile trust matter as much as the technology.',
    },

    shravan: {
      origin:  'Shravan Doot came from noticing the gap in low-cost assistive technology for the hearing-impaired.',
      shaped:  'It pushed me to think more carefully about usability, cost, and how a prototype has to work for people who rely on it in real conditions.',
      now:     'The prototype is complete, and it remains one of the projects that most clearly combined engineering with empathy.',
    },

    codex: {
      origin:  'This node stands for journaling and reflective writing rather than public publishing.',
      shaped:  'Private writing has been useful because it gives me a place to test ideas without performance and record what I actually think.',
      now:     'It remains part of how I process decisions, goals, and lessons from the things I am building.',
    },

    blackscholes: {
      origin:  'I explored Monte Carlo simulation by comparing its outputs with the Black-Scholes formula.',
      shaped:  'The project made option pricing feel less abstract. It showed me how theory behaves once you actually implement it and compare the numbers.',
      now:     'It remains one of the projects that pulled together mathematics, coding, and my interest in finance.',
    },

    f1: {
      origin:  'Grew up watching Ferrari and McLaren. Then discovered the engineering: CFD, tyre degradation curves, pit stop decision theory.',
      shaped:  'F1 made optimisation feel visible. Every strategic choice has a trade-off, and that is probably why I keep coming back to it.',
      now:     'Still watching every race. Using it as a mental model for how constraints produce creativity.',
    },

    pens: {
      origin:  'Started collecting fountain pens at 14. Nib grinds, ink viscosity, paper texture — a completely analog obsession.',
      shaped:  "Using a fountain pen slows me down in a useful way. It makes writing feel more deliberate and less disposable.",
      now:     'Daily writer. Current daily driver is a Pilot Custom 74. The physicality of writing keeps ideas from becoming purely abstract.',
    },

    art: {
      origin:  'Sketchbooks since childhood. Moved from pencil sketching to digital illustration alongside writing.',
      shaped:  "Visual thinking is a different grammar. When an idea can't be written, it can often be drawn — and the drawing sometimes reveals what the writing was missing.",
      now:     'Art remains a quieter, more private part of how I think through ideas visually.',
    },

    space: {
      origin:  'Carl Sagan at 10. Then Hawking. Then actual orbital mechanics for Orbital Guardian.',
      shaped:  "Space resets the scale of everything. When you've thought seriously about stellar distances, most problems shrink to the right size. It's the most effective antidote to ego I've found.",
      now:     'I still read cosmology as a hobby, and Orbital Guardian grew directly out of that interest.',
    },

    indianmusic: {
      origin:  'Grew up hearing Carnatic and Hindustani at home. Studied the theory — ragas as mathematical mode systems — alongside learning Western violin.',
      shaped:  "Indian classical music is a different relationship with time than Western music. The raga is not a melody, it's a grammar — rules that constrain to liberate. That idea applies everywhere.",
      now:     'Listener more than player. Draws parallels between raga architecture and systems design. The two musical traditions inform each other.',
    },

    content: {
      origin:  'Started writing publicly — essays, breakdowns, ideas in progress. Content is writing that does not wait to be finished.',
      shaped:  'Publishing forces clarity in a way private writing does not. Knowing someone will read it removes the comfortable vagueness. Every post is a commitment to a position.',
      now:     'I still like the idea of writing in public occasionally, but most of my writing remains private and deliberate.',
    },

  }

};

export default GRAPH_DATA;
