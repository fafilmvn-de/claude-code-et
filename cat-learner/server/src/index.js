import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import tutorRouter from './routes/tutor.js';

const app = express();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/tutor', tutorRouter);

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`CatLearner server on :${PORT}`));
}

export default app; // for tests
