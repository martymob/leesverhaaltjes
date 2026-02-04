import { useState } from 'react';

function StoryLibrary({
  stories,
  onSelectStory,
  onDeleteStory,
  isOpen,
  setIsOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter stories op zoekterm
  const filteredStories = stories.filter(story => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      story.content.toLowerCase().includes(query) ||
      (story.subject && story.subject.toLowerCase().includes(query)) ||
      (story.theme && story.theme.toLowerCase().includes(query))
    );
  });

  // Formatteer datum
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;

    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Preview van verhaal (eerste ~80 karakters)
  const getPreview = (content) => {
    const clean = content.replace(/\*/g, '');
    if (clean.length <= 80) return clean;
    return clean.slice(0, 80) + '...';
  };

  const handleDelete = (storyId) => {
    if (confirmDelete === storyId) {
      onDeleteStory(storyId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(storyId);
      // Reset confirm na 3 seconden
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (!isOpen) {
    return (
      <button
        className="library-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        📚 Mijn Verhalen ({stories.length})
      </button>
    );
  }

  return (
    <section className="library-section">
      <div className="library-header">
        <h2>📚 Mijn Verhalen</h2>
        <button
          className="library-close"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="library-empty">
          <span className="empty-icon">📖</span>
          <p>Je hebt nog geen verhalen opgeslagen.</p>
          <p className="empty-hint">Maak een verhaal en klik op "Opslaan"!</p>
        </div>
      ) : (
        <>
          {/* Zoekbalk */}
          <div className="library-search">
            <input
              type="text"
              placeholder="🔍 Zoek in verhalen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Verhalen lijst */}
          <div className="library-grid">
            {filteredStories.map(story => (
              <div key={story.id} className="library-card">
                <div
                  className="card-content"
                  onClick={() => onSelectStory(story)}
                >
                  <div className="card-preview">
                    {getPreview(story.content)}
                  </div>
                  <div className="card-meta">
                    {story.subject && (
                      <span className="meta-subject">📌 {story.subject}</span>
                    )}
                    <span className="meta-date">📅 {formatDate(story.createdAt)}</span>
                  </div>
                </div>
                <button
                  className={`card-delete ${confirmDelete === story.id ? 'confirm' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(story.id);
                  }}
                  title={confirmDelete === story.id ? 'Klik nogmaals om te verwijderen' : 'Verwijderen'}
                >
                  {confirmDelete === story.id ? '❓' : '🗑️'}
                </button>
              </div>
            ))}
          </div>

          {filteredStories.length === 0 && searchQuery && (
            <div className="library-no-results">
              <p>Geen verhalen gevonden voor "{searchQuery}"</p>
            </div>
          )}

          {/* Stats */}
          <div className="library-stats">
            <span>📊 {stories.length} verhalen opgeslagen</span>
          </div>
        </>
      )}
    </section>
  );
}

export default StoryLibrary;
