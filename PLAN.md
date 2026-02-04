# Leesverhaaltjes Generator - Verbeteringsplan

## Overzicht van gewenste features

### Bugfixes (Prioriteit 1)
1. **Focus letter toggle bug** - Logica repareren
2. **Woord lengte validatie** - Post-processing check
3. **Letter telling** - Klanken correct tellen (aa = 1 klank)

### Technische verbeteringen (Prioriteit 2)
4. **Woordenboek validatie** - Nederlandse woordenlijst
5. **Retry mechanisme** - Automatisch opnieuw bij fouten

### Nieuwe features (Prioriteit 3)
11. **Verhalen bibliotheek** - Opslaan en herlezen
12. **Thema's/Templates** - Voorgedefinieerde onderwerpen
15. **Woordenschat tracker** - Geleerde woorden bijhouden

### Educatieve verbeteringen (Prioriteit 4)
27. **Begripsvragen** - Vragen over het verhaal

### UX verbeteringen (Prioriteit 5)
32. **Animaties** - Woord-voor-woord verschijnen

### Toekomstige overweging
21. **Mini-spelletjes** - Na implementatie van basis
22. **Avatar systeem** - Na gamification basis
23. **Veilig Leren Lezen integratie** - Lettervolgordes

---

## Architectuur Beslissingen

### Online toegang & Data opslag

**Optie A: Vercel/Netlify + Supabase (Aanbevolen)**
- Frontend: Gratis hosting op Vercel
- Backend: Supabase (gratis tier: 500MB database, auth)
- Voordelen:
  - Gratis voor persoonlijk gebruik
  - Gebruikers kunnen inloggen
  - Data synct tussen apparaten
  - Makkelijk te deployen

**Optie B: Vercel + localStorage (Simpeler)**
- Frontend: Gratis hosting op Vercel
- Data: Alleen lokaal in browser
- Voordelen: Geen backend nodig
- Nadelen: Data verloren bij andere browser/apparaat

**Optie C: Firebase (Alternatief)**
- Vergelijkbaar met Supabase
- Google ecosysteem

### Gekozen aanpak: Vercel + Supabase

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                    Gehost op Vercel                      │
├─────────────────────────────────────────────────────────┤
│  Components:                                             │
│  ├── App.jsx (hoofdcomponent)                           │
│  ├── LetterSelector.jsx                                 │
│  ├── StoryDisplay.jsx                                   │
│  ├── StoryLibrary.jsx                                   │
│  ├── WordTracker.jsx                                    │
│  ├── QuizSection.jsx                                    │
│  └── ThemeSelector.jsx                                  │
├─────────────────────────────────────────────────────────┤
│  Services:                                               │
│  ├── anthropicService.js (API calls)                    │
│  ├── validationService.js (woordenboek check)           │
│  ├── supabaseClient.js (database)                       │
│  └── storageService.js (abstractie laag)                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
├─────────────────────────────────────────────────────────┤
│  Tables:                                                 │
│  ├── users (auth - ingebouwd)                           │
│  ├── profiles (naam, avatar, created_at)                │
│  ├── stories (id, user_id, content, subject, date)      │
│  ├── learned_words (id, user_id, word, times_seen)      │
│  ├── achievements (id, user_id, badge_id, earned_at)    │
│  └── settings (id, user_id, selected_letters, etc)      │
└─────────────────────────────────────────────────────────┘
```

---

## Implementatie Stappen

### Fase 1: Bugfixes & Basis (Vandaag)

#### Stap 1.1: Focus letter bug fixen
```javascript
// Huidige (buggy) logica:
onClick={() => selectedLetters.has(letter) ? toggleFocus(letter) : toggleLetter(letter)}

// Nieuwe logica:
// - Checkbox: toggle selectie
// - Klik op box (niet checkbox): toggle focus (alleen als geselecteerd)
```

#### Stap 1.2: Woord validatie systeem
```javascript
// validationService.js
const validateStory = (story, selectedLetters, maxLetters) => {
  const words = story.match(/\b[a-zA-Z]+\b/g);
  const issues = [];

  words.forEach(word => {
    // Check lengte (tel klanken, niet letters)
    const klankCount = countKlanken(word);
    if (klankCount > maxLetters) {
      issues.push({ word, issue: 'te_lang', klankCount });
    }

    // Check letters
    if (!usesOnlyAllowedLetters(word, selectedLetters)) {
      issues.push({ word, issue: 'verkeerde_letters' });
    }
  });

  return issues;
};

