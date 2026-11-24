const fs = require("fs");
const path = require("path");

// Count the signs at build time so the numbers on the site never go stale when the library grows.
function signStats() {
  try {
    const index = JSON.parse(fs.readFileSync(path.join(__dirname, "public/voice-demo/sign-index.json"), "utf8"));
    const signs = index.signs ?? [];
    const sentences = signs.filter((s) => s.kind === "sentence").length;
    return { words: signs.length - sentences, sentences };
  } catch {
    return { words: 0, sentences: 0 };
  }
}
const stats = signStats();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SIGN_COUNT: String(stats.words),
    NEXT_PUBLIC_SENTENCE_COUNT: String(stats.sentences),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
