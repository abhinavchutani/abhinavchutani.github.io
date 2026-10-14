/**
 * Turns content.ts into the page's HTML. Runs at build time (see
 * vite.config.ts), so the document that ships is real, readable markup with
 * no JavaScript; the stage then pins each `.sign` into the 3D scene.
 */
import { chapters, count, disciplines, models, person, projects, stageList, type Build, type Skill, type Stage } from "./content";

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const two = (n: number) => String(n).padStart(2, "0");

/** The sign's headline skill: everything about it. */
function first(skill: Skill, measured = true) {
  const meter = skill.level === undefined || !measured ? "" : `<div class="meter" style="--level:${skill.level}"><b>${skill.level}</b><i></i><em>${esc(skill.levelLabel ?? "")}</em></div>`;
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

/** A list of things built: name and what kind of thing on the left, what it was on the right. */
function rows(label: string, list: Build[]) {
  return `
      <p class="label">${esc(label)}</p>
      <ul class="cards rows">${list.map((b) => `<li><h3>${esc(b.name)}</h3><p class="badge">${esc(b.sub)}</p><p>${esc(b.text)}</p></li>`).join("")}</ul>`;
}

function body(stage: Stage) {
  const skills = stage.skills ?? [];
  switch (stage.kind) {
    case "hero":
      return `
      <p class="kicker"><span>${esc(person.place)}</span><span>${esc(person.edition)}</span></p>
      <h1 class="name"><span class="first">${esc(person.first)}</span><span class="last">${esc(person.last)}</span></h1>
      <p class="lede">${esc(person.line)}</p>
      <a class="cue" href="#${chapters[1].id}"><i></i>One thread, ${count.word} disciplines</a>`;
    case "economics":
      return first(skills[0]) + rows("In code", models);
    case "projects":
      return `
      <h2 class="title serif">Four more.</h2>` + rows("Projects", projects);
    case "contact":
      return `
      <h2 class="title serif">Let's talk.</h2>
      <p class="done">${esc(person.open)}</p>
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

/** Screens of scroll between one stage and the next: one, everywhere, so every move costs the hand the same. */
export const SPAN = 1;

export function renderPage() {
  let index = 0;
  const total = stageList.length;
  const sections = chapters
    .map((chapter, c) => {
      const signs = chapter.stages
        .map((stage) => {
          const k = index++;
          const kicker = stage.kind === "hero" ? "" : `<p class="kicker"><span class="idx">${two(c)}</span><span>${esc(stage.kicker ?? chapter.name)}</span><span class="of">${two(k)} / ${two(total - 1)}</span></p>`;
          const caption = stage.caption ? `<p class="caption">${esc(stage.caption)}</p>` : "";
          return `
    <article class="sign${stage.kind ? ` is-${stage.kind}` : ""}" data-stage="${k}">
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
    disciplines.map((node) => `<span class="follower node" data-follow="aurora:${node.key}" data-step="1" style="--accent:${chapters[node.chapter].accent}">${esc(node.name)}</span>`).join("") +
    projects.map((p) => `<span class="follower node exhibit" data-follow="orbit:${p.key}" data-step="1">${esc(p.name)}</span>`).join("") +
    models.map((m) => `<span class="follower node exhibit" data-follow="chart:${m.key}" data-step="0" style="--accent:${chapters[1].accent}">${esc(m.name)}</span>`).join("");

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
  <div class="ruler" aria-hidden="true">${stageList.map((_, i) => `<i data-tick="${i}"></i>`).join("")}</div>
  <div class="frame" data-frame data-vibe="top" aria-hidden="true">
    <i class="edge t"></i><i class="edge b"></i><i class="edge l"></i><i class="edge r"></i>
    <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
  </div>
  <button class="gauge" type="button" data-gauge hidden></button>
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