// Klanken tellen
const TWEEKLANKEN = ['aa', 'ee', 'oo', 'uu', 'ie', 'eu', 'oe', 'ei', 'ij', 'ou', 'au', 'ui', 'ch', 'sch', 'ng', 'nk'];

const countKlanken = (word) => {
  let count = 0;
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    // Check voor 3-letter klanken eerst (sch)
    if (i + 2 < lower.length && TWEEKLANKEN.includes(lower.slice(i, i + 3))) {
      count++;
      i += 3;
    }
    // Check voor 2-letter klanken
    else if (i + 1 < lower.length && TWEEKLANKEN.includes(lower.slice(i, i + 2))) {
      count++;
      i += 2;
    }
    // Enkele letter
    else {
      count++;
      i++;
    }
  }

  return count;
};
```

#### Stap 1.3: Nederlandse woordenlijst
- Gebruik OpenTaal woordenlijst (open source, ~400k woorden)
- Filter op korte woorden (max 6 klanken) voor performance
- Laad async bij app start

### Fase 2: Data & Storage

#### Stap 2.1: Supabase setup
```sql
-- Database schema
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  subject TEXT,
  names TEXT[],
  selected_letters TEXT[],
  focus_letters TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  word TEXT NOT NULL,
  times_seen INTEGER DEFAULT 1,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word)
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE user_settings (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  selected_letters TEXT[],
  max_letters_per_word INTEGER DEFAULT 4,
  preferred_theme TEXT DEFAULT 'default'
);
```

#### Stap 2.2: Storage abstractie (werkt offline én online)
```javascript
// storageService.js
class StorageService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.isOnline = navigator.onLine;
    this.pendingSync = [];
  }

  async saveStory(story) {
    // Altijd lokaal opslaan
    this.saveLocal('stories', story);

    // Als online en ingelogd, ook naar Supabase
    if (this.isOnline && this.supabase.auth.user()) {
      await this.supabase.from('stories').insert(story);
    } else {
      this.pendingSync.push({ type: 'story', data: story });
    }
  }

  // Sync wanneer weer online
  async syncPending() {
    for (const item of this.pendingSync) {
      await this.supabase.from(item.type).insert(item.data);
    }
    this.pendingSync = [];
  }
}
```

### Fase 3: Nieuwe Features

#### Stap 3.1: Verhalen bibliotheek
```jsx
// StoryLibrary.jsx
function StoryLibrary({ stories, onSelect, onDelete }) {
  return (
    <div className="story-library">
      <h2>📚 Jouw Verhalen</h2>
      <div className="story-grid">
        {stories.map(story => (
          <div key={story.id} className="story-card">
            <div className="story-preview">
              {story.content.slice(0, 100)}...
            </div>
            <div className="story-meta">
              <span>{story.subject}</span>
              <span>{formatDate(story.created_at)}</span>
            </div>
            <div className="story-actions">
              <button onClick={() => onSelect(story)}>📖 Lezen</button>
              <button onClick={() => onDelete(story.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Stap 3.2: Thema's/Templates
```javascript
const THEMES = {
  dieren: {
    name: '🐾 Dieren',
    subjects: ['een kat', 'een hond', 'op de boerderij', 'in de dierentuin'],
    suggestedNames: ['Pip', 'Lot', 'Bas']
  },
  seizoenen: {
    name: '🌸 Seizoenen',
    subjects: ['in de sneeuw', 'op het strand', 'in de herfst', 'in de lente'],
    suggestedNames: ['Eva', 'Tom', 'Mia']
  },
  avontuur: {
    name: '🏴‍☠️ Avontuur',
    subjects: ['de schat', 'in het bos', 'op reis', 'de held'],
    suggestedNames: ['Sam', 'Kim', 'Jan']
  },
  familie: {
    name: '👨‍👩‍👧 Familie',
    subjects: ['bij oma', 'papa en mama', 'met broer', 'met zus'],
    suggestedNames: ['Sem', 'Evi', 'Luc']
  },
  school: {
    name: '🏫 School',
    subjects: ['in de klas', 'op het plein', 'de juf', 'de meester'],
    suggestedNames: ['Fin', 'Lis', 'Max']
  }
};
```

#### Stap 3.3: Woordenschat tracker
```jsx
// WordTracker.jsx
function WordTracker({ learnedWords }) {
  const sortedWords = [...learnedWords].sort((a, b) => b.times_seen - a.times_seen);

  return (
    <div className="word-tracker">
      <h2>📝 Geleerde Woorden</h2>
      <p className="word-count">Je kent al {learnedWords.length} woorden!</p>

      <div className="word-categories">
        <div className="category new-words">
          <h3>🌟 Nieuw</h3>
          {sortedWords.filter(w => w.times_seen === 1).map(w => (
            <span key={w.word} className="word-chip new">{w.word}</span>
          ))}
        </div>

        <div className="category learning-words">
          <h3>📖 Aan het leren</h3>
          {sortedWords.filter(w => w.times_seen > 1 && w.times_seen < 5).map(w => (
            <span key={w.word} className="word-chip learning">{w.word}</span>
          ))}
        </div>

        <div className="category mastered-words">
          <h3>⭐ Geleerd!</h3>
          {sortedWords.filter(w => w.times_seen >= 5).map(w => (
            <span key={w.word} className="word-chip mastered">{w.word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Stap 3.4: Begripsvragen
```javascript
// Na het genereren van een verhaal, genereer ook vragen
const generateQuestions = async (story, apiKey) => {
  const prompt = `
    Gegeven dit verhaal voor groep 3:
    "${story}"

    Genereer 3 eenvoudige begripsvragen met multiple choice antwoorden.
    Formaat:
    [
      {
        "vraag": "Wie is in het verhaal?",
        "opties": ["een kat", "een hond", "een vis"],
        "correct": 0
      }
    ]

    Houd het simpel voor 6-7 jarigen.
  `;

  // API call...
  return questions;
};
```

#### Stap 3.5: Animaties (woord-voor-woord)
```jsx
// AnimatedStory.jsx
function AnimatedStory({ story, isAnimating }) {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = story.split(/\s+/);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setVisibleWords(v => {
          if (v >= words.length) {
            clearInterval(interval);
            return v;
          }
          return v + 1;
        });
      }, 300); // 300ms per woord

      return () => clearInterval(interval);
    } else {
      setVisibleWords(words.length);
    }
  }, [isAnimating, words.length]);

  return (
    <p className="animated-story">
      {words.slice(0, visibleWords).map((word, i) => (
        <span
          key={i}
          className="word-appear"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {word}{' '}
        </span>
      ))}
    </p>
  );
}
```

### Fase 4: Veilig Leren Lezen Integratie (Toekomstig)

#### Research nodig:
- Exacte lettervolgorde per kern
- Welke woorden per kern
- Structuur van de methode

#### Voorlopige structuur:
```javascript
const VEILIG_LEREN_LEZEN = {
  kern1: {
    naam: 'Kern 1',
    letters: ['m', 'r', 's', 'i', 'a', 'n'],
    structuurwoorden: ['ik', 'maan', 'roos', 'vis'],
    leeswoorden: ['aan', 'in', 'man', 'ris', 'sim']
  },
  kern2: {
    naam: 'Kern 2',
    letters: ['p', 'e', 'l', 'o', 't'],
    // etc...
  },
  // kern 3-12...
};
```

---

## Deployment Plan

### Stap 1: Vercel Setup
```bash
# In project directory
npm install -g vercel
vercel login
vercel
```

### Stap 2: Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Stap 3: Supabase Setup
1. Maak account op supabase.com
2. Nieuw project aanmaken
3. SQL schema uitvoeren
4. Row Level Security (RLS) instellen
5. Auth providers configureren (email, of magic link)

---

## Tijdsinschatting

| Fase | Onderdeel | Tijd |
|------|-----------|------|
| 1.1 | Focus letter bug | 15 min |
| 1.2 | Woord validatie | 45 min |
| 1.3 | Woordenlijst | 30 min |
| 2.1 | Supabase setup | 30 min |
| 2.2 | Storage service | 45 min |
| 3.1 | Verhalen bibliotheek | 1 uur |
| 3.2 | Thema's | 30 min |
| 3.3 | Woordenschat tracker | 1 uur |
| 3.4 | Begripsvragen | 45 min |
| 3.5 | Animaties | 30 min |
| 4 | Deployment | 30 min |

**Totaal: ~7 uur**

---

## Volgende stappen

1. ✅ Plan gemaakt
2. ⏳ Bugfixes implementeren (1.1, 1.2, 1.3)
3. ⏳ Validatie service bouwen
4. ⏳ UI refactoren naar componenten
5. ⏳ Supabase integratie
6. ⏳ Nieuwe features toevoegen
7. ⏳ Deploy naar Vercel

Wil je dat ik begin met de implementatie?
