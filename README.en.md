# MEOWVERSE 🐾

[繁體中文](README.md) · **English**

A free card-collecting game made from photos of our own cats. It runs in any browser, on phones and computers.

**[Play now →](https://yuzetsai.github.io/catcard/)**

## About

Turn everyday cat photos into a collectible card set: look after your cat, finish daily tasks to earn pack tickets, open packs to collect every cute moment, then form a team of three and fight in Meow Battle.

- **94 cards** in three series (VOL.01, VOL.02, VOL.03), with four rarities (N / R / SR / SSR) and secret cards (SEC).
- **Pure web game**: no backend, no accounts, no AI API calls, no paid draws.
- **Progress is stored in your own browser** and can be moved between devices with a save code.

## How to play

**Earn tickets**
- Finish the three daily tasks (feed and water, clean the litter box, play for 10 minutes) for 1 ticket each.
- Finish all three tasks for a bonus ticket and a growing care streak.
- Win the Fish Memory game, hit the cat toy 8 times in 10 seconds, or win a Meow Battle for 1 ticket each. These three share 3 rewards per day.
- Daily tasks reset at midnight Taiwan time (Asia/Taipei).

**Open packs and collect**
- One ticket opens one pack of 3 cards.
- Your album only shows cards you have found. Duplicates add to a counter, and every 5 spare copies can be traded for 1 ticket (one copy of each card is always kept).
- Achievement badges sit above the album. Each card has a one-line story, a type and skills, and cards you own can be shared.

**Meow Battle**
- Pick 3 cards in the Battle arena and take turns against the computer. Its team matches the rarity of yours.
- **Type triangle:** ⚡ Naughty beats 💤 Lazy, 💤 Lazy beats 💗 Cute, 💗 Cute beats ⚡ Naughty. An advantage deals ×1.5 damage and a disadvantage ×0.7, so low-rarity cards can still win.
- **Stats:** Mood (health), Cuteness (attack) and Fluff Shield (defense), set by rarity. A card whose mood hits zero simply "doesn't want to play any more".
- **Skills:** every card has *Meow Punch*, plus skills from its type's shared pool: 1 for N, 2 for R, 3 for SR and above. SSR and secret cards also have one exclusive skill ★.
- Skills can deal damage, heal, guard, weaken the opponent, charge up, drain mood, or ignore types and shields. Strong skills need a few turns of rest.
- **Friend battle:** copy your team code (like `MEOW-13-50-2-6`) or an invite link and send it to a friend. They paste the code or open the link to challenge your team, played by the computer. Friendly matches give no reward and no win count.

Everything runs in the browser. Clearing browser data clears progress, and each browser, device and domain keeps its own save. To switch devices, press **Copy save code** in the page footer and paste it with **Restore save** on the new device.

## Changelog

### v3.1 · Team codes (2026-10-26)
- Added team codes and invite links so friends can battle your team.
- Codes include a checksum; friendly matches give no tickets or wins, so they cannot be used to farm rewards.

### v3.0 · VOL.03 and Meow Battle (2026-10-26)
- Added **Meow Battle**: 3v3 turn-based fights, a three-way type triangle, a 30-skill shared pool, and exclusive skills for SSR and secret cards.
- Added 28 VOL.03 cards (#67–#94), 94 cards in total.
- Every card now has a type (Cute / Lazy / Naughty); the card detail shows type, stats and skills.
- Winning a battle earns a ticket, sharing the 3 daily rewards with the mini-games.
- Added the "First Victory" and "Cat Warrior" badges. Wins and team are saved; older saves keep working.

### v2.0 · VOL.02 and new features (2026-10-26)
- Added 26 VOL.02 cards (#41–#66) and a series label on each card.
- Added a one-line story for every card.
- Added save-code export and restore for moving progress between devices.
- Added card sharing, a daily mood and care streak, and a bonus ticket for finishing all three tasks.
- Added the cat-toy reaction game, sharing the 3 daily rewards with Fish Memory.
- Added duplicate-card trading and 8 achievement badges.
- Fixed the GitHub Pages setup; every push to `main` now publishes automatically.

### v1.0 · First release (2026-10-25)
- 40 VOL.01 cards: N, R, SR, SSR and secret cards.
- Daily tasks for tickets, the Fish Memory game, a pack-opening animation and an album.
- Progress stored in the browser, deployed on GitHub Pages.

## Run locally

Requires Python 3. From the project folder:

```sh
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000.

## Update and publish

The game source lives in `site/`. There is nothing to install or build.

For the first deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. After that, every push to `main` runs the checks and publishes to GitHub Pages.

```sh
node --check site/app.js
node --check site/battle.js
node scripts/validate.mjs
git add site README.md README.en.md scripts .github
git commit -m "Update cat cards"
git push origin main
```

### Adding cards

Put the image in `site/assets/` and add an entry to `site/cards.json`. Keep the `id` of existing cards so players' collections stay matched. The number of everyday cards is counted automatically.

| Field | Required | Notes |
|---|---|---|
| `id`, `name`, `rarity`, `image` | yes | Card number, name, rarity (N / R / SR / SSR / SEC), image under `assets/` |
| `type` | yes | Battle type: `萌` (Cute), `懶` (Lazy) or `皮` (Naughty) |
| `ex` | SSR and SEC | Exclusive skill, e.g. `{"n":"鼻尖碰碰","hit":18,"pierce":true}`; fields are described at the top of `site/battle.js` |
| `story` | optional | One-line story shown in the card detail |
| `series` | optional | The VOL number on the card face; defaults to VOL.01 |

`node scripts/validate.mjs` checks the required fields and that every image exists. A failing check stops the deployment.

## Project layout

- `site/index.html`: the game page
- `site/style.css`: styling and holographic card effects
- `site/app.js`: packs, tasks, mini-games, badges and saving
- `site/battle.js`: Meow Battle (skills, stats and battle flow)
- `site/cards.json`: card data
- `site/assets/`: cat photos
- `scripts/validate.mjs`: card and asset checks
- `.github/workflows/pages.yml`: automatic checks and publishing

## License

Released under the [MIT License](LICENSE).
