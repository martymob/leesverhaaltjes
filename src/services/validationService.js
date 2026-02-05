// Validatie service voor woorden en verhalen

import { isInvalidWord, isLikelyValidEuWord, getWordReplacement, COMMON_DUTCH_WORDS } from '../data/dutchWords';

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

    // Check of het woord echt bestaat (vooral voor eu-woorden)
    if (isInvalidWord(lower)) {
      if (!issues.find(i => i.word === lower && i.type === 'invalid_word')) {
        issues.push({
          word: lower,
          type: 'invalid_word',
          message: `"${word}" is geen bestaand Nederlands woord`
        });
      }
    } else if (!isLikelyValidEuWord(lower)) {
      if (!issues.find(i => i.word === lower && i.type === 'suspicious_word')) {
        issues.push({
          word: lower,
          type: 'suspicious_word',
          message: `"${word}" is waarschijnlijk geen bestaand woord`
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

/**
 * Filter een verhaal door foute woorden te vervangen of te verwijderen
 * Dit gebeurt VOOR weergave aan de gebruiker
 */
export const filterStory = (story, selectedLetters, maxKlanken) => {
  if (!story) return { filteredStory: story, replacements: [] };

  const allowedArray = Array.from(selectedLetters);
  const replacements = [];

  // Vind alle woorden (inclusief die met asterisks voor focus)
  let filteredStory = story;

  // Extract woorden met hun posities
  const wordRegex = /\*?([a-zA-Z]+)\*?/g;
  let match;
  const wordsToCheck = [];

  while ((match = wordRegex.exec(story)) !== null) {
    wordsToCheck.push({
      fullMatch: match[0],
      word: match[1],
      index: match.index
    });
  }

  // Check elk woord en vervang indien nodig (van achteren naar voren om indexen correct te houden)
  for (let i = wordsToCheck.length - 1; i >= 0; i--) {
    const { fullMatch, word } = wordsToCheck[i];
    const lower = word.toLowerCase();
    const klankCount = countKlanken(lower);
    const isFocusWord = fullMatch.startsWith('*') && fullMatch.endsWith('*');

    let replacement = null;
    let reason = null;

    // Check 1: Foute letters?
    if (!usesOnlyAllowedLetters(lower, allowedArray)) {
      reason = 'verkeerde_letters';
      // Probeer een vervanging te vinden
      replacement = findSimpleReplacement(lower, allowedArray, maxKlanken);
    }
    // Check 2: Te lang?
    else if (klankCount > maxKlanken) {
      reason = 'te_lang';
      replacement = findShorterWord(lower, allowedArray, maxKlanken);
    }
    // Check 3: Ongeldig woord?
    else if (isInvalidWord(lower)) {
      reason = 'ongeldig_woord';
      replacement = getWordReplacement(lower);
    }
    // Check 4: Verdacht eu-woord?
    else if (!isLikelyValidEuWord(lower)) {
      reason = 'verdacht_woord';
      replacement = getWordReplacement(lower) || findSimilarValidWord(lower, allowedArray, maxKlanken);
    }

    // Voer vervanging uit
    if (replacement && reason) {
      const newWord = isFocusWord ? `*${replacement}*` : replacement;

      // Vervang in de story (case-insensitive maar behoud case van eerste letter)
      const regex = new RegExp(`\\*?${word}\\*?`, 'gi');
      filteredStory = filteredStory.replace(regex, (match) => {
        // Behoud hoofdletter als origineel die had
        if (match[0] === match[0].toUpperCase() && match[0] !== '*') {
          return newWord.charAt(0).toUpperCase() + newWord.slice(1);
        }
        if (match.startsWith('*') && match[1] === match[1].toUpperCase()) {
          return '*' + replacement.charAt(0).toUpperCase() + replacement.slice(1) + '*';
        }
        return newWord;
      });

      replacements.push({
        original: lower,
        replacement,
        reason
      });
    }
  }

  return { filteredStory, replacements };
};

/**
 * Vind een simpel vervangend woord met toegestane letters
 */
const findSimpleReplacement = (word, allowedLetters, maxKlanken) => {
  // Eenvoudige vervangende woorden per categorie
  const simpleWords = ['de', 'het', 'een', 'is', 'op', 'in', 'en', 'ja', 'nee'];

  for (const simple of simpleWords) {
    if (usesOnlyAllowedLetters(simple, allowedLetters) && countKlanken(simple) <= maxKlanken) {
      return simple;
    }
  }
  return null;
};

/**
 * Vind een korter woord
 */
const findShorterWord = (word, allowedLetters, maxKlanken) => {
  const shortWords = ['kat', 'hond', 'vis', 'boom', 'zon', 'maan', 'bal', 'pop', 'auto'];

  for (const short of shortWords) {
    if (usesOnlyAllowedLetters(short, allowedLetters) && countKlanken(short) <= maxKlanken) {
      return short;
    }
  }
  return null;
};

/**
 * Vind een vergelijkbaar geldig woord
 */
const findSimilarValidWord = (word, allowedLetters, maxKlanken) => {
  // Als het een eu-woord is, zoek een geldig eu-woord
  if (word.includes('eu')) {
    const validEuWords = ['neus', 'deur', 'leuk', 'deuk', 'beuk', 'keus', 'reus', 'geur', 'heup'];

    for (const euWord of validEuWords) {
      if (usesOnlyAllowedLetters(euWord, allowedLetters) && countKlanken(euWord) <= maxKlanken) {
        return euWord;
      }
    }
  }

  return null;
};
