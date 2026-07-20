/**
 * Tiny tokenizer for docs code panels — no Prism/Shiki.
 * Colors applied via CSS classes from our palette.
 */

export type TokenKind =
  | "plain"
  | "key"
  | "string"
  | "number"
  | "keyword"
  | "punct"
  | "comment"
  | "flag"
  | "cmd";

export type CodeToken = { kind: TokenKind; text: string };

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-white/70",
  key: "text-[#7eb8a4]",
  string: "text-[#e8e0d4]",
  number: "text-[#7eb8a4]/85",
  keyword: "text-[#7eb8a4]",
  punct: "text-white/40",
  comment: "text-white/35",
  flag: "text-[#7eb8a4]/80",
  cmd: "text-white",
};

export function tokenClass(kind: TokenKind) {
  return TOKEN_CLASS[kind];
}

function readString(s: string, start: number): { end: number; text: string } {
  const quote = s[start];
  let j = start + 1;
  let escaped = false;
  while (j < s.length) {
    if (escaped) {
      escaped = false;
      j++;
      continue;
    }
    if (s[j] === "\\") {
      escaped = true;
      j++;
      continue;
    }
    if (s[j] === quote) {
      j++;
      break;
    }
    j++;
  }
  return { end: j, text: s.slice(start, j) };
}

/** Highlight JSON for display. */
export function tokenizeJson(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  const s = source;

  while (i < s.length) {
    const ch = s[i];

    if (ch === '"' || ch === "'") {
      const { end, text } = readString(s, i);
      let k = end;
      while (k < s.length && /\s/.test(s[k])) k++;
      tokens.push({ kind: s[k] === ":" ? "key" : "string", text });
      i = end;
      continue;
    }

    if (
      (ch === "-" && /[0-9]/.test(s[i + 1] ?? "")) ||
      /[0-9]/.test(ch)
    ) {
      let j = i + 1;
      while (j < s.length && /[0-9.eE+\-]/.test(s[j])) j++;
      tokens.push({ kind: "number", text: s.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
      const word = s.slice(i, j);
      tokens.push({
        kind:
          word === "true" || word === "false" || word === "null"
            ? "keyword"
            : "plain",
        text: word,
      });
      i = j;
      continue;
    }

    if ("{}[]:,".includes(ch)) {
      tokens.push({ kind: "punct", text: ch });
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      tokens.push({ kind: "plain", text: s.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ kind: "plain", text: ch });
    i++;
  }

  return tokens;
}

/** Highlight shell / cURL snippets. */
export function tokenizeShell(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const lines = source.split(/(\n)/);

  for (const line of lines) {
    if (line === "\n") {
      tokens.push({ kind: "plain", text: "\n" });
      continue;
    }
    if (line.trimStart().startsWith("#")) {
      tokens.push({ kind: "comment", text: line });
      continue;
    }

    let i = 0;
    while (i < line.length) {
      if (/\s/.test(line[i])) {
        let j = i + 1;
        while (j < line.length && /\s/.test(line[j])) j++;
        tokens.push({ kind: "plain", text: line.slice(i, j) });
        i = j;
        continue;
      }

      if (line[i] === '"' || line[i] === "'") {
        const { end, text } = readString(line, i);
        tokens.push({ kind: "string", text });
        i = end;
        continue;
      }

      if (line[i] === "-") {
        let j = i + 1;
        while (j < line.length && /[A-Za-z0-9\-]/.test(line[j])) j++;
        tokens.push({ kind: "flag", text: line.slice(i, j) });
        i = j;
        continue;
      }

      let j = i + 1;
      while (
        j < line.length &&
        !/\s/.test(line[j]) &&
        line[j] !== '"' &&
        line[j] !== "'"
      ) {
        j++;
      }
      const word = line.slice(i, j);
      if (word === "curl" || word === "fetch") {
        tokens.push({ kind: "cmd", text: word });
      } else if (word === "\\") {
        tokens.push({ kind: "punct", text: word });
      } else if (word.startsWith("http://") || word.startsWith("https://")) {
        tokens.push({ kind: "string", text: word });
      } else {
        tokens.push({ kind: "plain", text: word });
      }
      i = j;
    }
  }

  return tokens;
}

/** Highlight a small JS fetch snippet. */
export function tokenizeJs(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  const s = source;
  const keywords = new Set([
    "const",
    "let",
    "var",
    "await",
    "async",
    "return",
    "true",
    "false",
    "null",
    "new",
    "if",
    "throw",
  ]);

  while (i < s.length) {
    if (s.startsWith("//", i)) {
      let j = i + 2;
      while (j < s.length && s[j] !== "\n") j++;
      tokens.push({ kind: "comment", text: s.slice(i, j) });
      i = j;
      continue;
    }

    if (s[i] === '"' || s[i] === "'" || s[i] === "`") {
      const { end, text } = readString(s, i);
      tokens.push({ kind: "string", text });
      i = end;
      continue;
    }

    if (/[0-9]/.test(s[i])) {
      let j = i + 1;
      while (j < s.length && /[0-9.x]/.test(s[j])) j++;
      tokens.push({ kind: "number", text: s.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(s[i])) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z0-9_$]/.test(s[j])) j++;
      const word = s.slice(i, j);
      tokens.push({
        kind: keywords.has(word) ? "keyword" : "plain",
        text: word,
      });
      i = j;
      continue;
    }

    if ("(){}[];,.=:!<>&|?".includes(s[i])) {
      tokens.push({ kind: "punct", text: s[i] });
      i++;
      continue;
    }

    if (/\s/.test(s[i])) {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      tokens.push({ kind: "plain", text: s.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ kind: "plain", text: s[i] });
    i++;
  }

  return tokens;
}
