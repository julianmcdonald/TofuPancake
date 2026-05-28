import { pool } from '../../db';
import { gameLength } from '../gameConfig';

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Generate random text for players to type from PostgreSQL.
 * @returns Random text for players to type.
 */
export async function getRandomText() {
  // Query a random prose row from PostgreSQL
  const res = await pool.query('SELECT * FROM prose ORDER BY RANDOM() LIMIT 1');
  
  if (res.rows.length === 0) {
    // Return a fallback paragraph if database is somehow not seeded yet
    return [
      "The quick brown fox jumps over the lazy dog.",
      "Typing quickly and accurately is an essential skill for modern developers.",
      "Practice makes perfect when it comes to speed and consistency in typing."
    ];
  }

  const text = res.rows[0];
  const sentences = text.sentences;

  // gets a random index sentence, this will act as the anchor for sentence selection
  let firstSentenceIndex = randomInt(sentences.length);
  const gameText = [sentences[firstSentenceIndex]];
  let lastSentenceIndex = firstSentenceIndex;

  // final length of text to type will always be at least the specified gameLength
  while (gameText.join(' ').length < gameLength) {
    if (lastSentenceIndex + 1 >= sentences.length) {
      // if sentence index overflows, start picking from before firstSentenceIndex
      firstSentenceIndex -= 1;
      // if index is less than zero, then all text in file has been selected
      if (firstSentenceIndex < 0) {
        return gameText;
      }
      gameText.unshift(sentences[firstSentenceIndex]);
    } else {
      lastSentenceIndex += 1;
      gameText.push(sentences[lastSentenceIndex]);
    }
  }
  return gameText;
}
