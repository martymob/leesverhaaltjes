// Basiswoordenlijst Nederlands voor validatie
// Focus op korte woorden die kinderen leren lezen (groep 3/4)
// Met speciale aandacht voor 'eu' woorden die vaak fout gaan

export const COMMON_DUTCH_WORDS = new Set([
  // EU woorden - correcte Nederlandse woorden
  'neus', 'deur', 'leur', 'beur', 'keus', 'reus', 'geus', 'meuk', 'leuk', 'geuk',
  'beuk', 'deuk', 'jeuk', 'peuk', 'reuk', 'teug', 'deug', 'beug', 'heup', 'neuk',
  'keuken', 'deuken', 'beuken', 'leuken', 'neuzen', 'deuren', 'keuzes', 'reuzen',
  'leugen', 'vleugel', 'sleutel', 'kleur', 'kleurig', 'kleuren', 'kleuter',
  'speur', 'speuren', 'treuren', 'dreun', 'geuren', 'scheur', 'scheuren',
  'sneu', 'beu', 'meu',

  // Basis woorden groep 3
  'aap', 'aar', 'aan', 'aal',
  'een', 'eer', 'eet',
  'ik', 'in', 'is', 'it',
  'om', 'op', 'oom', 'oor', 'ook',

  // Veelgebruikte korte woorden
  'de', 'het', 'en', 'van', 'een', 'dat', 'die', 'met', 'zijn', 'voor',
  'als', 'naar', 'wat', 'niet', 'kan', 'maar', 'dan', 'wel', 'nog', 'bij',
  'tot', 'uit', 'ook', 'aan', 'hoe', 'wie', 'ons', 'hun', 'hem', 'haar',
  'mijn', 'jouw', 'zou', 'al', 'er', 'nu', 'zo', 'ja', 'nee', 'weg',

  // Dieren (populair bij kinderen)
  'aap', 'vis', 'kip', 'koe', 'poes', 'hond', 'kat', 'muis', 'rat', 'vos',
  'beer', 'wolf', 'haas', 'eend', 'uil', 'mol', 'das', 'bok', 'ram', 'kip',
  'lam', 'big', 'hen', 'haan', 'gans', 'zwaan', 'duif', 'raaf', 'mees',
  'tor', 'bij', 'mug', 'vlieg', 'spin', 'worm', 'slak', 'pad', 'kikker',
  'haai', 'walvis', 'dolfijn', 'zeehond', 'paard', 'ezel', 'pony',

  // Lichaam
  'arm', 'been', 'voet', 'hand', 'knie', 'teen', 'oor', 'oog', 'mond',
  'neus', 'haar', 'hoofd', 'nek', 'rug', 'buik', 'bil', 'lip', 'tand',
  'wang', 'kin', 'kaak',

  // Eten en drinken
  'brood', 'kaas', 'melk', 'sap', 'thee', 'water', 'soep', 'rijst', 'ei',
  'appel', 'peer', 'banaan', 'kers', 'druif', 'aardbei', 'koek', 'taart',
  'snoep', 'ijs', 'chips', 'noot', 'vis', 'kip', 'ham', 'worst',

  // Familie
  'mama', 'papa', 'oma', 'opa', 'zus', 'broer', 'oom', 'tante', 'neef', 'nicht',
  'kind', 'baby', 'jongen', 'meisje', 'man', 'vrouw',

  // Huis en school
  'huis', 'deur', 'raam', 'muur', 'vloer', 'dak', 'bed', 'stoel', 'tafel',
  'kast', 'lamp', 'bank', 'bad', 'wc', 'trap', 'tuin', 'boom', 'bloem',
  'school', 'klas', 'boek', 'pen', 'tas', 'juf', 'meester',

  // Natuur
  'zon', 'maan', 'ster', 'wolk', 'regen', 'wind', 'sneeuw', 'ijs', 'zee',
  'meer', 'rivier', 'berg', 'bos', 'veld', 'gras', 'zand', 'steen',
  'boom', 'tak', 'blad', 'bloem', 'plant', 'zaad', 'wortel',

  // Kleuren
  'rood', 'blauw', 'geel', 'groen', 'wit', 'zwart', 'bruin', 'grijs',
  'oranje', 'paars', 'roze',

  // Getallen als woord
  'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien',

  // Tijd
  'dag', 'nacht', 'ochtend', 'middag', 'avond', 'uur', 'week', 'maand', 'jaar',
  'nu', 'dan', 'straks', 'later', 'gister', 'morgen', 'vandaag',

  // Werkwoorden (basis)
  'is', 'ben', 'bent', 'zijn', 'was', 'waren', 'heb', 'hebt', 'heeft', 'had',
  'ga', 'gaat', 'ging', 'kom', 'komt', 'kwam', 'zie', 'ziet', 'zag',
  'loop', 'loopt', 'liep', 'ren', 'rent', 'rende', 'spring', 'springt',
  'zit', 'zat', 'sta', 'stond', 'lig', 'lag', 'slaap', 'slaapt', 'sliep',
  'eet', 'at', 'drink', 'drinkt', 'dronk', 'pak', 'pakt', 'pakte',
  'geef', 'geeft', 'gaf', 'krijg', 'krijgt', 'kreeg', 'maak', 'maakt',
  'doe', 'doet', 'deed', 'zeg', 'zegt', 'zei', 'denk', 'denkt', 'dacht',
  'weet', 'wist', 'kan', 'kon', 'wil', 'wou', 'moet', 'moest', 'mag', 'mocht',
  'speel', 'speelt', 'speelde', 'lees', 'leest', 'las', 'schrijf', 'schreef',
  'teken', 'tekent', 'tekende', 'zing', 'zingt', 'zong', 'dans', 'danst',
  'kijk', 'kijkt', 'keek', 'hoor', 'hoort', 'hoorde', 'voel', 'voelt',
  'ruik', 'ruikt', 'rook', 'proef', 'proeft', 'proefde',

  // Bijvoeglijke naamwoorden
  'groot', 'klein', 'lang', 'kort', 'dik', 'dun', 'breed', 'smal',
  'hoog', 'laag', 'ver', 'dichtbij', 'snel', 'langzaam', 'hard', 'zacht',
  'warm', 'koud', 'heet', 'nat', 'droog', 'vol', 'leeg', 'nieuw', 'oud',
  'jong', 'mooi', 'lelijk', 'lief', 'stout', 'blij', 'boos', 'bang',
  'moe', 'ziek', 'goed', 'fout', 'waar', 'vals', 'echt', 'nep',

  // Voorzetsels
  'in', 'op', 'aan', 'bij', 'met', 'van', 'voor', 'naar', 'door', 'over',
  'onder', 'boven', 'naast', 'tussen', 'achter', 'tegen', 'langs', 'rond',

  // Andere woorden
  'ja', 'nee', 'wel', 'niet', 'ook', 'nog', 'al', 'maar', 'want', 'dus',
  'als', 'dan', 'of', 'en', 'dat', 'dit', 'wat', 'wie', 'waar', 'hoe',
  'hier', 'daar', 'ergens', 'nergens', 'overal', 'altijd', 'nooit', 'soms',

  // Piraten thema
  'schip', 'boot', 'zee', 'water', 'golf', 'wind', 'zeil', 'mast', 'roer',
  'anker', 'touw', 'kaart', 'schat', 'goud', 'kist', 'vlag', 'zwaard',
  'piraat', 'kapitein', 'matroos', 'eiland', 'strand', 'palm', 'papegaai',

  // Bouwen thema
  'bouw', 'blok', 'steen', 'hout', 'muur', 'dak', 'trap', 'deur', 'raam',
  'hamer', 'zaag', 'spijker', 'schroef', 'boor', 'tang', 'lijm', 'verf',
  'toren', 'brug', 'huis', 'kasteel', 'fort', 'hut', 'tent',

  // Dieren (Freek Vonk thema)
  'slang', 'hagedis', 'krokodil', 'schildpad', 'kikker', 'salamander',
  'spin', 'schorpioen', 'kever', 'vlinder', 'mot', 'wesp', 'krekel',
  'aap', 'gorilla', 'olifant', 'giraf', 'zebra', 'leeuw', 'tijger',
  'beer', 'wolf', 'vos', 'egel', 'das', 'marter', 'otter', 'bever',
  'vogel', 'arend', 'uil', 'valk', 'havik', 'kraai', 'ekster',

  // Muziek thema
  'drum', 'gitaar', 'piano', 'fluit', 'trompet', 'viool', 'bas',
  'zang', 'stem', 'lied', 'muziek', 'band', 'concert', 'podium',
  'microfoon', 'speaker', 'geluid', 'ritme', 'beat', 'melodie',

  // Woorden die vaak verkeerd zijn
  // Dit zijn GEEN echte woorden - vermijd ze!
]);

