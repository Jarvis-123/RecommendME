# RecommendME 🎬

**Can't decide what to watch?** RecommendME is a standalone movie recommendation app that helps you pick the perfect film — whether you're eating dinner, on a date night, or just bored on a weekend.

## Features

### 5 Ways to Discover Movies

| Mode | Description |
|------|-------------|
| **Mood Match** | Interactive quiz — mood, occasion, who's watching, runtime |
| **AI Chat** | Natural language: *"Something funny for pizza night"* |
| **Voice** | Speak your request (Web Speech API, free in Chrome/Edge) |
| **Swipe Game** | Tinder-style movie picker to learn your taste |
| **Search & Browse** | Find any movie, browse trending & all genres |

### Streaming Availability

With **ReelDB** or **TMDB**, movie details show **where to watch** (Netflix, Prime Video, Disney+, etc.). With **OMDb**, streaming info isn't included — the app shows **"Currently not on any platform"** (you can add ReelDB later for streaming data).

### Free AI Integration

Uses **Google Gemini** (free tier) or **Groq** (free tier) for smart recommendations.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free movie API key (pick ONE — no TMDB required)

#### Option A: OMDb — easiest signup (recommended if TMDB won't work)

1. Go to **[omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)**
2. Enter your email
3. Select **FREE** (1,000 requests/day)
4. Check email → click verify link → copy your API key

#### Option B: ReelDB — best alternative (movies + streaming)

1. Go to **[reeldb.io](https://reeldb.io/)**
2. Get a free API key (Patreon signup — usually easier than TMDB)
3. Includes posters, ratings, **and streaming platform info**

#### Option C: TMDB (optional, if you get access later)

- [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 3. Get AI key (optional but recommended)

| Service | Sign up |
|---------|---------|
| [Google AI Studio](https://aistudio.google.com/apikey) | Free Gemini key |
| [Groq](https://console.groq.com/keys) | Free alternative |

### 4. Configure environment

```bash
cp .env.example .env.local
```

**Minimum setup (OMDb only):**

```env
OMDB_API_KEY=your_omdb_key_here
MOVIE_REGION=IN
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key_here
```

**Best setup (ReelDB — includes streaming):**

```env
REELDB_API_KEY=your_reeldb_key_here
MOVIE_REGION=IN
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key_here
```

Set `MOVIE_REGION` to your country code (`US`, `IN`, `GB`, etc.) for streaming data.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Movie Data Providers

The app auto-detects which API you've configured (`MOVIE_PROVIDER=auto`):

| Provider | Signup difficulty | Movies | Streaming | Free limit |
|----------|-------------------|--------|-----------|------------|
| **OMDb** | Easy (email only) | ✅ | ❌ | 1,000/day |
| **ReelDB** | Easy (Patreon) | ✅ | ✅ | Free tier |
| **TMDB** | Can be difficult | ✅ | ✅ | Generous |

Priority when `auto`: ReelDB → OMDb → TMDB

---

## Tech Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + Framer Motion for animations
- **OMDb / ReelDB / TMDB** — swappable movie data providers
- **Gemini / Groq** — free-tier AI recommendations
- **Web Speech API** — zero-cost voice input

---

## Monetization Roadmap

| Revenue Stream | Status | Implementation |
|----------------|--------|----------------|
| **Premium ($3.99/mo)** | UI ready | Unlimited AI chat, ad-free, multi-region, watchlists |
| **Display Ads** | Planned | AdSense on browse/detail pages |
| **Affiliate Links** | Planned | JustWatch Partner Program for streaming commissions |
| **Freemium Limits** | Planned | Free: 10 AI chats/day; Premium: unlimited |

---

## Project Structure

```
src/
├── app/api/          # Movie search, browse, recommendations
├── components/       # Mood quiz, chat, voice, swipe game
└── lib/
    ├── movies.ts     # Unified provider (auto-detects OMDb/ReelDB/TMDB)
    ├── omdb.ts       # OMDb API client
    ├── reeldb.ts     # ReelDB API client
    ├── tmdb.ts       # TMDB API client (optional)
    └── ai.ts         # Gemini/Groq integration
```

---

## Android App

**No Android Studio needed.** See **[ANDROID.md](./ANDROID.md)**.

| Method | Command |
|--------|---------|
| **Cloud build (easiest)** | GitHub → Actions → Build Android APK |
| **CLI build** | `npm run android:sdk-setup` then `npm run android:apk` |

---

## License

For personal/educational use. Commercial use may require licensing from your chosen data provider.
