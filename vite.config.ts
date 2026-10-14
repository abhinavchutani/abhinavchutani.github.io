import { defineConfig, type Plugin } from "vite";
import { renderPage } from "./src/render";

/** Writes the page's markup into index.html at build time, so it is readable without JavaScript. */
const page = (): Plugin => ({
  name: "render-page",
  transformIndexHtml: (html) => html.replace("<!--page-->", renderPage()),
});

/**
 * Shaders ship as strings, which a minifier leaves alone: their comments and layout would go out as written.
 * In a build, every string tagged `/* glsl *\/` loses its comments, its indentation and its blank lines
 * (each line is kept, so preprocessor lines such as `#include` stay on lines of their own).
 */
const shaders = (): Plugin => ({
  name: "strip-shader-comments",
  apply: "build",
  // Before TypeScript is compiled, while the `/* glsl */` tags are still there to find.
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("/src/") || !id.endsWith(".ts")) return null;
    const out = code.replace(/\/\* glsl \*\/\s*`([^`]*)`/g, (_whole, body: string) => {
      const lines = body
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split("\n")
        .map((line) => line.replace(/\/\/.*$/, "").replace(/\s+/g, " ").trim())
        .filter(Boolean);
      return "`" + lines.join("\n") + "`";
    });
    return out === code ? null : { code: out, map: null };
  },
});

export default defineConfig({
  // Relative asset paths: the build works at a domain root and under a GitHub Pages project path alike.
  base: "./",
  plugins: [page(), shaders()],
  // No source maps, no comments: what is shipped is the minified build and nothing that explains it.
  build: { target: "es2022", sourcemap: false, minify: true, cssMinify: true },
});