// Woorden die vaak gegenereerd worden maar niet bestaan
export const INVALID_WORDS = new Set([
  // Foute EU woorden
  'peun', 'meun', 'teun', 'seun', 'geun', 'beun', 'keun', 'reun',
  'feun', 'veun', 'deun', 'leun', 'neun', 'zeun', 'weun',
  'peus', 'meus', 'teus', 'seus', 'geus', 'beus', 'keus',
  'feus', 'veus', 'leus', 'zeus', 'weus',
  'peur', 'meur', 'teur', 'seur', 'geur', 'beur',
  'feur', 'veur', 'neur', 'zeur', 'weur',
  'peuk', 'meuk', 'seuk', 'keuk', 'feuk', 'veuk', 'neuk', 'zeuk', 'weuk',

  // Andere foute woorden
  'zis', 'zat', 'zop', 'zom', 'zim',
]);

/**
 * Check of een woord een bekend Nederlands woord is
 * Let op: dit is een basischeck - niet alle woorden staan erin
 */
export const isKnownDutchWord = (word) => {
  const lower = word.toLowerCase();
  return COMMON_DUTCH_WORDS.has(lower);
};

/**
 * Check of een woord expliciet als fout bekend staat
 */
export const isInvalidWord = (word) => {
  const lower = word.toLowerCase();
  return INVALID_WORDS.has(lower);
};

