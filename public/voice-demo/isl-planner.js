/* English text -> ordered list of ISL sign items.
 *
 * This is a rule-based gloss planner, not a translation model. It:
 *  - expands contractions and maps word forms / close synonyms onto signs that exist in
 *    the library ("eating" -> eat, "thanks" -> thank you, "mom" -> mother);
 *  - drops English function words that ISL does not sign (articles, copula, auxiliaries);
 *  - applies two well-documented ISL word-order conventions: time expressions come first
 *    in a clause, and question words go to the end;
 *  - fingerspells a word only when every letter has a recorded sign;
 *  - otherwise keeps the word as a caption-only item, so nothing the speaker said is lost.
 * Output still needs review by Deaf ISL users before it is described as accurate ISL.
 */

const CONTRACTIONS = [
  [/\bcan't\b/g, "can not"], [/\bwon't\b/g, "will not"], [/\bshan't\b/g, "shall not"], [/n't\b/g, " not"],
  [/'re\b/g, " are"], [/'m\b/g, " am"], [/'ll\b/g, " will"], [/'ve\b/g, " have"], [/'d\b/g, " would"],
  [/\b(it|that|what|who|where|when|why|how|he|she|there|here)'s\b/g, "$1 is"], [/\blet's\b/g, "let us"],
  [/'s\b/g, ""], [/'/g, ""]
];

// Multi-word phrases rewritten before matching (longest first).
const PHRASES = [
  [["thank", "you", "very", "much"], ["thank", "you"]], [["thank", "you", "so", "much"], ["thank", "you"]],
  [["thanks", "a", "lot"], ["thank", "you"]], [["many", "thanks"], ["thank", "you"]], [["thank", "u"], ["thank", "you"]],
  [["you", "are", "welcome"], ["welcome"]], [["good", "bye"], ["goodbye"]], [["bye", "bye"], ["goodbye"]]
].sort((a, b) => b[0].length - a[0].length);

// Close synonyms -> candidate library words (first one present in the library wins).
const SYNONYMS = {
  hi: ["hello"], hey: ["hello"], hii: ["hello"], namaste: ["hello"], namaskar: ["hello"],
  thanks: ["thank you"], thankyou: ["thank you"], thx: ["thank you"], dhanyavad: ["thank you"], shukriya: ["thank you"],
  bye: ["goodbye", "bye"],
  mom: ["mother"], mum: ["mother"], mummy: ["mother"], mommy: ["mother"], mama: ["mother"], maa: ["mother"], amma: ["mother"],
  dad: ["father"], daddy: ["father"], papa: ["father"], pappa: ["father"], appa: ["father"],
  bro: ["brother"], bhai: ["brother"], sis: ["sister"], didi: ["sister"],
  buddy: ["friend"], pal: ["friend"], dost: ["friend"],
  glad: ["happy"], joyful: ["happy"], cheerful: ["happy"], delighted: ["happy"],
  unhappy: ["sad"], upset: ["sad"], sorrowful: ["sad"],
  furious: ["angry"], annoyed: ["angry"], mad: ["angry"],
  pretty: ["beautiful"], lovely: ["beautiful"], gorgeous: ["beautiful"],
  silent: ["quiet"], noisy: ["loud"],
  apologies: ["sorry"], apologise: ["sorry"], apologize: ["sorry"],
  kitten: ["cat"], kitty: ["cat"], puppy: ["dog"],
  assist: ["help"], nap: ["sleep"], halt: ["stop"], gray: ["grey"],
  // "I" and "me" share one ISL sign (point to self); it is stored as "me" so it never collides with the letter I.
  i: ["me"], myself: ["me"], my: ["my", "me"], mine: ["my", "me"], your: ["your", "you"], yours: ["your", "you"]
};

const IRREGULAR = {
  ate: "eat", eaten: "eat", drank: "drink", drunk: "drink", slept: "sleep", wrote: "write", written: "write",
  sat: "sit", stood: "stand", went: "go", gone: "go", came: "come", saw: "see", seen: "see", taught: "teach",
  bought: "buy", brought: "bring", thought: "think", made: "make", gave: "give", given: "give", took: "take",
  taken: "take", told: "tell", said: "say", knew: "know", known: "know", ran: "run", spoke: "speak",
  children: "child", men: "man", women: "woman", people: "person", feet: "foot", teeth: "teeth", mice: "mouse",
  better: "good", best: "good", worse: "bad", worst: "bad"
};

// English words with no ISL sign of their own in typical gloss.
const DROP = new Set(["a", "an", "the", "is", "am", "are", "was", "were", "be", "been", "being", "do", "does", "did",
  "to", "of", "will", "shall", "would", "very", "so", "really", "just", "quite"]);
const AUX_HAVE = new Set(["have", "has", "had"]);
const NEGATION = new Set(["not", "no", "never", "nothing", "nobody", "none"]);
const TIME = new Set(["today", "tomorrow", "yesterday", "tonight", "now", "later", "soon"]);
const WH = new Set(["what", "where", "who", "when", "why", "how", "which"]);

const normalize = text => text.toLocaleLowerCase().normalize("NFC").replace(/[‘’ʼ]/g, "'");

// Candidate base forms of an inflected English word, most likely first.
const baseForms = w => {
  const out = [w];
  const push = s => s.length >= 3 && !out.includes(s) && out.push(s);
  IRREGULAR[w] && out.push(IRREGULAR[w]);
  const undouble = s => (/([bcdfgklmnprstvz])\1$/.test(s) ? s.slice(0, -1) : s);
  if (/ies$/.test(w)) push(w.slice(0, -3) + "y");
  if (/ied$/.test(w)) push(w.slice(0, -3) + "y");
  if (/ing$/.test(w)) { const s = w.slice(0, -3); push(s); push(s + "e"); push(undouble(s)); }
  if (/ed$/.test(w)) { const s = w.slice(0, -2); push(s); push(s + "e"); push(undouble(s)); push(w.slice(0, -1)); }
  if (/es$/.test(w)) push(w.slice(0, -2));
  if (/s$/.test(w) && !/ss$/.test(w)) push(w.slice(0, -1));
  if (/ly$/.test(w)) push(w.slice(0, -2));
  return out;
};

const resolveWord = (w, has) => [...(SYNONYMS[w] ?? []), ...baseForms(w).flatMap(b => [b, ...(SYNONYMS[b] ?? [])])].find(has) ?? null;

const rewritePhrases = tokens => {
  const out = [];
  for (let i = 0; i < tokens.length;) {
    const hit = PHRASES.find(([from]) => from.every((t, k) => tokens[i + k] === t));
    hit ? (out.push(...hit[1]), (i += hit[0].length)) : out.push(tokens[i++]);
  }
  return out;
};

const isParticiple = w => !!w && (/(ed|en|wn|ne)$/.test(w) || w in IRREGULAR);

const planClause = (raw, has, isQuestion, notes) => {
  const tokens = rewritePhrases(raw);
  const items = [];
  for (let i = 0; i < tokens.length;) {
    // Longest library phrase first (exact tokens, then base forms for the last word).
    let matched = null;
    for (let n = Math.min(4, tokens.length - i); n >= 2 && !matched; n--) {
      const words = tokens.slice(i, i + n);
      const key = words.join(" ");
      if (has(key)) matched = { word: key, n };
    }
    if (matched) { items.push({ kind: "sign", word: matched.word, label: matched.word }); i += matched.n; continue; }
    const w = tokens[i++];
    const word = resolveWord(w, has);
    if (word) { items.push({ kind: "sign", word, label: w === word ? word : `${w} → ${word}` }); continue; }
    if (DROP.has(w) || (AUX_HAVE.has(w) && isParticiple(tokens[i]))) continue;
    if (NEGATION.has(w)) notes.add("negation");
    const letters = /^[a-z0-9]+$/.test(w) ? [...w] : [];
    if (letters.length && letters.every(has)) {
      letters.forEach((ch, k) => items.push({ kind: "spell", word: ch, label: ch.toUpperCase(), group: w, first: k === 0 }));
      continue;
    }
    items.push({ kind: "text", word: w, label: w });
  }
  // ISL order: time expressions first, question words last.
  const isTime = it => TIME.has(it.word);
  const isWh = it => isQuestion && WH.has(it.word);
  return [...items.filter(isTime), ...items.filter(it => !isTime(it) && !isWh(it)), ...items.filter(it => !isTime(it) && isWh(it))];
};

export const planSentence = (text, has) => {
  const notes = new Set();
  let s = normalize(text);
  CONTRACTIONS.forEach(([re, rep]) => { s = s.replace(re, rep); });
  const clauses = s.split(/(?<=[.?!;,])/).map(c => ({
    tokens: c.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean),
    question: /\?\s*$/.test(c) || WH.has(c.trim().split(/\s+/)[0])
  }));
  const items = clauses.flatMap(c => planClause(c.tokens, has, c.question, notes));
  return { items, unsigned: [...new Set(items.filter(it => it.kind === "text").map(it => it.word))], notes: [...notes] };
};
