// Schrijfstijlen geïnspireerd door bekende Nederlandse kinderboekenschrijvers

export const WRITING_STYLES = {
  standaard: {
    id: 'standaard',
    naam: '📖 Standaard',
    beschrijving: 'Eenvoudig en duidelijk',
    icon: '📖',
    prompt: `Schrijf in een eenvoudige, duidelijke stijl. Korte zinnen, veel herhaling.`,
    kleur: '#6c5ce7'
  },
  anniemg: {
    id: 'anniemg',
    naam: '🎪 Speels & Grappig',
    beschrijving: 'Zoals Annie M.G. Schmidt',
    icon: '🎪',
    prompt: `Schrijf in de speelse, grappige stijl van Annie M.G. Schmidt:
- Onverwachte wendingen en gekke situaties
- Humor die kinderen begrijpen
- Dieren en dingen die praten en rare dingen doen
- Een beetje ondeugende hoofdpersonen
- Rijmpjes of grappige zinnetjes mogen`,
    kleur: '#e84393',
    voorbeeld: 'Zoals Jip en Janneke, Pluk van de Petteflet'
  },
  paulvanloon: {
    id: 'paulvanloon',
    naam: '👻 Spannend & Griezelig',
    beschrijving: 'Zoals Paul van Loon',
    icon: '👻',
    prompt: `Schrijf in de spannende stijl van Paul van Loon:
- Een beetje griezelig maar niet eng
- Mysterieuze sfeer
- Spanning opbouwen
- Onverwachte ontdekkingen
- Avontuurlijk en moedig
- Geheimen en raadsels
BELANGRIJK: Houd het kindvriendelijk! Geen echte enge dingen, wel spanning.`,
    kleur: '#2d3436',
    voorbeeld: 'Zoals Dolfje Weerwolfje, Griezelbus'
  },
  toontellegen: {
    id: 'toontellegen',
    naam: '🐿️ Poëtisch & Wijs',
    beschrijving: 'Zoals Toon Tellegen',
    icon: '🐿️',
    prompt: `Schrijf in de poëtische, filosofische stijl van Toon Tellegen:
- Dieren met menselijke gevoelens
- Rustige, dromerige sfeer
- Nadenken over vriendschap en emoties
- Mooie, beeldende taal
- Kleine, intieme verhalen
- Een vleugje melancholie maar altijd hoopvol`,
    kleur: '#00b894',
    voorbeeld: 'Zoals de verhalen over de eekhoorn en de mier'
  },
  freekvonk: {
    id: 'freekvonk',
    naam: '🦎 Ontdekken & Natuur',
    beschrijving: 'Zoals Freek Vonk',
    icon: '🦎',
    prompt: `Schrijf in de enthousiaste stijl van Freek Vonk:
- SUPER enthousiast over dieren en natuur!
- Bijzondere dierenfeiten (maar simpel uitgelegd)
- Avontuur en ontdekken
- "Wauw!" en "Kijk dan!" momenten
- De hoofdpersoon ontdekt iets GEWELDIGS
- Respect voor dieren en natuur`,
    kleur: '#00cec9',
    voorbeeld: 'Enthousiast over bijzondere dieren!'
  },
  piraat: {
    id: 'piraat',
    naam: '🏴‍☠️ Piraten Avontuur',
    beschrijving: 'Ahoy! Op zee!',
    icon: '🏴‍☠️',
    prompt: `Schrijf een piratenavontuur:
- Schepen, de zee, schatten
- Piratenwoorden zoals "Ahoy!" en "Arrr!"
- Dappere zeelui
- Een eiland of een schat
- Avontuur en vriendschap`,
    kleur: '#d63031'
  },
  bouwer: {
    id: 'bouwer',
    naam: '🔧 Bouwen & Maken',
    beschrijving: 'Voor kleine bouwers',
    icon: '🔧',
    prompt: `Schrijf een verhaal over bouwen en maken:
- Iets bouwen of repareren
- Gereedschap en materialen
- Samenwerken om iets te maken
- Problemen oplossen
- Trots zijn op wat je gemaakt hebt`,
    kleur: '#fdcb6e'
  }
};

export const getStyleById = (id) => {
  return WRITING_STYLES[id] || WRITING_STYLES.standaard;
};

export const getStyleOptions = () => {
  return Object.values(WRITING_STYLES);
};
