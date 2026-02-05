// Grammar check service met LanguageTool API

const LANGUAGETOOL_API = 'https://api.languagetool.org/v2/check';

/**
 * Check tekst op grammatica- en spelfouten met LanguageTool
 * @param {string} text - De tekst om te controleren
 * @returns {Promise<{errors: Array, isClean: boolean}>}
 */
export const checkGrammar = async (text) => {
  if (!text || text.trim().length === 0) {
    return { errors: [], isClean: true };
  }

  // Verwijder asterisks (focus markers) voor de check
  const cleanText = text.replace(/\*/g, '');

  try {
    const response = await fetch(LANGUAGETOOL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: cleanText,
        language: 'nl',
        // Disable sommige regels die te streng zijn voor kinderverhalen
        disabledRules: 'WHITESPACE_RULE,UPPERCASE_SENTENCE_START'
      })
    });

    if (!response.ok) {
      console.warn('LanguageTool API error:', response.status);
      return { errors: [], isClean: true, apiError: true };
    }

    const data = await response.json();

    // Filter en formatteer de fouten
    const errors = data.matches
      .filter(match => {
        // Filter irrelevante regels
        const dominated = [
          'MORFOLOGIK_RULE_NL_NL', // Soms te streng op onbekende woorden
        ];
        // Houd de belangrijke regels
        const dominated_categories = [];

        return !dominated.includes(match.rule.id);
      })
      .map(match => ({
        message: match.message,
        context: match.context.text,
        offset: match.offset,
        length: match.length,
        word: cleanText.slice(match.offset, match.offset + match.length),
        replacements: match.replacements.slice(0, 3).map(r => r.value),
        ruleId: match.rule.id,
        category: match.rule.category.name
      }));

    return {
      errors,
      isClean: errors.length === 0
    };
  } catch (error) {
    console.error('LanguageTool check failed:', error);
    // Bij netwerk/API fouten, ga door zonder grammar check
    return { errors: [], isClean: true, apiError: true };
  }
};

/**
 * Formatteer grammar errors voor feedback aan Claude
 * @param {Array} errors - Errors van checkGrammar
 * @returns {string} - Geformatteerde feedback string
 */
export const formatGrammarFeedback = (errors) => {
  if (!errors || errors.length === 0) return '';

  return errors.map(err => {
    const replacement = err.replacements.length > 0
      ? ` → "${err.replacements[0]}"`
      : '';
    return `"${err.word}": ${err.message}${replacement}`;
  }).join('\n');
};

/**
 * Check of errors de/het fouten bevatten
 */
export const hasDeHetErrors = (errors) => {
  return errors.some(err =>
    err.ruleId?.includes('DE_HET') ||
    err.message?.toLowerCase().includes('de/het') ||
    err.category?.toLowerCase().includes('lidwoord')
  );
};

/**
 * Check of errors werkwoordfouten bevatten
 */
export const hasVerbErrors = (errors) => {
  return errors.some(err =>
    err.category?.toLowerCase().includes('werkwoord') ||
    err.category?.toLowerCase().includes('vervoeging')
  );
};
