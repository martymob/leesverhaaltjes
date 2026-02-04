// Validatie service voor woorden en verhalen

// Tweeklanken en speciale lettercombinaties
// Deze worden als 1 klank geteld
const MEERLETTER_KLANKEN = [
  // 3-letter klanken (eerst checken!)
  'sch', 'aai', 'ooi', 'oei', 'eeu', 'ieu',
  // 2-letter klanken
  'aa', 'ee', 'oo', 'uu', 'ie', 'eu', 'oe', 'ei', 'ij', 'ou', 'au', 'ui',
  'ch', 'ng', 'nk'
];

// Sorteer op lengte (langste eerst) voor correcte matching
const SORTED_KLANKEN = [...MEERLETTER_KLANKEN].sort((a, b) => b.length - a.length);

/**
 * Tel het aantal klanken in een woord
 * Bijvoorbeeld: "maan" = 3 klanken (m-aa-n), niet 4 letters
 */
export const countKlanken = (word) => {
  if (!word) return 0;

  let count = 0;
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    let matched = false;

    // Probeer meerletter klanken te matchen (langste eerst)
    for (const klank of SORTED_KLANKEN) {
      if (lower.slice(i, i + klank.length) === klank) {
        count++;
        i += klank.length;
        matched = true;
        break;
      }
    }

    // Enkele letter
    if (!matched) {
      count++;
      i++;
    }
  }

  return count;
};

/**
 * Splits een woord in klanken
 * Bijvoorbeeld: "maan" -> ["m", "aa", "n"]
 */
export const splitInKlanken = (word) => {
  if (!word) return [];

  const klanken = [];
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    let matched = false;

    for (const klank of SORTED_KLANKEN) {
      if (lower.slice(i, i + klank.length) === klank) {
        klanken.push(klank);
        i += klank.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      klanken.push(lower[i]);
      i++;
    }
  }

  return klanken;
};

/**
 * Check of een woord alleen toegestane letters/klanken gebruikt
 */
export const usesOnlyAllowedLetters = (word, allowedLetters) => {
  const klanken = splitInKlanken(word);
  const allowedSet = new Set(allowedLetters.map(l => l.toLowerCase()));

  for (const klank of klanken) {
    if (!allowedSet.has(klank)) {
      return false;
    }
  }

  return true;
};

/**
 * Valideer een heel verhaal
 * Returns: { valid: boolean, issues: array, stats: object }
 */
export const validateStory = (story, selectedLetters, maxKlanken) => {
  if (!story) return { valid: true, issues: [], stats: {} };

  // Extract woorden (alleen letters, geen punctuatie)
  const words = story.match(/[a-zA-Z]+/g) || [];
  const issues = [];
  const wordStats = {};

  const allowedArray = Array.from(selectedLetters);

  words.forEach(word => {
    const lower = word.toLowerCase();
    const klankCount = countKlanken(lower);
    const klanken = splitInKlanken(lower);

    // Track word stats
    if (!wordStats[lower]) {
      wordStats[lower] = {
        word: lower,
        count: 0,
        klanken: klankCount,
        klankList: klanken
      };
    }
    wordStats[lower].count++;

    // Check lengte
    if (klankCount > maxKlanken) {
      if (!issues.find(i => i.word === lower && i.type === 'too_long')) {
        issues.push({
          word: lower,
          type: 'too_long',
          message: `"${word}" heeft ${klankCount} klanken (max ${maxKlanken})`,
          klanken: klankCount,
          expected: maxKlanken
        });
      }
    }

    // Check letters
    if (!usesOnlyAllowedLetters(lower, allowedArray)) {
      const wrongKlanken = klanken.filter(k => !allowedArray.includes(k));
      if (!issues.find(i => i.word === lower && i.type === 'wrong_letters')) {
        issues.push({
          word: lower,
          type: 'wrong_letters',
          message: `"${word}" bevat niet-toegestane klanken: ${wrongKlanken.join(', ')}`,
          wrongKlanken
        });
      }
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    stats: {
      totalWords: words.length,
      uniqueWords: Object.keys(wordStats).length,
      wordStats
    }
  };
};

/**
 * Highlight problematische woorden in een verhaal
 */
export const highlightIssues = (story, issues) => {
  if (!issues || issues.length === 0) return story;

  let highlighted = story;
  const issueWords = new Set(issues.map(i => i.word));

  issueWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `⚠️${word}⚠️`);
  });

  return highlighted;
};

/**
 * Extract alle unieke woorden uit een verhaal
 */
export const extractWords = (story) => {
  if (!story) return [];

  const words = story.match(/[a-zA-Z]+/g) || [];
  const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];

  return uniqueWords.map(word => ({
    word,
    klanken: countKlanken(word),
    klankList: splitInKlanken(word)
  }));
};
