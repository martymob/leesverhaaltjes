import { useState, useEffect, useCallback } from 'react';

function StoryDisplay({
  story,
  validation,
  isAnimating,
  setIsAnimating,
  focusLetters,
  onSaveStory,
  onNewStory,
  isLoading
}) {
  const [visibleWords, setVisibleWords] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  // Verwijder asterisks en splits in woorden voor animatie
  const cleanStory = story.replace(/\*/g, '');
  const words = cleanStory.split(/(\s+)/); // Behoud whitespace

  // Animatie effect
  useEffect(() => {
    if (isAnimating && story) {
      setVisibleWords(0);

      const interval = setInterval(() => {
        setVisibleWords(v => {
          if (v >= words.length) {
            clearInterval(interval);
            setIsAnimating(false);
            return v;
          }
          return v + 1;
        });
      }, 50); // 50ms per woord - snel maar nog leesbaar

      return () => clearInterval(interval);
    } else if (!isAnimating) {
      setVisibleWords(words.length);
    }
  }, [isAnimating, story, words.length, setIsAnimating]);

  // Render verhaal met focus woorden gehighlight
  const renderStory = useCallback(() => {
    if (!story) return null;

    // Parse het verhaal met asterisks voor focus woorden
    const parts = story.split(/(\*[^*]+\*)/);

    return parts.map((part, index) => {
      // Check of dit een focus woord is (tussen asterisks)
      if (part.startsWith('*') && part.endsWith('*')) {
        const word = part.slice(1, -1);
        return (
          <span key={index} className="focus-word animate-pop">
            {word}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [story]);

  // Render geanimeerd verhaal
  const renderAnimatedStory = useCallback(() => {
    if (!story) return null;

    const cleanText = story.replace(/\*/g, '');
    const allWords = cleanText.split(/(\s+)/);

    // Maak een map van focus woorden (woorden die tussen * * staan)
    const focusWordsSet = new Set();
    const matches = story.match(/\*([^*]+)\*/g);
    if (matches) {
      matches.forEach(match => {
        focusWordsSet.add(match.slice(1, -1).toLowerCase());
      });
    }

    return allWords.slice(0, visibleWords).map((word, i) => {
      const isWhitespace = /^\s+$/.test(word);
      if (isWhitespace) {
        return <span key={i}>{word}</span>;
      }

      const isFocusWord = focusWordsSet.has(word.toLowerCase().replace(/[.,!?]/g, ''));

      return (
        <span
          key={i}
          className={`word-appear ${isFocusWord ? 'focus-word' : ''}`}
          style={{ animationDelay: `${i * 0.02}s` }}
        >
          {word}
        </span>
      );
    });
  }, [story, visibleWords]);

  const copyToClipboard = () => {
    const cleanText = story.replace(/\*/g, '');
    navigator.clipboard.writeText(cleanText);
  };

  if (!story) return null;

  return (
    <section className="story-section">
      <h2>📚 Jouw Verhaal</h2>

      <div className="story-box">
        <div className="story-text">
          {isAnimating ? renderAnimatedStory() : renderStory()}
        </div>

        {/* Cursor tijdens animatie */}
        {isAnimating && visibleWords < words.length && (
          <span className="typing-cursor">|</span>
        )}
      </div>

      {/* Validatie warnings */}
      {validation && !validation.valid && (
        <div className="validation-section">
          <button
            className="validation-toggle"
            onClick={() => setShowValidation(!showValidation)}
          >
            ⚠️ {validation.issues.length} aandachtspunt{validation.issues.length > 1 ? 'en' : ''} gevonden
            <span className={`toggle-arrow ${showValidation ? 'open' : ''}`}>▼</span>
          </button>

          {showValidation && (
            <div className="validation-details">
              {validation.issues.map((issue, idx) => (
                <div key={idx} className={`validation-issue ${issue.type}`}>
                  <span className="issue-icon">
                    {issue.type === 'too_long' ? '📏' : '🔤'}
                  </span>
                  <span className="issue-text">{issue.message}</span>
                </div>
              ))}
              <p className="validation-hint">
                💡 Tip: Genereer een nieuw verhaal of pas de instellingen aan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Story stats */}
      {validation && validation.stats && (
        <div className="story-stats">
          <span className="stat">
            📝 {validation.stats.totalWords} woorden
          </span>
          <span className="stat">
            🔤 {validation.stats.uniqueWords} unieke woorden
          </span>
        </div>
      )}

      {/* Acties */}
      <div className="story-actions">
        <button onClick={copyToClipboard} className="btn-secondary">
          📋 Kopiëren
        </button>
        <button onClick={onSaveStory} className="btn-secondary">
          💾 Opslaan
        </button>
        <button onClick={() => window.print()} className="btn-secondary">
          🖨️ Printen
        </button>
        <button onClick={onNewStory} className="btn-primary" disabled={isLoading}>
          {isLoading ? '✨ Bezig...' : '🔄 Nieuw verhaal'}
        </button>
      </div>
    </section>
  );
}

export default StoryDisplay;
