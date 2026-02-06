// Fuzzy search algorithm that handles typos and abbreviations
export function fuzzyMatch(searchTerm: string, targetText: string): boolean {
  const term = searchTerm.toLowerCase().trim();
  const text = targetText.toLowerCase();

  // Exact substring match
  if (text.includes(term)) {
    return true;
  }

  // Handle common abbreviations
  const abbreviations: Record<string, string[]> = {
    maths: ['math', 'mathematics'],
    math: ['maths', 'mathematics'],
    sci: ['science'],
    eng: ['english'],
    bio: ['biology'],
    chem: ['chemistry'],
    phys: ['physics'],
    lit: ['literature'],
    hist: ['history'],
    geo: ['geography'],
    s4: ['standard', 'secondary', 'grade 4'],
    s5: ['standard', 'secondary', 'grade 5'],
    s6: ['standard', 'secondary', 'grade 6'],
    gr: ['grade'],
  };

  // Check if search term matches any abbreviation and its expansions
  if (abbreviations[term]) {
    for (const expansion of abbreviations[term]) {
      if (text.includes(expansion)) {
        return true;
      }
    }
  }

  // Check reverse: if text contains abbreviation that expands to search term
  for (const [abbr, expansions] of Object.entries(abbreviations)) {
    if (expansions.includes(term) && text.includes(abbr)) {
      return true;
    }
  }

  // Levenshtein distance based fuzzy matching for typos
  const words = text.split(/\s+/);
  const termWords = term.split(/\s+/);

  for (const termWord of termWords) {
    for (const word of words) {
      if (levenshteinDistance(termWord, word) <= 2) {
        return true;
      }
    }
  }

  return false;
}

// Calculate Levenshtein distance for typo tolerance
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Calculate match score for ranking results
export function calculateMatchScore(query: string, title: string, description: string, subject: string): number {
  let score = 0;

  // Exact title match is best
  if (title.toLowerCase().includes(query.toLowerCase())) {
    score += 100;
  }

  // Subject match is important
  if (subject.toLowerCase().includes(query.toLowerCase())) {
    score += 80;
  }

  // Description match
  if (description.toLowerCase().includes(query.toLowerCase())) {
    score += 50;
  }

  // Fuzzy matching bonus
  if (fuzzyMatch(query, `${title} ${subject} ${description}`)) {
    score += 30;
  }

  return score;
}
