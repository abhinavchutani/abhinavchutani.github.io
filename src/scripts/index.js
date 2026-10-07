  const IS_MOBILE_LAYOUT = window.matchMedia('(max-width: 680px)').matches;

  /* =========================================================
     SKILL MODAL DATA
  ========================================================= */
  const SKILL_DATA = [
    {
      title: 'STRINGS',
      badge: 'Grade 6 ISOM · The Piano Man, Delhi',
      modalBg: '#FDE8EE',
      level: 78, levelLabel: 'Grade 6 · ISOM Certified',
      done: 'I started learning violin at age 8 and progressed through the ISOM grades to Grade 6. It led to performances at school, Hard Rock Cafe in Connaught Place, and a live showcase at The Piano Man in New Delhi.',
      feel: 'Violin has been my longest discipline. It trained my ear, my patience, and my tolerance for repetition long before I applied those habits anywhere else.',
      tags: ['Grade 6 ISOM', 'Hard Rock Cafe', 'The Piano Man', 'Classical', 'Performance']
    },
    {
      title: 'SYNTAX',
      badge: 'Self-Taught · Algorithmic Logic',
      modalBg: '#BBF7D0',
      level: 72, levelLabel: 'Intermediate — Advancing',
      done: 'I taught myself Python by building things instead of only studying syntax. That work led into Orbital Guardian, automation scripts, web experiments, and small data projects that helped me learn by shipping.',
      feel: 'Coding appeals to me because it makes vague ideas testable. If something works, it works. If it fails, the feedback is immediate.',
      tags: ['Self-Taught', 'Python', 'Orbital Guardian', 'Algorithms', 'Web Dev', 'Automation']
    },
    {
      title: 'INNOVATION',
      badge: 'Presented to PM of India · Pariksha Pe Charcha',
      modalBg: '#DDD6FE',
      level: 88, levelLabel: 'Advanced — Recognition at Highest Level',
      done: 'I built Orbital Guardian as a solo project focused on space debris detection through computer vision. The prototype uses CV to detect debris and align a servo-driven net with the target, and I presented it directly to the Prime Minister of India at Pariksha Pe Charcha 2024.',
      feel: 'Most of my projects start with a problem that stays in my head until I try to build around it. Orbital Guardian was one of the first times that instinct led to a national platform.',
      tags: ['PM of India', 'Pariksha Pe Charcha', 'Orbital Guardian', 'Space Tech', 'Solo Projects']
    },
    {
      title: 'LEADERSHIP',
      badge: 'Head Boy 2025–26 · 3,500 Students',
      modalBg: '#FEF08A',
      level: 92, levelLabel: 'Head Boy · School-Wide Authority',
      done: 'As Head Boy of DAV Public School in 2025–26, I represented a student body of 3,500+ and coordinated a 70-member council across school operations, assemblies, conflict resolution, safety drills, and student representation. I also helped launch the Mental Health Corner and led major events such as Scifest and Melange.',
      feel: 'Leadership has taught me to be useful before being visible. Most of the work is coordination, follow-through, and solving problems before they become public.',
      tags: ['Head Boy 2025–26', '3,500+ Students', '70-Member Council', 'DAV Public School', 'Mental Health Corner']
    },
    {
      title: 'ECONOMICS',
      badge: 'Yale Certified · Financial Markets',
      modalBg: '#A7F3D0',
      level: 75, levelLabel: 'Yale Certified — Deep Interest',
      done: 'I studied economics seriously through Yale University\'s Financial Markets course, independent reading, and my own attempts to understand incentives, risk, and public spending. That interest is now formal: I study Economics & Business Administration at Aalto University.',
      feel: 'Economics interests me because it connects ideas to consequences. I like asking not just whether something is impressive, but whether it is sustainable, efficient, and worth the cost.',
      tags: ['Aalto University', 'Yale Certified', 'Financial Markets', 'Behavioural Econ', 'Risk', 'Incentives']
    },
    {
      title: 'ROBOTICS',
      badge: 'FLL World #8 · Detroit 2019',
      modalBg: '#BFDBFE',
      level: 82, levelLabel: 'World Top-10 · FLL Champion',
      done: 'I represented India at the FIRST Lego League World Festival in Detroit, where our team finished 8th in the world after qualifying from North India. Robotics taught me early how design, code, and teamwork come together under competition pressure.',
      feel: 'FLL was one of the first times I saw how far disciplined iteration could take a team. It made global competition feel real rather than distant.',
      tags: ['FLL World #8', 'Detroit 2019', 'FIRST Lego League', 'Autonomous Programming', 'Team Lead', 'India Rep']
    },
    {
      title: 'PUBLIC SPEAKING',
      badge: 'High Commendation MUN · Stage',
      modalBg: '#FECACA',
      level: 80, levelLabel: 'High Commendation · MUN & Stage',
      done: 'I have spoken in assemblies, innovation events, MUNs, and school symposiums, including presentations in front of large student audiences and national platforms. Public speaking became important because most ideas only matter once you can explain them clearly.',
      feel: 'Speaking well has become less about confidence and more about clarity. If I know the material properly, the room usually takes care of itself.',
      tags: ['High Commendation', 'MUN', 'Assembly Speeches', 'Event Host', 'PM Presentation', '3500+ Audience']
    },
    {
      title: 'DISCIPLINE',
      badge: 'Daily Discipline · Strength Training',
      modalBg: '#F3F4F6',
      level: 70, levelLabel: 'Consistent — Building Strength',
      done: 'Training at the gym daily as part of a deliberate discipline practice. Focus on compound movements, progressive overload, and strength development. The gym became a non-negotiable part of my morning routine.',
      feel: 'The gym keeps me honest because progress is measurable. It is one of the simplest places in my routine: show up, do the work, repeat.',
      tags: ['Daily Training', 'Strength', 'Compound Lifts', 'Progressive Overload', 'Discipline']
    },
    {
      title: 'READING',
      badge: 'Finance · Economics · Philosophy',
      modalBg: '#FDE68A',
      level: 85, levelLabel: 'Cross-Disciplinary Reading Habit',
      done: 'I read widely across finance, economics, philosophy, history, and biography. A lot of my thinking starts from reading one good idea closely enough to test it against my own life or work.',
      feel: 'Reading is one of the main ways I sharpen judgment. It gives me better questions, not just more information.',
      tags: ['Finance', 'Economics', 'Philosophy', 'History', 'Behaviour', 'Daily Habit']
    },
    {
      title: 'JOURNALING',
      badge: 'Daily Reflection · Creative Writing',
      modalBg: '#BBF7D0',
      level: 76, levelLabel: 'Daily Practice',
      done: 'I use journaling both as private reflection and as a decision-making tool. It helps me slow down, think through trade-offs, and keep a written record of what I am actually trying to improve.',
      feel: 'Most of my clearest thinking happens on paper. Journaling is where ideas stop sounding good in my head and start facing structure.',
      tags: ['Daily', 'Reflection', 'Creative Writing', 'Thinking Tool', 'Gratitude']
    },
    {
      title: 'DESIGN',
      badge: 'Photoshop · Brand Identity · UI/UX',
      modalBg: '#FBCFE8',
      level: 74, levelLabel: 'Intermediate — Multiple Tools',
      done: 'I use Photoshop, Figma, and Canva for event materials, posters, interfaces, and small brand systems. Design became useful to me because it helps ideas land better, especially when I am building something quickly.',
      feel: 'Good design is usually quiet. It makes things easier to understand and easier to trust.',
      tags: ['Photoshop', 'Figma', 'Brand Identity', 'UI/UX', 'Event Design', 'Canva']
    },
    {
      title: 'MUSICALITY',
      badge: 'Rhythm & Percussion · Self-Taught',
      modalBg: '#FDE68A',
      level: 65, levelLabel: 'Self-Taught — Intermediate',
      done: 'Self-taught drummer, learning primarily through YouTube, music theory, and playing along to tracks. Can hold grooves, play fills, and play in multiple styles. Not formally trained, but rhythmically strong from violin background.',
      feel: 'Drums are a different kind of outlet from violin. They are less formal for me, but they keep my sense of rhythm sharp and make music feel lighter.',
      tags: ['Self-Taught', 'Rhythm', 'Percussion', 'Multi-Style', 'Groove']
    },
    {
      title: 'VENTURES',
      badge: 'Product Builds · Cold Outreach · Execution',
      modalBg: '#FEF9C3',
      level: 63, levelLabel: 'Early-Stage Building',
      done: 'I use small ventures to learn execution under real conditions. MarksMaxxing was the clearest early example: a 10-day AI exam-analysis build. Engram, an AI organizational memory auditor built for RELEX at the Aalto AI Hackathon, is the most recent finished one, and I am now working on a Quantum x Finance hackathon project at Ultrahack. Endless Media taught me outreach and meetings early, while Kaizen Ace taught me fulfilment, unit economics, and positioning.',
      feel: 'I value these experiments because they force ideas into contact with customers, constraints, and consequences.',
      tags: ['Engram', 'MarksMaxxing', 'Execution', 'Cold Outreach', 'Unit Economics', 'Product Building']
    },
    {
      title: 'PHILOSOPHY',
      badge: 'Stoics · Systems Thinking',
      modalBg: '#C7D2FE',
      level: 80, levelLabel: 'Deep Practice — Stoic Framework',
      done: 'I read philosophy because it helps me think more carefully about discipline, incentives, meaning, and judgment. Stoicism has been the most practical framework, especially in how I approach pressure and decision-making.',
      feel: 'Philosophy is useful to me when it changes behaviour, not only language. I come back to it when I need a clearer standard for how to think.',
      tags: ['Stoics', 'Marcus Aurelius', 'Systems Thinking', 'Epistemology', 'Daily Practice']
    },
    {
      title: 'ART & ILLUSTRATION',
      badge: 'Visual Thinking · Sketchbooks',
      modalBg: '#FFEDD5',
      level: 62, levelLabel: 'Personal Practice',
      done: 'I keep sketchbooks and use drawing as a way to think visually through interfaces, layouts, and ideas. It is less public than my design work, but it still shapes how I build.',
      feel: 'Drawing helps when words are too slow. It is a direct way to test whether an idea has form or not.',
      tags: ['Sketchbooks', 'Visual Thinking', 'Ideation', 'Character Design', 'Personal']
    },
    {
      title: 'SYMPOSIUM',
      badge: 'Scifest · Melange · ACON · 2,000+ Attendees',
      modalBg: '#FEF9C3',
      level: 85, levelLabel: 'Large-Scale Event Lead',
      done: 'I helped organise and host Scifest, Melange, and ACON, with attendance across these events reaching roughly 2,000 people. The work included logistics, volunteer coordination, communication, stage management, and keeping things moving when plans changed.',
      feel: 'Events taught me how much execution matters. A good event looks smooth from the outside because a lot of messy work was handled early.',
      tags: ['Scifest', 'Melange', 'ACON', 'Event Operations', 'Logistics', 'Hosting']
    },
    {
      title: 'TECHNE',
      badge: '3DExperience · Rapid Prototyping',
      modalBg: '#E0F2FE',
      level: 68, levelLabel: 'Intermediate — 3DExperience',
      done: 'I trained in Dassault Systèmes 3DExperience for CAD modelling and used it across robotics and engineering projects. It gave me a more concrete understanding of how ideas translate into buildable components.',
      feel: 'CAD is useful because it forces precision. A design either resolves properly, or it does not.',
      tags: ['3DExperience', 'CATIA', 'Rapid Prototyping', 'FLL Robotics', 'Engineering']
    },
    {
      title: 'WEB & APP DESIGN',
      badge: 'Frontend · UI/UX · Figma',
      modalBg: '#ECFDF5',
      level: 78, levelLabel: 'Frontend — HTML/CSS/JS/Tailwind',
      done: 'I build websites and lightweight apps with HTML, CSS, JavaScript, and Tailwind. This portfolio is hand-coded, and so was MarksMaxxing, which I built and launched in under 10 days.',
      feel: 'I like web building because it combines design, logic, and speed. You can go from idea to a working product quickly enough to learn something real.',
      tags: ['HTML/CSS/JS', 'Tailwind', 'Figma', 'UI/UX', 'Frontend', 'This Portfolio']
    },
    {
      title: 'ORBITAL GUARDIAN',
      badge: 'Space Debris · Solo Project · 2024',
      modalBg: '#F0FEFF',
      level: 80, levelLabel: 'Solo Project — Complete',
      done: 'Orbital Guardian is my solo 2024 project on space debris detection through computer vision. The prototype uses CV to detect debris and move a servo-aligned net toward the target, which helped me connect programming with a physical response system.',
      feel: 'What kept me interested in Orbital Guardian was how technical curiosity could become something demonstrable. It pushed me to think more seriously about translating an idea into a working mechanism.',
      tags: ['Space Debris', 'Solo Project', '2024', 'Python', 'Physics Modelling', 'Innovation']
    }
  ];

  /* =========================================================
     HOVER COLORS per row (light + dark variants)
  ========================================================= */
  const ROW_COLORS = [
    '#FDE8EE','#BBF7D0','#DDD6FE','#FEF08A','#A7F3D0',
    '#BFDBFE','#FECACA','#F3F4F6','#FDE68A','#BBF7D0',
    '#FBCFE8','#FDE68A','#FEF9C3','#C7D2FE',
    '#FFEDD5','#FEF9C3','#E0F2FE','#ECFDF5','#F0FEFF'
  ];
  const ROW_COLORS_DARK = [
    '#3d1020','#0a2e1a','#221650','#312800','#0a2818',
    '#0a1a34','#320808','#232323','#302200','#0a2e1a',
    '#340d22','#302200','#252300','#141a42',
    '#281508','#252300','#081a2a','#081c14','#081a22'
  ];

  function applyRowColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = dark ? ROW_COLORS_DARK : ROW_COLORS;
    document.querySelectorAll('.project-row').forEach((row, i) => {
      if (colors[i]) row.style.setProperty('--hover-bg', colors[i]);
    });
  }
  applyRowColors();

  /* =========================================================
     DARK / LIGHT THEME TOGGLE
  ========================================================= */
  const themeToggle = document.getElementById('theme-toggle');

  function setTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '○';
      try { localStorage.setItem('theme', 'dark'); } catch(e) {}
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '☾';
      try { localStorage.setItem('theme', 'light'); } catch(e) {}
    }
    applyRowColors();
  }

  // Init toggle icon to match current theme
  if (document.documentElement.getAttribute('data-theme') === 'dark') {
    themeToggle.textContent = '○';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });

  /* =========================================================
     LOADER PARTICLE NETWORK
  ========================================================= */
  (function initLoaderParticles() {
    const canvas = document.getElementById('loader-canvas');
    const ctx    = canvas.getContext('2d');
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    let W, H, particles, animId;
    const COUNT = 55;
    const LINK_DIST = 160;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function mkParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.6 + 0.8,
        // each particle slowly pulses opacity
        phase: Math.random() * Math.PI * 2
      };
    }

    particles = Array.from({ length: COUNT }, mkParticle);

    function draw(ts) {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      const dark  = isDark();
      const baseR = dark ? 237 : 17;
      const baseG = dark ? 237 : 17;
      const baseB = dark ? 237 : 17;

      const t = ts * 0.001;

      // update
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw dots
      for (const p of particles) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + p.phase);
        const alpha = 0.12 + 0.14 * pulse;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    draw(0);

    // Stop when loader is gone
    const observer = new MutationObserver(() => {
      if (document.getElementById('loader').style.display === 'none') {
        cancelAnimationFrame(animId);
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('loader'), { attributes: true, attributeFilter: ['style'] });
  })();

  /* =========================================================
     LOADING SCREEN — progress counter + morph to nav
  ========================================================= */
  window.addEventListener('load', () => {
    positionIllustrations();
    const loader = document.getElementById('loader');
    const navBar = document.getElementById('site-header');

    if (IS_MOBILE_LAYOUT) {
      allRows.forEach(row => row.classList.add('in-view'));
      initialRevealDone = true;
      loader.style.display = 'none';
      navBar.classList.add('visible');
      return;
    }

    // Skip loader if already shown this session
    if (sessionStorage.getItem('acLoaded')) {
      loader.style.display = 'none';
      navBar.classList.add('visible');
      return;
    }
    sessionStorage.setItem('acLoaded', '1');

    const fill = document.getElementById('loader-fill');
    const pct  = document.getElementById('loader-pct');
    const morph= document.getElementById('loader-bar-morph');

    // Animate percentage counter
    let current = 0;
    const target = 100;
    const duration = 3100; // ms — matches CSS animation + slight buffer
    const startTime = performance.now();

    function updatePct(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      pct.textContent = current + '%';
      if (progress < 1) requestAnimationFrame(updatePct);
    }
    requestAnimationFrame(updatePct);

    // After fill completes, morph bar to nav then reveal
    setTimeout(() => {
      // Phase 1: hide blobs + text
      loader.classList.add('loader--hiding');

      // Phase 2: show morph bar and animate up
      setTimeout(() => {
        morph.style.opacity = '1';
        morph.classList.add('morph-active');

        // Phase 3: fade out loader, show nav
        setTimeout(() => {
          loader.classList.add('loader--out');
          navBar.classList.add('visible');
          setTimeout(() => { loader.style.display = 'none'; }, 600);
        }, 700);
      }, 320);
    }, 3200);
  });

  /* =========================================================
     CUSTOM CURSOR + AURA
  ========================================================= */
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  const aura = document.getElementById('aura');

  // Only run on devices that have a real pointer (not touch-only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let ax = mx, ay = my;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function raf() {
      // Cursor ring: fast follow
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      // Aura: very slow dreamy lag
      ax += (mx - ax) * 0.038;
      ay += (my - ay) * 0.038;
      aura.style.left = ax + 'px';
      aura.style.top  = ay + 'px';
      requestAnimationFrame(raf);
    })();
  } else {
    // Touch device — hide cursor elements
    ring.style.display = 'none';
    dot.style.display  = 'none';
    aura.style.display = 'none';
  }

  document.querySelectorAll('a, button, .project-row').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
  });

  /* =========================================================
     SCROLL REVEAL + INITIAL STAGGER
     First-load rows (visible in viewport after loader) cascade in
     with 55ms stagger. Scroll-reveal rows come in with a lighter
     20ms stagger (they're entering one by one already).
  ========================================================= */
  let initialRevealDone = false;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const row = entry.target;
      const idx = parseInt(row.dataset.revealIdx || 0);
      revealObserver.unobserve(row);

      if (!initialRevealDone) {
        // Sequential snap-in: slower stagger, springy overshoot
        const delay = 180 + idx * 88;
        setTimeout(() => {
          row.style.transition = 'none';
          row.classList.add('row-snap-in');
          row.addEventListener('animationend', () => {
            row.classList.remove('row-snap-in');
            row.classList.add('in-view');
            requestAnimationFrame(() => { row.style.transition = ''; });
          }, { once: true });
        }, delay);
      } else {
        // Scroll reveal: normal fade-up transition
        setTimeout(() => row.classList.add('in-view'), 30);
      }
    });
  }, { threshold: 0.02 });

  document.querySelectorAll('.project-row').forEach((row, i) => {
    row.dataset.revealIdx = i;
    revealObserver.observe(row);
  });

  // After initial animation finishes (~19 rows × 88ms + 180 + 760 buffer)
  setTimeout(() => { initialRevealDone = true; }, 4800);

  /* =========================================================
     ILLUSTRATION POSITIONING — place right after badge
  ========================================================= */
  function positionIllustrations() {
    document.querySelectorAll('.project-row').forEach(row => {
      const svg   = row.querySelector('.illus');
      const badge = row.querySelector('.badge');
      if (!svg) return;
      // Measure the badge's right edge relative to the row's left edge
      const anchor    = badge || row.querySelector('.project-title');
      const rowRect   = row.getBoundingClientRect();
      const anchRect  = anchor.getBoundingClientRect();
      const left      = anchRect.right - rowRect.left + 20;
      svg.style.left  = left + 'px';
      svg.style.right = 'auto';
    });
  }
  // Run multiple times to catch different layout phases:
  // 1) immediately after first paint
  // 2) after fonts settle (~300ms)
  // 3) after loader exits and rows reveal (~4.5s)
  requestAnimationFrame(() => positionIllustrations());
  setTimeout(() => positionIllustrations(), 350);
  setTimeout(() => positionIllustrations(), 4600);
  window.addEventListener('resize', positionIllustrations);

  /* =========================================================
     SKILL MODAL — OPEN / CLOSE
  ========================================================= */
  const overlay    = document.getElementById('skill-overlay');
  const modal      = document.getElementById('skill-modal');
  const closeBtn   = document.getElementById('skill-close');
  const modalTitle = document.getElementById('skill-modal-title');
  const modalEyebrow = document.getElementById('skill-modal-eyebrow');
  const modalDone  = document.getElementById('skill-modal-done');
  const modalFeel  = document.getElementById('skill-modal-feel');
  const levelPct   = document.getElementById('skill-modal-level-pct');
  const modalTags  = document.getElementById('skill-modal-tags');

  // Track all .project-row elements for morph reference
  const allRows = Array.from(document.querySelectorAll('.project-row'));
  let activeMobileRow = null;

  allRows.forEach(row => {
    const content = row.querySelector('.row-content');
    if (!content || content.querySelector('.mobile-row-arrow')) return;
    const arrow = document.createElement('span');
    arrow.className = 'mobile-row-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u2192';
    content.prepend(arrow);
  });

  function setActiveMobileRow(row) {
    if (!IS_MOBILE_LAYOUT) return;
    allRows.forEach(r => r.classList.remove('mobile-active'));
    activeMobileRow = row || null;
    if (activeMobileRow) activeMobileRow.classList.add('mobile-active');
  }

  function openModal(idx) {
    const d = SKILL_DATA[idx];
    if (!d) return;

    // Pick background colour matching the row's hover colour
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = dark ? ROW_COLORS_DARK : ROW_COLORS;
    const bg = colors[idx] !== undefined ? colors[idx] : d.modalBg;
    modal.style.setProperty('--modal-bg', bg);

    // Text colour: light on dark bg (dark mode), dark on pastel (light mode)
    if (dark) {
      modal.style.setProperty('--fg',    '#ededed');
      modal.style.setProperty('--muted', 'rgba(237,237,237,0.45)');
      modal.style.setProperty('--dim',   'rgba(237,237,237,0.12)');
      modal.style.color       = '#ededed';
      modal.style.borderColor = 'rgba(237,237,237,0.35)';
    } else {
      modal.style.setProperty('--fg',    '#111111');
      modal.style.setProperty('--muted', 'rgba(17,17,17,0.38)');
      modal.style.setProperty('--dim',   'rgba(17,17,17,0.10)');
      modal.style.color       = '#111';
      modal.style.borderColor = '#111';
    }

    // Fill content
    modalEyebrow.textContent = d.badge;
    modalTitle.textContent   = d.title;
    modalDone.textContent    = d.done;
    modalFeel.textContent    = d.feel;
    levelPct.textContent     = d.levelLabel;
    modalTags.innerHTML      = d.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

    // Show overlay + trigger modal open
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // One rAF to let the browser register the initial state, then add open class
    requestAnimationFrame(() => {
      modal.classList.add('modal-open');
    });
  }

  function closeModal() {
    modal.classList.remove('modal-open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => {
    const t = e.target;
    if (t === overlay || t.id === 'skill-overlay-bg' ||
        t.id === 'skill-overlay-dim' || t.id === 'skill-overlay-blur') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.project-row').forEach((row, i) => {
    row.addEventListener('click', e => {
      e.preventDefault();
      if (IS_MOBILE_LAYOUT) {
        if (row !== activeMobileRow) {
          setActiveMobileRow(row);
          return;
        }
      }
      openModal(i);
    });
  });

  if (IS_MOBILE_LAYOUT) {
    document.addEventListener('click', e => {
      if (!activeMobileRow) return;
      if (e.target.closest('.project-row') || e.target.closest('#skill-overlay')) return;
      setActiveMobileRow(null);
    });

    window.addEventListener('scroll', () => {
      if (!activeMobileRow) return;
      activeMobileRow.classList.remove('mobile-active');
      activeMobileRow = null;
    }, { passive: true });
  }

  /* =========================================================
     ILLUSTRATION — RISE FROM BELOW
  ========================================================= */
  document.querySelectorAll('.project-row').forEach(row => {
    const svg = row.querySelector('.illus');
    if (!svg) return;
    let hoverTimer = null, activeAnim = null;

    function cancelCurrent() {
      if (!activeAnim) return;
      try { activeAnim.pause(); } catch(e) {}
      const cs  = window.getComputedStyle(svg);
      const cT  = cs.transform, cO = cs.opacity;
      try { activeAnim.cancel(); } catch(e) {}
      activeAnim = null;
      svg.style.transform = cT; svg.style.opacity = cO;
      return { cT, cO };
    }

    function enterAnim() {
      cancelCurrent();
      svg.style.transform = 'translateY(120%)'; svg.style.opacity = '0';
      activeAnim = svg.animate([
        { opacity:0, transform:'translateY(120%)', offset:0 },
        { opacity:1, offset:0.18 },
        { opacity:1, transform:'translateY(0%)',   offset:1 }
      ], { duration:900, easing:'cubic-bezier(0.34,1.22,0.64,1)', fill:'forwards' });
      activeAnim.addEventListener('finish', () => {
        if (!activeAnim) return;
        svg.style.opacity='1'; svg.style.transform='translateY(0%)';
        activeAnim = svg.animate([
          { transform:'translateY(0px)'  },
          { transform:'translateY(-9px)' },
          { transform:'translateY(0px)'  }
        ], { duration:3600, iterations:Infinity, easing:'ease-in-out' });
      }, { once:true });
    }

    function exitAnim() {
      clearTimeout(hoverTimer); hoverTimer = null;
      const cur = cancelCurrent();
      if (!cur) return;
      const o = parseFloat(cur.cO);
      if (o < 0.05) { svg.style.transform=''; svg.style.opacity=''; return; }
      void svg.offsetWidth;
      activeAnim = svg.animate([
        { transform:cur.cT, opacity:cur.cO },
        { transform:'translateY(120%)', opacity:'0' }
      ], { duration:420, easing:'ease-in', fill:'forwards' });
      activeAnim.addEventListener('finish', () => {
        svg.style.transform=''; svg.style.opacity=''; activeAnim=null;
      }, { once:true });
    }

    row.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(enterAnim, 320);
    });
    row.addEventListener('mouseleave', exitAnim);
  });

  /* =========================================================
     PAGE LEAVE TRANSITION — fade out before navigating
  ========================================================= */
  (function(){
    const overlay = document.getElementById('page-leave-overlay');
    document.querySelectorAll('a[href="about.html"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const dest = a.href;
        overlay.style.pointerEvents = 'all';
        overlay.style.opacity = '1';
        setTimeout(() => { window.location.href = dest; }, 460);
      });
    });
  })();

  /* =========================================================
     GREETING CANVAS — animated flow lines, cursor-reactive
  ========================================================= */
  /* =========================================================
     GO DEEPER MARQUEE — physics scroll (accel/decel, no snap-back)
  ========================================================= */
  (function initMarquee() {
    const marquee = document.getElementById('cta-marquee');
    const track   = document.getElementById('cta-track');
    if (!marquee || !track) return;

    let pos = 0, speed = 0, hovered = false;
    const MAX_SPEED = 15;   // px/frame at 60fps
    const ACCEL     = 0.15;  // px/frame² acceleration
    const DECEL     = 0.1; // px/frame² deceleration

    marquee.addEventListener('mouseenter', () => { hovered = true; });
    marquee.addEventListener('mouseleave', () => { hovered = false; });

    let setW = 0;
    function measure() {
      const s = track.querySelector('.cta-set');
      setW = s ? s.offsetWidth : track.scrollWidth / 2;
    }
    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    (function tick() {
      requestAnimationFrame(tick);
      if (hovered) speed = Math.min(speed + ACCEL, MAX_SPEED);
      else         speed = Math.max(speed - DECEL, 0);

      if (speed > 0.005) {
        pos -= speed;
        if (setW > 0 && pos <= -setW) pos += setW;
        track.style.transform = `translateX(${pos}px)`;
      }
    })();
  })();

  (function initGreetingCanvas() {
    const canvas = document.getElementById('greeting-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, mx = -9999, my = -9999, t = 0;
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const ROWS = 5, COLS = 32;

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = r.width  || window.innerWidth;
      H = canvas.height = r.height || 80;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track cursor only over this section
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      t += 0.006;
      const dark = isDark();
      ctx.strokeStyle = dark ? 'rgba(237,237,237,0.09)' : 'rgba(17,17,17,0.09)';
      ctx.lineWidth = 0.8;

      for (let r = 0; r < ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) {
          const bx = (c / COLS) * W;
          const by = ((r + 0.5) / ROWS) * H;
          // Slow sine wave
          const wave = Math.sin(bx * 0.014 + t + r * 0.7) * (H * 0.18);
          // Cursor proximity pull
          const dx = mx - bx, dy = my - by;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / 180) * 22;
          const px = bx + (dx / (dist + 1)) * pull;
          const py = by + wave + (dy / (dist + 1)) * pull;
          c === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    })();
  })();
