/**
 * Turns content.ts into the page's HTML. Runs at build time (see
 * vite.config.ts), so the document that ships is real, readable markup with
 * no JavaScript; the stage then pins each `.sign` into the 3D scene.
 */
import { builds, chapters, count, disciplines, now, person, stageList, stats, type Skill, type Stage } from "./content";

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const two = (n: number) => String(n).padStart(2, "0");

/** The sign's headline skill: everything about it. */
function first(skill: Skill) {
  const meter = skill.level === undefined ? "" : `<div class="meter" style="--level:${skill.level}"><b>${skill.level}</b><i></i><em>${esc(skill.levelLabel ?? "")}</em></div>`;
  return `
      <div class="skill">
        <h2 class="title">${esc(skill.name)}</h2>
        <p class="badge">${esc(skill.badge)}</p>
        <p class="done">${esc(skill.done)}</p>
        ${skill.feel ? `<blockquote class="feel">${esc(skill.feel)}</blockquote>` : ""}
        ${meter}
      </div>`;
}

/** The skills that share its place: a name, a line. */
function rest(skills: Skill[]) {
  if (skills.length === 0) return "";
  return `
      <div class="seconds n${skills.length}">${skills
        .map(
          (skill) => `
        <div class="skill second">
          <h2 class="title">${esc(skill.name)}</h2>
          <p class="badge">${esc(skill.badge)}</p>
          <p class="done">${esc(skill.done)}</p>
        </div>`,
        )
        .join("")}
      </div>`;
}

function body(stage: Stage) {
  const skills = stage.skills ?? [];
  switch (stage.kind) {
    case "hero":
      return `
      <p class="kicker"><span>${esc(person.place)}</span><span>${esc(person.edition)}</span></p>
      <h1 class="name"><span class="first">${esc(person.first)}</span><span class="last">${esc(person.last)}</span></h1>
      <p class="lede">${esc(person.line)}</p>
      <a class="cue" href="#sound"><i></i>One thread, ${count.word} disciplines</a>`;
    case "economics":
      return `${first(skills[0])}
      <p class="label">Projects</p>
      <ul class="cards rows">${builds.map((b) => `<li><h3>${esc(b.name)}</h3><p class="badge">${esc(b.sub)}</p><p>${esc(b.text)}</p></li>`).join("")}</ul>`;
    case "connect":
      return `
      <h2 class="title serif">How it connects.</h2>
      <p class="done">The goal is not to separate these interests, but to use the overlap well. Intersections over silos.</p>
      <dl class="stats">${stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join("")}</dl>`;
    case "now":
      return `
      <h2 class="title serif">What I am building.</h2>
      <ul class="now">${now.map((n) => `<li><b>${esc(n.tag)}</b><span>${esc(n.text)}</span></li>`).join("")}</ul>
      <div class="contact">
        <a class="big" href="mailto:${person.email}">${person.email}</a>
        <a href="${person.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
        <span>${esc(person.location)}</span>
      </div>
      <p class="fine">${esc(person.first)} ${esc(person.last)} © 2026</p>`;
    default:
      return first(skills[0]) + rest(skills.slice(1));
  }
}

/** Screens of scroll between one stage and the next: long enough that a move is scrubbed, not triggered. */
export const SPAN = 2;

export function renderPage() {
  let index = 0;
  const total = stageList.length;
  const sections = chapters
    .map((chapter, c) => {
      const signs = chapter.stages
        .map((stage) => {
          const k = index++;
          const kicker = stage.kind === "hero" ? "" : `<p class="kicker"><span class="idx">${two(c)}</span><span>${esc(stage.kicker ?? chapter.name)}</span></p>`;
          const caption = stage.caption ? `<p class="caption">${esc(stage.caption)}</p>` : "";
          const id = stage.kind === "now" ? ` id="contact"` : "";
          return `
    <article class="sign${stage.kind ? ` is-${stage.kind}` : ""}"${id} data-stage="${k}">
      ${kicker}${body(stage)}
      ${caption}
    </article>`;
        })
        .join("");
      // One stop per stage: where it begins is where the page rests on that stage; how tall it is,
      // is how much scroll the move to the next stage takes. (The last has nowhere to go: one screen.)
      const first = index - chapter.stages.length;
      const halts = chapter.stages.map((_, j) => `<i class="stop" aria-hidden="true" style="--span:${first + j === total - 1 ? 1 : SPAN}"></i>`).join("");
      return `
  <section id="${chapter.id}" data-chapter="${chapter.id}" data-steps="${chapter.stages.length}" data-look="${chapter.look}" style="--accent:${chapter.accent};--ground:${chapter.ground}" aria-label="${esc(chapter.name)}">${signs}
    ${halts}
  </section>`;
    })
    .join("");

  const rail = chapters.map((chapter, c) => `<a href="#${chapter.id}" data-rail="${c}"><span>${two(c)} ${esc(chapter.name)}</span><i></i></a>`).join("");

  // Labels that ride on things in the scene: place key, anchor name, and the step of the place they show on.
  const followers =
    disciplines.map((node) => `<span class="follower node" data-follow="aurora:${node.key}" data-step="0" style="--accent:${chapters[node.chapter].accent}">${esc(node.name)}</span>`).join("") +
    `<span class="follower prop" data-follow="chart:quantum" data-step="0">Quantum × Finance<em>3rd · Ultrahack</em></span>`;

  return `
<canvas class="stage" id="stage" aria-hidden="true"></canvas>
<header class="hud" data-hud>
  <a class="brand" href="#top">${esc(person.first)} ${esc(person.last)}</a>
  <div class="tools">
    <button class="sound" type="button" data-sound aria-pressed="false">Sound off</button>
    <a class="pill" href="#contact">Contact</a>
  </div>
  <nav class="rail" aria-label="Chapters">${rail}</nav>
  <p class="readout" aria-hidden="true"><b data-readout-index>00</b><span data-readout-name>Origin</span><em data-readout-stage>01 / ${two(stageList.length)}</em></p>
  <div class="progress" aria-hidden="true"><i data-progress></i></div>
</header>
<div class="opener" data-opener aria-hidden="true">
  <p><span>Loading</span><b data-count>000</b><span>%</span></p>
  <i class="bar"><i data-bar></i></i>
  <button type="button" data-skip tabindex="-1">Skip</button>
</div>
<main>${sections}
</main>
<div class="followers" aria-hidden="true">${followers}</div>`;
}