/**
 * Heuristische check voor woorden met 'eu'
 * Veel AI-gegenereerde 'eu' woorden bestaan niet
 */
export const isLikelyValidEuWord = (word) => {
  const lower = word.toLowerCase();

  // Als het in de bekende lijst staat, is het goed
  if (COMMON_DUTCH_WORDS.has(lower)) return true;

  // Als het expliciet fout is, is het fout
  if (INVALID_WORDS.has(lower)) return false;

  // Bekende geldige eu-patronen
  const validEuPatterns = [
    /^(n|d|l|k|r|g|m|b)eus$/,      // neus, deus, leus, etc.
    /^(l|d|b|j|r|p)euk$/,          // leuk, deuk, beuk, etc.
    /^(h|n)eup$/,                   // heup, neup
    /^(d|t|b)eug$/,                 // deug, teug, beug
    /^(kl|sp|tr)eur/,              // kleur, speur, treur
    /^(dr|schr?)eun/,              // dreun, schreun
    /^(g|bl)eur/,                  // geur, bleur
    /^sch?eur/,                    // scheur
    /^sleut/,                      // sleutel
    /^vleug/,                      // vleugel
    /^kleut/,                      // kleuter
    /^leug/,                       // leugen
    /^keuk/,                       // keuken
  ];

  for (const pattern of validEuPatterns) {
    if (pattern.test(lower)) return true;
  }

  // Onbekende eu-woorden zijn verdacht
  if (lower.includes('eu')) {
    return false;
  }

  // Overige woorden: geef voordeel van de twijfel
  return true;
};

/**
 * Vervanging-suggesties voor foute woorden
 * Map van fout woord -> correct alternatief
 */
export const WORD_REPLACEMENTS = {
  // Foute EU woorden -> correcte alternatieven
  'peun': 'neus',
  'meun': 'neus',
  'teun': 'leuk',
  'seun': 'neus',
  'geun': 'geur',
  'beun': 'beuk',
  'keun': 'keus',
  'reun': 'reus',
  'feun': 'leuk',
  'veun': 'leuk',
  'deun': 'deuk',
  'leun': 'leuk',
  'neun': 'neus',
  'zeun': 'neus',
  'weun': 'leuk',
  'peus': 'neus',
  'meus': 'neus',
  'teus': 'reus',
  'seus': 'neus',
  'beus': 'neus',
  'feus': 'neus',
  'veus': 'neus',
  'leus': 'reus',
  'zeus': 'reus',
  'weus': 'neus',
  'peur': 'deur',
  'meur': 'deur',
  'teur': 'deur',
  'seur': 'deur',
  'beur': 'deur',
  'feur': 'deur',
  'veur': 'deur',
  'neur': 'deur',
  'zeur': 'deur',
  'weur': 'deur',
  'seuk': 'deuk',
  'keuk': 'deuk',
  'feuk': 'deuk',
  'veuk': 'deuk',
  'zeuk': 'deuk',
  'weuk': 'deuk',
};

/**
 * Vind een vervanging voor een fout woord
 */
export const getWordReplacement = (word) => {
  const lower = word.toLowerCase();
  return WORD_REPLACEMENTS[lower] || null;
};
