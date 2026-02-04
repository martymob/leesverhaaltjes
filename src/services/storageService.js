// Storage service - werkt met localStorage, later uitbreidbaar naar Supabase

const STORAGE_KEYS = {
  STORIES: 'leesverhaaltjes_stories',
  LEARNED_WORDS: 'leesverhaaltjes_learned_words',
  BADGES: 'leesverhaaltjes_badges',
  STATS: 'leesverhaaltjes_stats',
  SETTINGS: 'leesverhaaltjes_settings',
  API_KEY: 'leesverhaaltjes_api_key'
};

// Helper functie voor veilig JSON parsen
const safeParseJSON = (str, defaultValue) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// ==================== STORIES ====================

export const saveStory = (story) => {
  const stories = getStories();
  const newStory = {
    ...story,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  stories.unshift(newStory); // Nieuwste eerst
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  return newStory;
};

export const getStories = () => {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.STORIES), []);
};

export const deleteStory = (storyId) => {
  const stories = getStories().filter(s => s.id !== storyId);
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
};

export const getStoryById = (storyId) => {
  return getStories().find(s => s.id === storyId);
};

// ==================== LEARNED WORDS ====================

export const addLearnedWords = (words) => {
  const learnedWords = getLearnedWords();
  const now = new Date().toISOString();

  words.forEach(word => {
    const lower = word.toLowerCase();
    const existing = learnedWords.find(w => w.word === lower);

    if (existing) {
      existing.timesSeen++;
      existing.lastSeen = now;
    } else {
      learnedWords.push({
        word: lower,
        timesSeen: 1,
        firstSeen: now,
        lastSeen: now
      });
    }
  });

  localStorage.setItem(STORAGE_KEYS.LEARNED_WORDS, JSON.stringify(learnedWords));
  return learnedWords;
};

export const getLearnedWords = () => {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.LEARNED_WORDS), []);
};

export const getLearnedWordsCount = () => {
  return getLearnedWords().length;
};

export const getMasteredWords = () => {
  return getLearnedWords().filter(w => w.timesSeen >= 5);
};

// ==================== BADGES ====================

export const saveBadges = (badges) => {
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(Array.from(badges)));
};

export const getBadges = () => {
  const badges = safeParseJSON(localStorage.getItem(STORAGE_KEYS.BADGES), []);
  return new Set(badges);
};

export const addBadge = (badgeId) => {
  const badges = getBadges();
  badges.add(badgeId);
  saveBadges(badges);
  return badges;
};

// ==================== STATS ====================

export const getStats = () => {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.STATS), {
    storiesCount: 0,
    correctAnswers: 0,
    perfectQuizzes: 0,
    themesUsed: [],
    streak: 0,
    lastActiveDate: null,
    usedThreeFocusLetters: false
  });
};

export const updateStats = (updates) => {
  const stats = getStats();
  const newStats = { ...stats, ...updates };

  // Update streak
  const today = new Date().toDateString();
  const lastActive = stats.lastActiveDate;

  if (lastActive) {
    const lastDate = new Date(lastActive);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.toDateString() === yesterday.toDateString()) {
      newStats.streak = (stats.streak || 0) + 1;
    } else if (lastDate.toDateString() !== today) {
      newStats.streak = 1;
    }
  } else {
    newStats.streak = 1;
  }

  newStats.lastActiveDate = today;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  return newStats;
};

export const incrementStoriesCount = () => {
  const stats = getStats();
  stats.storiesCount = (stats.storiesCount || 0) + 1;
  return updateStats(stats);
};

export const addThemeUsed = (themeId) => {
  const stats = getStats();
  if (!stats.themesUsed) stats.themesUsed = [];
  if (!stats.themesUsed.includes(themeId)) {
    stats.themesUsed.push(themeId);
  }
  return updateStats(stats);
};

// ==================== SETTINGS ====================

export const getSettings = () => {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.SETTINGS), {
    selectedKern: 'kern7',
    maxKlankenPerWord: 4,
    animationEnabled: true,
    autoSaveStories: true
  });
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const updateSettings = (updates) => {
  const settings = getSettings();
  const newSettings = { ...settings, ...updates };
  saveSettings(newSettings);
  return newSettings;
};

// ==================== API KEY ====================

export const saveApiKey = (key) => {
  // Basis encryptie (niet veilig voor productie, maar beter dan plaintext)
  const encoded = btoa(key);
  localStorage.setItem(STORAGE_KEYS.API_KEY, encoded);
};

export const getApiKey = () => {
  const encoded = localStorage.getItem(STORAGE_KEYS.API_KEY);
  if (!encoded) return '';
  try {
    return atob(encoded);
  } catch {
    return '';
  }
};

export const clearApiKey = () => {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
};

// ==================== EXPORT/IMPORT ====================

export const exportAllData = () => {
  return {
    stories: getStories(),
    learnedWords: getLearnedWords(),
    badges: Array.from(getBadges()),
    stats: getStats(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  };
};

export const importAllData = (data) => {
  if (data.stories) {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(data.stories));
  }
  if (data.learnedWords) {
    localStorage.setItem(STORAGE_KEYS.LEARNED_WORDS, JSON.stringify(data.learnedWords));
  }
  if (data.badges) {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(data.badges));
  }
  if (data.stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
  }
  if (data.settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
  }
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
