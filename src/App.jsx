import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Components
import LetterSelector from './components/LetterSelector';
import ThemeSelector from './components/ThemeSelector';
import StoryDisplay from './components/StoryDisplay';
import StoryLibrary from './components/StoryLibrary';
import WordTracker from './components/WordTracker';
import QuizSection from './components/QuizSection';
import BadgeNotification from './components/BadgeNotification';

// Services
import { generateStoryWithRetry, generateQuestions } from './services/storyService';
import { extractWords } from './services/validationService';
import * as storage from './services/storageService';

// Data
import { BADGES, checkEarnedBadges } from './data/badges';
import { getLettersUpToKern } from './data/vllKernen';

function App() {
  // ==================== STATE ====================

  // API & Settings
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  // Letter selection
  const [selectedLetters, setSelectedLetters] = useState(new Set());
  const [focusLetters, setFocusLetters] = useState(new Set());
  const [selectedKern, setSelectedKern] = useState('kern7');

  // Story settings
  const [selectedTheme, setSelectedTheme] = useState('');
  const [subject, setSubject] = useState('');
  const [names, setNames] = useState('');
  const [maxKlanken, setMaxKlanken] = useState(4);

  // Story state
  const [story, setStory] = useState('');
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Quiz
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Storage & Stats
  const [savedStories, setSavedStories] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState(new Set());
  const [stats, setStats] = useState({});
  const [newBadges, setNewBadges] = useState([]);

  // UI State
  const [showLibrary, setShowLibrary] = useState(false);
  const [showWordTracker, setShowWordTracker] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'library', 'words', 'settings'
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ==================== INITIALIZATION ====================

  // Load data from localStorage on mount
  useEffect(() => {
    const savedApiKey = storage.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiInput(false);
    }

    const settings = storage.getSettings();
    setSelectedKern(settings.selectedKern || 'kern7');
    setMaxKlanken(settings.maxKlankenPerWord || 4);

    // Set default letters based on kern
    const kernLetters = getLettersUpToKern(settings.selectedKern || 'kern7');
    setSelectedLetters(new Set(kernLetters));

    setSavedStories(storage.getStories());
    setLearnedWords(storage.getLearnedWords());
    setEarnedBadges(storage.getBadges());
    setStats(storage.getStats());
  }, []);

  // Save settings when they change
  useEffect(() => {
    storage.updateSettings({
      selectedKern,
      maxKlankenPerWord: maxKlanken
    });
  }, [selectedKern, maxKlanken]);

  // ==================== HANDLERS ====================

  // Save API key
  const handleSaveApiKey = () => {
    if (apiKey) {
      storage.saveApiKey(apiKey);
      setShowApiInput(false);
    }
  };

  // Generate story
  const handleGenerateStory = async () => {
    if (!apiKey) {
      setError('Vul eerst je API key in!');
      return;
    }

    setIsLoading(true);
    setError('');
    setStory('');
    setQuestions([]);
    setValidation(null);

    try {
      const result = await generateStoryWithRetry({
        apiKey,
        selectedLetters,
        focusLetters,
        maxKlanken,
        subject,
        names,
        theme: selectedTheme
      });

      setStory(result.story);
      setValidation(result.validation);
      setIsAnimating(true);

      // Track words
      if (result.words) {
        const wordStrings = result.words.map(w => w.word);
        const updatedWords = storage.addLearnedWords(wordStrings);
        setLearnedWords(updatedWords);
      }

      // Update stats
      const newStats = storage.incrementStoriesCount();
      if (selectedTheme) {
        storage.addThemeUsed(selectedTheme);
      }
      if (focusLetters.size >= 3) {
        storage.updateStats({ usedThreeFocusLetters: true });
      }
      setStats(storage.getStats());

      // Check for new badges
      checkAndAwardBadges();

    } catch (err) {
      setError(`Fout: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check and award badges
  const checkAndAwardBadges = useCallback(() => {
    const currentStats = storage.getStats();
    const badgeStats = {
      storiesCount: currentStats.storiesCount || 0,
      learnedWordsCount: storage.getLearnedWordsCount(),
      correctAnswers: currentStats.correctAnswers || 0,
      perfectQuizzes: currentStats.perfectQuizzes || 0,
      themesUsed: (currentStats.themesUsed || []).length,
      streak: currentStats.streak || 0,
      savedStories: storage.getStories().length,
      usedThreeFocusLetters: currentStats.usedThreeFocusLetters || false
    };

    const currentBadges = Array.from(storage.getBadges());
    const newlyEarned = checkEarnedBadges(badgeStats, currentBadges);

    if (newlyEarned.length > 0) {
      newlyEarned.forEach(badgeId => storage.addBadge(badgeId));
      setEarnedBadges(storage.getBadges());
      setNewBadges(newlyEarned);
    }
  }, []);

  // Save current story
  const handleSaveStory = () => {
    if (!story) return;

    const savedStory = storage.saveStory({
      content: story,
      subject,
      theme: selectedTheme,
      names,
      selectedLetters: Array.from(selectedLetters),
      focusLetters: Array.from(focusLetters),
      validation
    });

    setSavedStories(storage.getStories());
    checkAndAwardBadges();
  };

  // Load story from library
  const handleSelectStory = (storyData) => {
    setStory(storyData.content);
    setSubject(storyData.subject || '');
    setSelectedTheme(storyData.theme || '');
    setNames(storyData.names || '');
    setValidation(storyData.validation || null);
    setQuestions([]);
    setShowLibrary(false);
    setActiveTab('create');
  };

  // Delete story from library
  const handleDeleteStory = (storyId) => {
    storage.deleteStory(storyId);
    setSavedStories(storage.getStories());
  };

  // Generate quiz questions
  const handleGenerateQuestions = async () => {
    if (!story || !apiKey) return;

    setIsLoadingQuestions(true);

    try {
      const generatedQuestions = await generateQuestions({ apiKey, story });
      setQuestions(generatedQuestions);
    } catch (err) {
      setError(`Kon geen vragen maken: ${err.message}`);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (result) => {
    const newStats = storage.getStats();
    newStats.correctAnswers = (newStats.correctAnswers || 0) + result.score;

    if (result.isPerfect) {
      newStats.perfectQuizzes = (newStats.perfectQuizzes || 0) + 1;
    }

    storage.updateStats(newStats);
    setStats(storage.getStats());
    checkAndAwardBadges();
  };

  // Reset all data
  const handleResetAll = () => {
    storage.clearAllData();

    // Reset all state
    setApiKey('');
    setShowApiInput(true);
    setSelectedKern('kern7');
    setSelectedLetters(new Set(getLettersUpToKern('kern7')));
    setFocusLetters(new Set());
    setSelectedTheme('');
    setSubject('');
    setNames('');
    setMaxKlanken(4);
    setStory('');
    setValidation(null);
    setQuestions([]);
    setSavedStories([]);
    setLearnedWords([]);
    setEarnedBadges(new Set());
    setStats({});
    setShowResetConfirm(false);
    setActiveTab('create');
  };

  // Export data
  const handleExportData = () => {
    const data = storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leesverhaaltjes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        storage.importAllData(data);

        // Reload all state
        setSavedStories(storage.getStories());
        setLearnedWords(storage.getLearnedWords());
        setEarnedBadges(storage.getBadges());
        setStats(storage.getStats());

        alert('Data succesvol geïmporteerd!');
      } catch (err) {
        alert('Kon bestand niet lezen. Controleer of het een geldig backup bestand is.');
      }
    };
    reader.readAsText(file);
  };

  // ==================== RENDER ====================

  return (
    <div className="app">
      {/* Badge notification */}
      <BadgeNotification
        newBadges={newBadges}
        onClose={() => setNewBadges([])}
      />

      {/* Header */}
      <header className="header">
        <h1>🦁 Avonturen Leesclub 🌴</h1>
        <p className="subtitle">Veilig Leren Lezen - Kern {selectedKern.replace('kern', '').replace('start', 'Start')}</p>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stats-item">
            <span className="stats-icon">📚</span>
            <span className="stats-value">{stats.storiesCount || 0}</span>
            <span className="stats-label">verhalen</span>
          </div>
          <div className="stats-item">
            <span className="stats-icon">📝</span>
            <span className="stats-value">{learnedWords.length}</span>
            <span className="stats-label">woorden</span>
          </div>
          <div className="stats-item">
            <span className="stats-icon">🔥</span>
            <span className="stats-value">{stats.streak || 0}</span>
            <span className="stats-label">dagen</span>
          </div>
        </div>

        {/* Badges */}
        {earnedBadges.size > 0 && (
          <div className="badges-bar">
            {BADGES.filter(b => earnedBadges.has(b.id)).map(badge => (
              <span key={badge.id} className="badge-mini" title={badge.description}>
                {badge.name.split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Navigation tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ✨ Nieuw
        </button>
        <button
          className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          📚 Verhalen ({savedStories.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
        >
          📝 Woorden ({learnedWords.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️
        </button>
      </nav>

      <main className="main-content">
        {/* API Key input */}
        {showApiInput && activeTab === 'create' && (
          <section className="api-section">
            <h2>Geheime Sleutel</h2>
            <div className="api-input-group">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Vul je Anthropic API key in..."
                className="api-input"
              />
              <button
                onClick={handleSaveApiKey}
                className="btn-small"
                disabled={!apiKey}
              >
                Opslaan
              </button>
            </div>
            <p className="api-hint">
              Je API key wordt veilig opgeslagen in je browser.
            </p>
          </section>
        )}

        {/* Tab content */}
        {activeTab === 'create' && (
          <>
            {/* Letter selector */}
            <LetterSelector
              selectedLetters={selectedLetters}
              setSelectedLetters={setSelectedLetters}
              focusLetters={focusLetters}
              setFocusLetters={setFocusLetters}
              selectedKern={selectedKern}
              setSelectedKern={setSelectedKern}
            />

            {/* Theme selector */}
            <ThemeSelector
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              subject={subject}
              setSubject={setSubject}
              names={names}
              setNames={setNames}
            />

            {/* Settings */}
            <section className="settings-section">
              <h2>Bouw je verhaal</h2>
              <div className="input-group">
                <label htmlFor="maxKlanken">Maximum klanken per woord:</label>
                <div className="klanken-selector">
                  {[3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      className={`klanken-btn ${maxKlanken === num ? 'active' : ''}`}
                      onClick={() => setMaxKlanken(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="input-hint">
                  Voorbeeld: "maan" = 3 klanken (m-aa-n), "school" = 4 klanken (sch-oo-l)
                </p>
              </div>
            </section>

            {/* Generate button */}
            <section className="generate-section">
              <button
                onClick={handleGenerateStory}
                disabled={isLoading || !apiKey}
                className="generate-btn"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Avontuur laden...
                  </>
                ) : (
                  '🚀 Start het avontuur!'
                )}
              </button>

              {error && <p className="error-message">❌ {error}</p>}
            </section>

            {/* Story display */}
            {story && (
              <StoryDisplay
                story={story}
                validation={validation}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
                focusLetters={focusLetters}
                onSaveStory={handleSaveStory}
                onNewStory={handleGenerateStory}
                isLoading={isLoading}
              />
            )}

            {/* Quiz section */}
            {story && (
              <QuizSection
                questions={questions}
                isLoading={isLoadingQuestions}
                onComplete={handleQuizComplete}
                onGenerateQuestions={handleGenerateQuestions}
              />
            )}
          </>
        )}

        {activeTab === 'library' && (
          <StoryLibrary
            stories={savedStories}
            onSelectStory={handleSelectStory}
            onDeleteStory={handleDeleteStory}
            isOpen={true}
            setIsOpen={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'words' && (
          <WordTracker
            learnedWords={learnedWords}
            isOpen={true}
            setIsOpen={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'settings' && (
          <section className="settings-page">
            <h2>Instellingen</h2>

            {/* API Key */}
            <div className="settings-group">
              <h3>🔑 API Sleutel</h3>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowApiInput(true);
                  setActiveTab('create');
                }}
              >
                API key wijzigen
              </button>
            </div>

            {/* Data Export/Import */}
            <div className="settings-group">
              <h3>💾 Data Backup</h3>
              <p className="settings-hint">
                Maak een backup van je verhalen, woorden en badges.
              </p>
              <div className="settings-buttons">
                <button className="btn-secondary" onClick={handleExportData}>
                  📤 Exporteer data
                </button>
                <label className="btn-secondary import-btn">
                  📥 Importeer data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Content info */}
            <div className="settings-group">
              <h3>🛡️ Veilige Content</h3>
              <p className="settings-hint">
                De verhalen worden gemaakt door Claude AI van Anthropic.
                Claude is getraind om veilige, kindvriendelijke content te maken.
                Er worden automatisch geen ongepaste woorden of thema's gebruikt.
              </p>
              <div className="safety-badges">
                <span className="safety-badge">✅ Kindvriendelijk</span>
                <span className="safety-badge">✅ Geen scheldwoorden</span>
                <span className="safety-badge">✅ Educatief</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="settings-group">
              <h3>📊 Statistieken</h3>
              <div className="stats-detail">
                <div className="stat-row">
                  <span>Totaal verhalen gemaakt:</span>
                  <strong>{stats.storiesCount || 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Verhalen opgeslagen:</span>
                  <strong>{savedStories.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Woorden geleerd:</span>
                  <strong>{learnedWords.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Quizvragen goed:</span>
                  <strong>{stats.correctAnswers || 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Perfecte quizzes:</span>
                  <strong>{stats.perfectQuizzes || 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Badges verdiend:</span>
                  <strong>{earnedBadges.size}</strong>
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="settings-group danger-zone">
              <h3>⚠️ Opnieuw beginnen</h3>
              <p className="settings-hint">
                Dit verwijdert ALLE data: verhalen, woorden, badges en instellingen.
                Dit kan niet ongedaan worden gemaakt!
              </p>

              {!showResetConfirm ? (
                <button
                  className="btn-danger"
                  onClick={() => setShowResetConfirm(true)}
                >
                  🗑️ Alles verwijderen
                </button>
              ) : (
                <div className="reset-confirm">
                  <p className="confirm-text">Weet je het zeker? Alle voortgang gaat verloren!</p>
                  <div className="confirm-buttons">
                    <button
                      className="btn-danger"
                      onClick={handleResetAll}
                    >
                      Ja, verwijder alles
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Nee, annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>🦁 Gemaakt voor kleine ontdekkers 🌴</p>
      </footer>
    </div>
  );
}

export default App;
