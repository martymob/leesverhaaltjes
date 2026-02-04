import { useCallback } from 'react';
import { VLL_KERNEN, getLettersUpToKern, getKernOptions } from '../data/vllKernen';

// Alle letters gegroepeerd
const LETTER_GROUPS = {
  'Klinkers': ['a', 'e', 'i', 'o', 'u'],
  'Tweeklanken': ['aa', 'ee', 'oo', 'uu', 'ie', 'eu', 'oe', 'ei', 'ij', 'ou', 'au', 'ui'],
  'Medeklinkers': ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'],
  'Letterclusters': ['ch', 'sch', 'ng', 'nk', 'aai', 'ooi', 'oei']
};

function LetterSelector({
  selectedLetters,
  setSelectedLetters,
  focusLetters,
  setFocusLetters,
  selectedKern,
  setSelectedKern
}) {
  // Toggle letter selection via checkbox
  const toggleLetter = useCallback((letter, e) => {
    if (e) e.stopPropagation();

    setSelectedLetters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(letter)) {
        newSet.delete(letter);
        // Ook verwijderen uit focus
        setFocusLetters(f => {
          const newFocus = new Set(f);
          newFocus.delete(letter);
          return newFocus;
        });
      } else {
        newSet.add(letter);
      }
      return newSet;
    });
  }, [setSelectedLetters, setFocusLetters]);

  // Toggle focus letter (via klik op box)
  const toggleFocus = useCallback((letter) => {
    // Alleen als letter geselecteerd is
    if (!selectedLetters.has(letter)) {
      // Selecteer eerst de letter
      setSelectedLetters(prev => new Set([...prev, letter]));
      return;
    }

    setFocusLetters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(letter)) {
        newSet.delete(letter);
      } else if (newSet.size < 3) {
        newSet.add(letter);
      }
      return newSet;
    });
  }, [selectedLetters, setSelectedLetters, setFocusLetters]);

  // Selecteer alle letters tot een kern
  const selectKern = useCallback((kernId) => {
    setSelectedKern(kernId);
    const letters = getLettersUpToKern(kernId);
    setSelectedLetters(new Set(letters));
    setFocusLetters(new Set());
  }, [setSelectedKern, setSelectedLetters, setFocusLetters]);

  // Select/deselect groep
  const selectGroup = useCallback((group) => {
    setSelectedLetters(prev => {
      const newSet = new Set(prev);
      LETTER_GROUPS[group].forEach(letter => newSet.add(letter));
      return newSet;
    });
  }, [setSelectedLetters]);

  const deselectGroup = useCallback((group) => {
    setSelectedLetters(prev => {
      const newSet = new Set(prev);
      LETTER_GROUPS[group].forEach(letter => {
        newSet.delete(letter);
      });
      return newSet;
    });
    setFocusLetters(prev => {
      const newSet = new Set(prev);
      LETTER_GROUPS[group].forEach(letter => {
        newSet.delete(letter);
      });
      return newSet;
    });
  }, [setSelectedLetters, setFocusLetters]);

  const kernOptions = getKernOptions();

  return (
    <section className="letter-section">
      <h2>📝 Kies je letters</h2>

      {/* Kern selector */}
      <div className="kern-selector">
        <label htmlFor="kern-select">📚 Veilig Leren Lezen kern:</label>
        <select
          id="kern-select"
          value={selectedKern}
          onChange={(e) => selectKern(e.target.value)}
          className="kern-select"
        >
          {kernOptions.map(kern => (
            <option key={kern.id} value={kern.id}>
              {kern.naam} - {kern.beschrijving} ({kern.letterCount} letters)
            </option>
          ))}
        </select>
      </div>

      {/* Kern badges */}
      <div className="kern-badges">
        {Object.entries(VLL_KERNEN).slice(0, 7).map(([id, kern]) => (
          <button
            key={id}
            className={`kern-badge ${selectedKern === id ? 'active' : ''}`}
            style={{ '--kern-color': kern.kleur }}
            onClick={() => selectKern(id)}
            title={kern.beschrijving}
          >
            {kern.naam.replace('Kern ', '')}
          </button>
        ))}
      </div>

      <p className="instruction">
        Vink letters aan die in het verhaal mogen.
        Klik op een <span className="focus-example">aangevinkte letter</span> om deze als focus letter te markeren (max 3).
      </p>

      {/* Letter groepen */}
      {Object.entries(LETTER_GROUPS).map(([groupName, letters]) => (
        <div key={groupName} className="letter-group">
          <div className="group-header">
            <h3>{groupName}</h3>
            <div className="group-buttons">
              <button onClick={() => selectGroup(groupName)} className="btn-tiny">Alles aan</button>
              <button onClick={() => deselectGroup(groupName)} className="btn-tiny">Alles uit</button>
            </div>
          </div>
          <div className="letter-grid">
            {letters.map(letter => {
              const isSelected = selectedLetters.has(letter);
              const isFocus = focusLetters.has(letter);

              return (
                <div
                  key={letter}
                  className={`letter-box ${isSelected ? 'selected' : ''} ${isFocus ? 'focus' : ''}`}
                  onClick={() => toggleFocus(letter)}
                  title={isSelected ? (isFocus ? 'Klik om focus te verwijderen' : 'Klik om focus letter te maken') : 'Klik om te selecteren'}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleLetter(letter, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="letter-text">{letter}</span>
                  {isFocus && <span className="focus-star">🎯</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Focus letters samenvatting */}
      {focusLetters.size > 0 && (
        <div className="focus-summary-inline">
          <span>🎯 Focus letters: </span>
          {Array.from(focusLetters).map(letter => (
            <span key={letter} className="focus-letter-badge">{letter}</span>
          ))}
          <span className="focus-hint">({3 - focusLetters.size} over)</span>
        </div>
      )}
    </section>
  );
}

export default LetterSelector;
