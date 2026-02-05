// Story generation service met Anthropic API

import { validateStory, extractWords } from './validationService';
import { getStyleById } from '../data/writingStyles';

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
  theme,
  writingStyle = 'standaard'
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
  const style = getStyleById(writingStyle);

  const prompt = buildPrompt({
    lettersList,
    focusList,
    maxKlanken,
    subject,
    namesList,
    theme,
    style
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
      max_tokens: 1000,
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

  // Valideer het verhaal (alleen rapporteren, niet wijzigen)
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
const buildPrompt = ({ lettersList, focusList, maxKlanken, subject, namesList, theme, style }) => {
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

SCHRIJFSTIJL - ${style.naam}:
${style.prompt}

VERHAALSTRUCTUUR - Elk verhaal moet toewerken naar een CLOU:
Kies EEN van deze eindstructuren:
- GRAPJE: Een grappige verrassing of misverstand aan het eind
- TWIST: Iets blijkt anders te zijn dan gedacht ("Het was geen beer... het was papa!")
- ONTDEKKING: Het hoofdpersonage leert of vindt iets bijzonders
- OPLOSSING: Een klein probleempje wordt slim opgelost
- HERHALING MET VERSCHIL: Iets herhaalt zich maar de laatste keer gaat het anders

Structuur in 6-8 zinnen:
1-2: START - Wie? Waar? Wat gebeurt er?
3-5: OPBOUW - Spanning of nieuwsgierigheid opbouwen
6-8: CLOU - De verrassing, grap, of ontdekking!

BELANGRIJK: De laatste zin moet BEVREDIGEND zijn. Het kind moet willen doorlezen!

BELANGRIJKE EISEN:
- KORT verhaal: 6-8 zinnen totaal (niet meer!)
- Korte zinnen (max 6 woorden per zin)
- Herhaling van woorden is GOED (helpt bij lezen)
- Gebruik ALLEEN bestaande Nederlandse woorden
- Elke zin op een nieuwe regel
- Werk toe naar de clou - bouw spanning/nieuwsgierigheid op!

TAALREGELS - CRUCIAAL:
1. DE/HET moet CORRECT zijn:
   - DE: boot, kat, hond, maan, zon, boom, deur, neus, beer, vis, kip, koe, bij, muis, roos, pen, tas
   - HET: huis, bos, bed, ei, oog, oor, been, haar, boek, lied, kind, paard, schaap, konijn
   - Bij twijfel: kies een ander woord!

2. WERKWOORDEN correct vervoegen:
   - ik loop, jij loopt, hij/zij loopt
   - ik zie, jij ziet, hij/zij ziet

3. GEEN verzonnen woorden - alleen BESTAANDE Nederlandse woorden

4. 'EU' WOORDEN - gebruik ALLEEN:
   neus, deur, leuk, deuk, beuk, keus, reus, reuk, jeuk, heup, kleur, speur, dreun, geur, scheur, leur, beur, heus
   NOOIT: peun, meun, teun, seun, geun, peus, meus, peur, meur, feun, etc.

FORMAAT:
- Begin DIRECT met het verhaal (geen titel)${focusList ? `
- Zet woorden met focus-letters tussen sterretjes: *woord*` : ''}
- Eindig met een korte, leuke afsluiting

VOORDAT JE SCHRIJFT - CONTROLEER:
1. Bevat elk woord ALLEEN de opgegeven letters?
2. Heeft elk woord MAXIMAAL ${maxKlanken} klanken?
3. Is het verhaal KORT genoeg (6-8 zinnen)?

Als een woord niet past, kies dan een ANDER woord dat WEL past!

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
 * Regenereer verhaal als validatie faalt (met retry) - nu PROACTIEF
 */
export const generateStoryWithRetry = async (params, maxRetries = 3) => {
  let lastError = null;
  let bestResult = null;
  let bestIssueCount = Infinity;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateStory(params);
      const issueCount = result.validation.issues?.length || 0;

      // Perfect! Geen issues
      if (result.validation.valid) {
        console.log(`✅ Verhaal geldig na poging ${attempt + 1}`);
        return result;
      }

      // Bewaar beste resultaat (minste issues)
      if (issueCount < bestIssueCount) {
        bestResult = result;
        bestIssueCount = issueCount;
      }

      // Log voor debugging
      if (attempt < maxRetries) {
        console.log(`⚠️ Poging ${attempt + 1}: ${issueCount} issues gevonden, opnieuw proberen...`);
        console.log('Issues:', result.validation.issues.map(i => i.message).join(', '));
      }
    } catch (error) {
      lastError = error;
      console.error(`❌ Poging ${attempt + 1} mislukt:`, error.message);
    }
  }

  // Return beste resultaat (zelfs met issues) of throw error
  if (bestResult) {
    console.log(`📝 Beste resultaat heeft ${bestIssueCount} issues`);
    return bestResult;
  }

  throw lastError || new Error('Kon geen verhaal genereren');
};
