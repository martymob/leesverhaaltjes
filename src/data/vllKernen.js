// Veilig Leren Lezen - Kim versie
// Lettervolgorde per kern
// Bron: https://inmnsas.nl/2023/01/overzicht-letters-en-woorden-vll-kim/

export const VLL_KERNEN = {
  start: {
    naam: 'Kern Start',
    letters: ['i', 'k', 'm', 's'],
    beschrijving: 'De eerste letters',
    kleur: '#FF6B6B'
  },
  kern1: {
    naam: 'Kern 1',
    letters: ['p', 'aa', 'r', 'e', 'v'],
    beschrijving: 'Eerste zinnen lezen',
    kleur: '#4ECDC4'
  },
  kern2: {
    naam: 'Kern 2',
    letters: ['n', 't', 'ee', 'b', 'oo'],
    beschrijving: 'Meer klinkers',
    kleur: '#45B7D1'
  },
  kern3: {
    naam: 'Kern 3',
    letters: ['d', 'oe', 'z', 'ij', 'h'],
    beschrijving: 'Tweeklanken',
    kleur: '#96CEB4'
  },
  kern4: {
    naam: 'Kern 4',
    letters: ['w', 'o', 'a', 'u', 'j'],
    beschrijving: 'Korte klinkers',
    kleur: '#FFEAA7'
  },
  kern5: {
    naam: 'Kern 5',
    letters: ['eu', 'ie', 'l', 'ou', 'uu'],
    beschrijving: 'Meer tweeklanken',
    kleur: '#DDA0DD'
  },
  kern6: {
    naam: 'Kern 6',
    letters: ['g', 'ui', 'au', 'f', 'ei'],
    beschrijving: 'Laatste letters',
    kleur: '#98D8C8'
  },
  kern7: {
    naam: 'Kern 7',
    letters: ['ch', 'sch', 'ng', 'nk'],
    beschrijving: 'Letterclusters',
    kleur: '#F7DC6F',
    isClusterKern: true
  },
  kern8: {
    naam: 'Kern 8',
    letters: ['aai', 'ooi', 'oei'],
    beschrijving: 'Drieklanken',
    kleur: '#BB8FCE',
    isClusterKern: true
  },
  kern9: {
    naam: 'Kern 9',
    letters: [],
    beschrijving: 'Medeklinkerclusters (str, schr, etc.)',
    kleur: '#85C1E9',
    isClusterKern: true
  }
};

// Cumulatieve letters tot en met een bepaalde kern
export const getLettersUpToKern = (kernId) => {
  const kernOrder = ['start', 'kern1', 'kern2', 'kern3', 'kern4', 'kern5', 'kern6', 'kern7', 'kern8', 'kern9'];
  const kernIndex = kernOrder.indexOf(kernId);

  if (kernIndex === -1) return [];

  const letters = new Set();

  for (let i = 0; i <= kernIndex; i++) {
    const kern = VLL_KERNEN[kernOrder[i]];
    kern.letters.forEach(letter => letters.add(letter));
  }

  return Array.from(letters);
};

// Krijg alle kern opties voor dropdown
export const getKernOptions = () => {
  return Object.entries(VLL_KERNEN).map(([id, kern]) => ({
    id,
    naam: kern.naam,
    beschrijving: kern.beschrijving,
    kleur: kern.kleur,
    letterCount: getLettersUpToKern(id).length
  }));
};

// Presets voor snel selecteren
export const KERN_PRESETS = {
  kern7: {
    naam: '📚 Kern 7 (Alle letters)',
    beschrijving: 'Alle letters t/m kern 6 + letterclusters',
    letters: getLettersUpToKern('kern7')
  }
};
