// Badge definities

export const BADGES = [
  {
    id: 'first_story',
    name: '📖 Eerste Verhaal',
    description: 'Je eerste verhaal gemaakt!',
    condition: (stats) => stats.storiesCount >= 1
  },
  {
    id: 'five_stories',
    name: '⭐ Verhalen Held',
    description: '5 verhalen gemaakt!',
    condition: (stats) => stats.storiesCount >= 5
  },
  {
    id: 'ten_stories',
    name: '🏆 Super Lezer',
    description: '10 verhalen gemaakt!',
    condition: (stats) => stats.storiesCount >= 10
  },
  {
    id: 'twenty_stories',
    name: '👑 Verhalen Koning',
    description: '20 verhalen gemaakt!',
    condition: (stats) => stats.storiesCount >= 20
  },
  {
    id: 'focus_master',
    name: '🎯 Focus Meester',
    description: 'Een verhaal met 3 focus letters!',
    condition: (stats) => stats.usedThreeFocusLetters
  },
  {
    id: 'word_collector',
    name: '📝 Woorden Verzamelaar',
    description: '50 woorden geleerd!',
    condition: (stats) => stats.learnedWordsCount >= 50
  },
  {
    id: 'word_master',
    name: '🧠 Woorden Meester',
    description: '100 woorden geleerd!',
    condition: (stats) => stats.learnedWordsCount >= 100
  },
  {
    id: 'quiz_star',
    name: '💫 Quiz Ster',
    description: '10 vragen goed beantwoord!',
    condition: (stats) => stats.correctAnswers >= 10
  },
  {
    id: 'perfect_quiz',
    name: '🌟 Perfect!',
    description: 'Alle vragen van een verhaal goed!',
    condition: (stats) => stats.perfectQuizzes >= 1
  },
  {
    id: 'theme_explorer',
    name: '🗺️ Thema Ontdekker',
    description: 'Alle thema\'s geprobeerd!',
    condition: (stats) => stats.themesUsed >= 8
  },
  {
    id: 'daily_reader',
    name: '📅 Dagelijkse Lezer',
    description: '7 dagen achter elkaar gelezen!',
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'library_builder',
    name: '📚 Bibliothecaris',
    description: '10 verhalen opgeslagen!',
    condition: (stats) => stats.savedStories >= 10
  }
];

// Check welke badges verdiend zijn
export const checkEarnedBadges = (stats, currentBadges = []) => {
  const newBadges = [];

  BADGES.forEach(badge => {
    if (!currentBadges.includes(badge.id) && badge.condition(stats)) {
      newBadges.push(badge.id);
    }
  });

  return newBadges;
};

// Krijg badge info
export const getBadgeById = (id) => {
  return BADGES.find(b => b.id === id);
};
