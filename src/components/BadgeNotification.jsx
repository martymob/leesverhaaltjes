import { useEffect, useState } from 'react';
import { getBadgeById } from '../data/badges';

function BadgeNotification({ newBadges, onClose }) {
  const [visible, setVisible] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (newBadges && newBadges.length > 0) {
      setVisible(true);
      setCurrentBadgeIndex(0);
    }
  }, [newBadges]);

  const handleClose = () => {
    if (currentBadgeIndex < newBadges.length - 1) {
      // Toon volgende badge
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      // Alle badges getoond, sluit
      setVisible(false);
      onClose();
    }
  };

  if (!visible || !newBadges || newBadges.length === 0) {
    return null;
  }

  const currentBadgeId = newBadges[currentBadgeIndex];
  const badge = getBadgeById(currentBadgeId);

  if (!badge) return null;

  return (
    <div className="badge-notification-overlay" onClick={handleClose}>
      <div className="badge-notification" onClick={(e) => e.stopPropagation()}>
        <div className="badge-celebration">
          {'🎉✨🌟⭐🎊'.split('').map((emoji, i) => (
            <span
              key={i}
              className="celebration-emoji"
              style={{
                '--delay': `${i * 0.15}s`,
                '--rotation': `${Math.random() * 360}deg`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="badge-content">
          <h2 className="badge-title">🏆 Nieuwe Badge!</h2>

          <div className="badge-icon-large">
            {badge.name.split(' ')[0]}
          </div>

          <h3 className="badge-name">
            {badge.name.split(' ').slice(1).join(' ')}
          </h3>

          <p className="badge-description">
            {badge.description}
          </p>

          {newBadges.length > 1 && (
            <p className="badge-counter">
              Badge {currentBadgeIndex + 1} van {newBadges.length}
            </p>
          )}

          <button className="btn-primary badge-close" onClick={handleClose}>
            {currentBadgeIndex < newBadges.length - 1 ? 'Volgende badge →' : 'Super! 🎉'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BadgeNotification;
