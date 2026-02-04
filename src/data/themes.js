// Thema's en templates voor verhalen

export const STORY_THEMES = {
  dieren: {
    naam: '🐾 Dieren',
    icon: '🐾',
    onderwerpen: [
      'een kat',
      'een hond',
      'op de boerderij',
      'in de dierentuin',
      'een vis',
      'een vogel',
      'een konijn'
    ],
    suggestedNames: ['Pip', 'Lot', 'Bas', 'Mia'],
    kleur: '#FF9F43'
  },
  avontuur: {
    naam: '🏴‍☠️ Avontuur',
    icon: '🏴‍☠️',
    onderwerpen: [
      'de schat',
      'in het bos',
      'op reis',
      'de held',
      'een geheim',
      'de tocht'
    ],
    suggestedNames: ['Sam', 'Kim', 'Jan', 'Evi'],
    kleur: '#EE5A24'
  },
  familie: {
    naam: '👨‍👩‍👧 Familie',
    icon: '👨‍👩‍👧',
    onderwerpen: [
      'bij oma',
      'papa en mama',
      'met broer',
      'met zus',
      'het feest',
      'de verjaardag'
    ],
    suggestedNames: ['Sem', 'Luc', 'Eva', 'Tim'],
    kleur: '#A3CB38'
  },
  school: {
    naam: '🏫 School',
    icon: '🏫',
    onderwerpen: [
      'in de klas',
      'op het plein',
      'de juf',
      'de meester',
      'de gymles',
      'de pauze'
    ],
    suggestedNames: ['Fin', 'Lis', 'Max', 'Noa'],
    kleur: '#0984E3'
  },
  seizoenen: {
    naam: '🌸 Seizoenen',
    icon: '🌸',
    onderwerpen: [
      'in de sneeuw',
      'op het strand',
      'in de herfst',
      'in de lente',
      'het regent',
      'de zon schijnt'
    ],
    suggestedNames: ['Beau', 'Noor', 'Daan', 'Fem'],
    kleur: '#00CEC9'
  },
  eten: {
    naam: '🍎 Eten',
    icon: '🍎',
    onderwerpen: [
      'de taart',
      'het ontbijt',
      'de soep',
      'het snoep',
      'de pannenkoek',
      'de appel'
    ],
    suggestedNames: ['Kas', 'Mees', 'Roos', 'Teun'],
    kleur: '#FD79A8'
  },
  sport: {
    naam: '⚽ Sport',
    icon: '⚽',
    onderwerpen: [
      'voetbal',
      'zwemmen',
      'fietsen',
      'rennen',
      'de wedstrijd',
      'de bal'
    ],
    suggestedNames: ['Stijn', 'Saar', 'Joep', 'Luna'],
    kleur: '#6C5CE7'
  },
  fantasie: {
    naam: '🧚 Fantasie',
    icon: '🧚',
    onderwerpen: [
      'de fee',
      'de draak',
      'het kasteel',
      'de tovenaar',
      'de prinses',
      'de ridder'
    ],
    suggestedNames: ['Fleur', 'Storm', 'Noor', 'Raf'],
    kleur: '#A29BFE'
  }
};

// Krijg random onderwerp uit thema
export const getRandomSubject = (themeId) => {
  const theme = STORY_THEMES[themeId];
  if (!theme) return '';

  const subjects = theme.onderwerpen;
  return subjects[Math.floor(Math.random() * subjects.length)];
};

// Krijg suggested names voor thema
export const getSuggestedNames = (themeId) => {
  const theme = STORY_THEMES[themeId];
  if (!theme) return [];

  return theme.suggestedNames;
};
