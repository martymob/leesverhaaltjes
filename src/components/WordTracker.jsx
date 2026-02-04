import { useMemo } from 'react';

function WordTracker({ learnedWords, isOpen, setIsOpen }) {
  // Categoriseer woorden
  const categorizedWords = useMemo(() => {
    const newWords = []; // 1x gezien
    const learningWords = []; // 2-4x gezien
    const masteredWords = []; // 5+ keer gezien

    learnedWords.forEach(wordData => {
      if (wordData.timesSeen >= 5) {
        masteredWords.push(wordData);
      } else if (wordData.timesSeen >= 2) {
        learningWords.push(wordData);
      } else {
        newWords.push(wordData);
      }
    });

    // Sorteer elk op times seen (meest naar minst)
    const sortByTimes = (a, b) => b.timesSeen - a.timesSeen;

    return {
      newWords: newWords.sort(sortByTimes),
      learningWords: learningWords.sort(sortByTimes),
      masteredWords: masteredWords.sort(sortByTimes)
    };
  }, [learnedWords]);

  // Stats
  const totalWords = learnedWords.length;
  const masteredCount = categorizedWords.masteredWords.length;
  const learningCount = categorizedWords.learningWords.length;

  if (!isOpen) {
    return (
      <button
        className="tracker-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        📝 Woorden ({totalWords})
        {masteredCount > 0 && <span className="mastered-badge">⭐{masteredCount}</span>}
      </button>
    );
  }

  return (
    <section className="tracker-section">
      <div className="tracker-header">
        <h2>📝 Geleerde Woorden</h2>
        <button
          className="tracker-close"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Stats overview */}
      <div className="tracker-stats">
        <div className="stat-card total">
          <span className="stat-number">{totalWords}</span>
          <span className="stat-label">Totaal</span>
        </div>
        <div className="stat-card mastered">
          <span className="stat-number">{masteredCount}</span>
          <span className="stat-label">Geleerd ⭐</span>
        </div>
        <div className="stat-card learning">
          <span className="stat-number">{learningCount}</span>
          <span className="stat-label">Aan het leren</span>
        </div>
      </div>

      {totalWords === 0 ? (
        <div className="tracker-empty">
          <span className="empty-icon">📖</span>
          <p>Nog geen woorden geleerd!</p>
          <p className="empty-hint">Lees een verhaal om woorden te verzamelen.</p>
        </div>
      ) : (
        <div className="tracker-categories">
          {/* Geleerde woorden (5+ keer) */}
          {categorizedWords.masteredWords.length > 0 && (
            <div className="word-category mastered">
              <h3>⭐ Geleerd! ({categorizedWords.masteredWords.length})</h3>
              <p className="category-hint">Deze woorden ken je goed!</p>
              <div className="word-chips">
                {categorizedWords.masteredWords.map(wordData => (
                  <span
                    key={wordData.word}
                    className="word-chip mastered"
                    title={`${wordData.timesSeen}x gelezen`}
                  >
                    {wordData.word}
                    <span className="chip-count">{wordData.timesSeen}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Woorden aan het leren (2-4 keer) */}
          {categorizedWords.learningWords.length > 0 && (
            <div className="word-category learning">
              <h3>📖 Aan het leren ({categorizedWords.learningWords.length})</h3>
              <p className="category-hint">Nog een paar keer oefenen!</p>
              <div className="word-chips">
                {categorizedWords.learningWords.map(wordData => (
                  <span
                    key={wordData.word}
                    className="word-chip learning"
                    title={`${wordData.timesSeen}x gelezen, nog ${5 - wordData.timesSeen}x te gaan`}
                  >
                    {wordData.word}
                    <span className="chip-count">{wordData.timesSeen}/5</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nieuwe woorden (1 keer) */}
          {categorizedWords.newWords.length > 0 && (
            <div className="word-category new">
              <h3>🌟 Nieuw ({categorizedWords.newWords.length})</h3>
              <p className="category-hint">Net ontdekt!</p>
              <div className="word-chips">
                {categorizedWords.newWords.slice(0, 30).map(wordData => (
                  <span
                    key={wordData.word}
                    className="word-chip new"
                    title="1x gelezen"
                  >
                    {wordData.word}
                  </span>
                ))}
                {categorizedWords.newWords.length > 30 && (
                  <span className="word-chip more">
                    +{categorizedWords.newWords.length - 30} meer
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uitleg */}
      <div className="tracker-legend">
        <p>💡 Woorden die je 5x of vaker leest zijn "geleerd"!</p>
      </div>
    </section>
  );
}

export default WordTracker;
