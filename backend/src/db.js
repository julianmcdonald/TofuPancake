import { Pool } from 'pg';
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function initDb() {
  console.log('Initializing Neon PostgreSQL database tables...');
  
  const client = await pool.connect();
  try {
    // 1. Create players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) UNIQUE,
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create player_games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_games (
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        text_typed TEXT,
        wpm DOUBLE PRECISION,
        PRIMARY KEY (player_id, game_id)
      );
    `);

    // 4. Create prose table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prose (
        id SERIAL PRIMARY KEY,
        link TEXT,
        sentences TEXT[]
      );
    `);

    // Seed prose table if empty
    const proseCountRes = await client.query('SELECT COUNT(*) FROM prose');
    const proseCount = parseInt(proseCountRes.rows[0].count, 10);
    if (proseCount === 0) {
      console.log('Seeding initial type-racer prose paragraphs...');
      const seedTexts = [
        {
          link: 'https://raw.githubusercontent.com/formcept/whiteboard/master/nbviewer/notebooks/data/harrypotter/Book%201%20-%20The%20Philosopher\'s%20Stone.txt',
          sentences: [
            "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much.",
            "They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.",
            "Mr. Dursley was the director of a firm called Grunnings, which made drills.",
            "He was a big, beefy man with hardly any neck, although he did have a very large mustache.",
            "Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.",
            "The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere.",
            "The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it.",
            "They didn't think they could bear it if anyone found out about the Potters.",
            "Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be."
          ]
        },
        {
          link: 'https://raw.githubusercontent.com/formcept/whiteboard/master/nbviewer/notebooks/data/harrypotter/Book%202%20-%20The%20Chamber%20of%20Secrets.txt',
          sentences: [
            "Not for the first time, an argument had broken out over breakfast at number four, Privet Drive.",
            "Mr. Vernon Dursley had been woken in the early hours of the morning by a loud, hooting noise from his nephew Harry's room.",
            "Third time this week! he roared across the table.",
            "If you can't control that owl, it'll have to go!",
            "Harry tried, yet again, to explain.",
            "She's bored, he said.",
            "She's used to flying around outside. If I could just let her out at night...",
            "Do I look stupid? snarled Uncle Vernon, a speck of fried egg dangling from his bushy mustache.",
            "I know what'll happen if that owl's let out."
          ]
        }
      ];

      for (const text of seedTexts) {
        await client.query(
          'INSERT INTO prose (link, sentences) VALUES ($1, $2)',
          [text.link, text.sentences]
        );
      }
      console.log('Seeding completed successfully!');
    }

    console.log('Neon PostgreSQL initialization successful.');
  } catch (err) {
    console.error('Error initializing PostgreSQL database:', err);
    throw err;
  } finally {
    client.release();
  }
}
