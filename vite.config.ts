import { defineConfig, type Plugin } from "vite";
import { renderPage } from "./src/render";

/** Writes the page's markup into index.html at build time, so it is readable without JavaScript. */
const page = (): Plugin => ({
  name: "render-page",
  transformIndexHtml: (html) => html.replace("<!--page-->", renderPage()),
});

export default defineConfig({
  // Relative asset paths: the build works at a domain root and under a GitHub Pages project path alike.
  base: "./",
  plugins: [page()],
  build: { target: "es2022" },
});
