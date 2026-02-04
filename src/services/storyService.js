// Story generation service met Anthropic API

import { validateStory, extractWords } from './validationService';

/**
 * Genereer een verhaal met de Anthropic API
 */
export const generateStory = async ({
  apiKey,
  selectedLetters,
  focusLetters,
  maxKlanken,
  subject,
  names,
  theme
}) => {
  if (!apiKey) {
    throw new Error('Geen API key opgegeven');
  }

  if (!selectedLetters || selectedLetters.size === 0) {
    throw new Error('Selecteer minimaal enkele letters');
  }

  const lettersList = Array.from(selectedLetters).join(', ');
  const focusList = Array.from(focusLetters || []).join(', ');
  const namesList = names ? names.split(',').map(n => n.trim()).filter(n => n) : [];

  const prompt = buildPrompt({
    lettersList,
    focusList,
    maxKlanken,
    subject,
    namesList,
    theme
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API fout');
  }

  const data = await response.json();
  const generatedStory = data.content[0].text;

  // Valideer het verhaal
  const validation = validateStory(generatedStory, selectedLetters, maxKlanken);

  return {
    story: generatedStory,
    validation,
    words: extractWords(generatedStory)
  };
};

/**
 * Bouw de prompt voor het genereren
 */
const buildPrompt = ({ lettersList, focusList, maxKlanken, subject, namesList, theme }) => {
  return `Je bent een expert in het schrijven van leesverhaaltjes voor kinderen in groep 3 (6-7 jaar oud) die leren lezen met de methode Veilig Leren Lezen.

KRITIEKE REGELS - VOLG DEZE STRIKT:

1. LETTERS: Gebruik UITSLUITEND woorden die bestaan uit deze letters/klanken: ${lettersList}
   - "aa", "ee", "oo", "uu" etc. zijn ENKELE klanken (tellen als 1)
   - "ij" is één klank
   - "ch", "ng", "nk", "sch" zijn enkele klanken

2. WOORDLENGTE: Elk woord mag MAXIMAAL ${maxKlanken} KLANKEN hebben.
   Voorbeelden van klank-telling:
   - "kat" = 3 klanken (k-a-t) ✓
   - "maan" = 3 klanken (m-aa-n) ✓
   - "boom" = 3 klanken (b-oo-m) ✓
   - "straat" = 5 klanken (s-t-r-aa-t) ✗ te lang als max 4
   - "school" = 4 klanken (sch-oo-l) ✓

3. ${focusList ? `FOCUS LETTERS: Gebruik deze letters EXTRA VAAK in woorden: ${focusList}` : 'Geen speciale focus letters.'}

4. ${namesList.length > 0 ? `NAMEN: Gebruik deze namen: ${namesList.join(', ')}` : 'Gebruik korte Nederlandse namen (max 4 klanken).'}

5. ${subject ? `ONDERWERP: ${subject}` : theme ? `THEMA: ${theme}` : 'Kies een leuk onderwerp voor kinderen.'}

SCHRIJFSTIJL:
- Korte, eenvoudige zinnen (max 6-8 woorden per zin)
- Herhaling van woorden is GOED (helpt bij leren lezen)
- Maak het verhaal leuk en speels
- 10-15 zinnen totaal
- Gebruik ALLEEN bestaande Nederlandse woorden
- Geen moeilijke of onbekende woorden
- Elke zin op een nieuwe regel

FORMAAT:
- Begin DIRECT met het verhaal (geen titel)
- Zet woorden met focus-letters tussen sterretjes: *woord*
- Eindig met een leuke, korte afsluiting

BELANGRIJK: Controleer VOOR je antwoord dat ALLE woorden:
1. Alleen de opgegeven letters bevatten
2. Niet meer dan ${maxKlanken} klanken hebben

Schrijf nu het verhaal:`;
};

/**
 * Genereer begripsvragen bij een verhaal
 */
export const generateQuestions = async ({ apiKey, story }) => {
  if (!apiKey || !story) {
    throw new Error('API key en verhaal zijn vereist');
  }

  const prompt = `Gegeven dit leesverhaaltje voor groep 3 (6-7 jaar):

"${story}"

Maak 3 eenvoudige begripsvragen met meerkeuze antwoorden.
De vragen moeten:
- Heel simpel zijn (wie, wat, waar)
- Korte woorden gebruiken
- Duidelijke antwoorden hebben

Antwoord in dit EXACTE JSON formaat:
[
  {
    "vraag": "Wie is er in het verhaal?",
    "opties": ["een kat", "een hond", "een vis"],
    "correct": 0
  },
  {
    "vraag": "Wat doet ...?",
    "opties": ["optie a", "optie b", "optie c"],
    "correct": 1
  },
  {
    "vraag": "Waar is ...?",
    "opties": ["optie a", "optie b", "optie c"],
    "correct": 2
  }
]

Geef ALLEEN de JSON array, geen andere tekst.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API fout');
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Parse JSON from response
  try {
    // Probeer JSON te extracten uit de response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('Kon vragen niet parsen:', text);
    throw new Error('Kon vragen niet genereren');
  }
};

/**
 * Regenereer verhaal als validatie faalt (met retry)
 */
export const generateStoryWithRetry = async (params, maxRetries = 2) => {
  let lastError = null;
  let lastResult = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateStory(params);

      // Als er geen issues zijn, return direct
      if (result.validation.valid) {
        return result;
      }

      // Sla laatste resultaat op voor fallback
      lastResult = result;

      // Als er issues zijn en we hebben nog retries, probeer opnieuw
      if (attempt < maxRetries) {
        console.log(`Validatie issues gevonden, poging ${attempt + 2}...`, result.validation.issues);
      }
    } catch (error) {
      lastError = error;
    }
  }

  // Return laatste resultaat (zelfs met issues) of throw error
  if (lastResult) {
    return lastResult;
  }

  throw lastError || new Error('Kon geen verhaal genereren');
};
