# CatLearner 🐾

Vietnamese language + typing app for kids aged 6–14.

## Quick Start

```bash
cp .env.example .env          # add your GEMINI_API_KEY
npm install                    # install all workspace dependencies
npm -w client run dev          # http://localhost:5173
npm -w server run dev          # http://localhost:3001
```

## Modules

| Tab | Feature |
|-----|---------|
| 📖 Bảng chữ | Vietnamese 29-letter alphabet grid |
| ⌨️ Gõ phím | Type 50 sight words — character-by-character with Telex/VNI support |
| ✍️ Viết văn | Free-write Vietnamese, get AI encouragement from "Miu" |

## Typing Modes

- **Direct** — use your OS Vietnamese IME (Unikey, Google Input Tools)
- **Telex** — `aa`→â, `aw`→ă, `ow`→ơ, `uw`→ư, `ee`→ê, `oo`→ô, `dd`→đ; tones: `s f r x j`
- **VNI** — `a6`→â, `a8`→ă, `o7`→ơ, `u7`→ư, `e6`→ê, `o6`→ô, `d9`→đ; tones: `1 2 3 4 5`

## Running Tests

```bash
npm -w client run test         # Vitest — TypingEngine, data, hooks (45 tests)
npm -w server run test         # Vitest — tutor API validation (3 tests)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes (Story Studio) | Google AI Studio API key |
| `PORT` | No (default 3001) | Server port |
| `ALLOWED_ORIGIN` | No (default `http://localhost:5173`) | CORS origin |

## Tech Stack

- React 18 + Vite + TailwindCSS 3 (client)
- Express 4 + `@google/generative-ai` (server)
- Vitest (all tests)
- `Intl.Segmenter` for Vietnamese grapheme splitting

## Repository

- **Local**: `side-projects/cat-learner/`
- **GitHub**: [fafilmvn-de/cat-learner](https://github.com/fafilmvn-de/cat-learner)
