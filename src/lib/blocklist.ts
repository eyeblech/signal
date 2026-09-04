/** Hard refuse anything that could imply under-18 performers. */
const BLOCK_PATTERNS: RegExp[] = [
  /\bloli(?:ta|con)?s?\b/i,
  /\bshota(?:con)?s?\b/i,
  /\bunder[- ]?age\b/i,
  /\bpre[- ]?teens?\b/i,
  /\bpedoph/i,
  /\bpaedoph/i,
  /\bchild(?:ren|porn|\s*sex|\s*porn)?\b/i,
  /\binfants?\b/i,
  /\btoddlers?\b/i,
  /\bminors?\b/i,
  /\bjailbaits?\b/i,
  /\b(1[0-7]|[0-9])\s*(y\.?o\.?|years?\s*old)\b/i,
  /\byoung (boys?|girls?|child|children|kid)\b/i,
  /\blittle (boys?|girls?|child|children|kid)\b/i,
  /\bkids?\b/i,
  /\bincest with (child|teen boy|teen girl)\b/i,
];

export function isBlockedText(...parts: Array<string | null | undefined>): boolean {
  const hay = parts.filter(Boolean).join(" • ");
  if (!hay.trim()) return false;
  return BLOCK_PATTERNS.some((re) => re.test(hay));
}
