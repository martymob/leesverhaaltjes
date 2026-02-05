import { useState } from 'react';
import { STORY_THEMES, getRandomSubject, getSuggestedNames } from '../data/themes';
import { WRITING_STYLES } from '../data/writingStyles';

function ThemeSelector({
  selectedTheme,
  setSelectedTheme,
  subject,
  setSubject,
  names,
  setNames,
  writingStyle,
  setWritingStyle
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);

    // Stel random onderwerp voor
    const randomSubject = getRandomSubject(themeId);
    setSubject(randomSubject);

    // Stel namen voor (neem eerste 2)
    const suggestedNames = getSuggestedNames(themeId);
    if (suggestedNames.length > 0) {
      setNames(suggestedNames.slice(0, 2).join(', '));
    }
  };

  const handleRandomSubject = () => {
    if (selectedTheme) {
      const randomSubject = getRandomSubject(selectedTheme);
      setSubject(randomSubject);
    }
  };

  // Samenvatting voor ingeklapte weergave
  const getSummary = () => {
    const styleInfo = WRITING_STYLES[writingStyle];
    const themeInfo = selectedTheme ? STORY_THEMES[selectedTheme] : null;
    return {
      styleIcon: styleInfo?.icon || '📖',
      styleName: styleInfo?.naam?.replace(/^[^\s]+\s/, '') || 'Standaard',
      themeIcon: themeInfo?.icon || '📝',
      themeName: themeInfo?.naam?.replace(/^[^\s]+\s/, '') || 'Geen',
      hasSubject: !!subject,
      hasNames: !!names
    };
  };

  const summary = getSummary();

  return (
    <section className="theme-section">
      {/* Header met toggle */}
      <div
        className="section-header-collapsible"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>🗺️ Avontuur</h2>
        <div className="section-summary">
          <span className="summary-badge theme-style" title="Schrijfstijl">
            {summary.styleIcon} {summary.styleName}
          </span>
          <span className="summary-badge theme-theme" title="Thema">
            {summary.themeIcon} {summary.themeName}
          </span>
          {summary.hasSubject && (
            <span className="summary-badge theme-subject" title="Onderwerp ingesteld">📝</span>
          )}
        </div>
        <button className={`expand-toggle theme ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Uitklapbare content */}
      {isExpanded && (
        <div className="collapsible-content">
          {/* Schrijfstijl selector */}
          <div className="style-section">
            <label className="style-label">✍️ Schrijfstijl:</label>
            <div className="style-grid">
              {Object.values(WRITING_STYLES).map((style) => (
                <button
                  key={style.id}
                  className={`style-card ${writingStyle === style.id ? 'active' : ''}`}
                  style={{ '--style-color': style.kleur }}
                  onClick={() => setWritingStyle(style.id)}
                  title={style.beschrijving}
                >
                  <span className="style-icon">{style.icon}</span>
                  <span className="style-name">{style.naam.replace(/^[^\s]+\s/, '')}</span>
                </button>
              ))}
            </div>
            {writingStyle && WRITING_STYLES[writingStyle]?.voorbeeld && (
              <p className="style-example">
                💡 {WRITING_STYLES[writingStyle].voorbeeld}
              </p>
            )}
          </div>

          {/* Thema selector */}
          <label className="style-label">🎨 Thema:</label>
          <div className="theme-grid">
            {Object.entries(STORY_THEMES).map(([themeId, theme]) => (
              <button
                key={themeId}
                className={`theme-card ${selectedTheme === themeId ? 'active' : ''}`}
                style={{ '--theme-color': theme.kleur }}
                onClick={() => handleThemeSelect(themeId)}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.naam.replace(/^[^\s]+\s/, '')}</span>
              </button>
            ))}
          </div>

          <div className="theme-inputs">
            <div className="input-group">
              <label htmlFor="subject">
                Onderwerp van het verhaal:
                {selectedTheme && (
                  <button
                    type="button"
                    className="btn-inline"
                    onClick={handleRandomSubject}
                    title="Kies random onderwerp"
                  >
                    🎲
                  </button>
                )}
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="bijv. een kat, op het strand, in het bos..."
                className="text-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="names">
                Namen in het verhaal:
                {selectedTheme && (
                  <button
                    type="button"
                    className="btn-inline"
                    onClick={() => {
                      const suggestedNames = getSuggestedNames(selectedTheme);
                      setNames(suggestedNames.slice(0, 2).join(', '));
                    }}
                    title="Gebruik voorgestelde namen"
                  >
                    🎲
                  </button>
                )}
              </label>
              <input
                type="text"
                id="names"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="bijv. Jan, Mia, Pip..."
                className="text-input"
              />
              <p className="input-hint">Tip: Korte namen (max 4 klanken) werken het beste!</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ThemeSelector;
