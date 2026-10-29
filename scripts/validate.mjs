import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
const site = path.resolve(import.meta.dirname, '../site');
const cards = JSON.parse(await readFile(path.join(site, 'cards.json'), 'utf8'));
assert(Array.isArray(cards) && cards.length > 0, 'Card pool must not be empty');
const ids = new Set();
const rarities = new Set(['N', 'R', 'SR', 'SSR', 'SEC']);
for (const card of cards) {
  assert(Number.isSafeInteger(card.id) && card.id > 0 && !ids.has(card.id), 'Card IDs must be unique positive integers');
  ids.add(card.id);
  assert(typeof card.name === 'string' && card.name.length > 0, 'Card needs a title');
  assert(rarities.has(card.rarity), 'Unknown rarity');
  assert(typeof card.image === 'string' && card.image.startsWith('assets/'), 'Use local card images');
  assert(!card.image.includes('..'), 'Image must remain inside assets');
  if (card.base) assert(rarities.has(card.base), `Card ${card.id} has an unknown base rarity`);
  assert(['萌', '懶', '皮'].includes(card.type), `Card ${card.id} needs a type (萌/懶/皮)`);
  if (card.rarity === 'SSR' || card.rarity === 'SEC') assert(card.ex && typeof card.ex.n === 'string', `Card ${card.id} needs an exclusive skill (ex)`);
  await access(path.join(site, card.image));
}
for (const tier of rarities) assert(cards.some(card => card.rarity === tier), `Missing ${tier} card pool`);
const html = await readFile(path.join(site, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const url = match[1].split('?')[0];
  if (/^(https?:|data:)/.test(url)) continue;
  assert(!url.startsWith('/'), 'Use relative paths so /catcard/ works');
  await access(path.join(site, url));
}
console.log(`Validated ${cards.length} cards, all rarity pools, images and page asset paths.`);
