# Learning Arcade

Free browser games that turn practice into play: touch typing, math facts, spelling and geography.
No sign-up, no ads, no tracking. Every game runs in any modern browser, and the ones in this repo are a single HTML file each.

![The Learning Arcade hub](docs/screenshots/hub.png)

## Games

| Game | What it practices | Ages | Controls |
|---|---|---|---|
| [Plumber Typing](plumber-typing.html) **(new)** | Touch typing, one keyboard row at a time | 7+ | Keyboard |
| [MathMan](mathman.html) **(new)** | + &minus; &times; &divide; facts inside a maze-chase game | 6+ | Keyboard, swipe or D-pad |
| [Math Quest Runner](https://github.com/Zaarnno-Dev-Hub-dot/math-quest-runner) **(new)** | Math facts and fractions in a jungle platformer, grades 1-5 (lives in its own repository) | 6+ | Keyboard or touch |
| [Math Blaster](math-blaster.html) | Quick arithmetic with falling answer blocks | 6+ | Keyboard, mouse or touch |
| [Spelling Bee](spelling-bee.html) | Spelling: see it, hear it, clues, speed rounds, jumbles | 7+ | Keyboard or on-screen keyboard |
| [GeoQuest](geoquest.html) | Countries, capitals, landmarks and flags on a world map | 8+ | Mouse or touch, plus keyboard |

### Plumber Typing

![Plumber Typing](docs/screenshots/plumber-typing.png)

Help Pip the plumber clear clogged pipes by typing the word on each clog before it reaches him.

- **12 levels in 4 worlds** (Kitchen Sink, Bathroom Pipes, Basement Boiler, Sewer Depths). Each level teaches
  a few new keys and only uses keys you have already learned: home row, then the top row, then the bottom row,
  then speed and long words.
- **On-screen keyboard** lights up the next key in the color of the finger that should press it.
- **Boss every third level.** Each word you finish knocks the boss back.
- **FLUSH meter** fills with every word typed without a mistake. When it is full, press Enter to wash every clog away.
- Words per minute, accuracy, streaks, 1 to 3 stars per level, and saved progress. Speed setting for younger players.

![Plumber Typing boss level](docs/screenshots/plumber-typing-boss.png)

### MathMan

![MathMan power-orb question](docs/screenshots/mathman-quiz.png)

Race through the maze eating dots while four Glitches chase you. Eat a glowing **?** orb and the game pauses
for a math problem:

- **Right answer:** power mode. The Glitches turn blue and you can catch them for bonus points.
- **Wrong answer or time runs out:** you see the correct answer, and the Glitches speed up for a few seconds.
- **Bonus calculators** appear during each maze. Solve their problem to win Freeze, Speed Boots or an extra life.
- Choose **+, &minus;, &times;, &divide; or Mix**, and **Easy** (within 10, tables to 5), **Medium** (within 20,
  tables to 10) or **Hard** (two-digit numbers, tables to 12). Best score is saved for each choice.

![MathMan in power mode](docs/screenshots/mathman.png)

### Progress page and parent/teacher guide

- [My Progress](progress.html) shows stars and best scores from every game in one place, read from what each game saves on this device. Math Quest Runner lives on a different website, so its stars stay there.
- [For parents and teachers](teachers.html) has an ages / grades / what-it-teaches table and prints as a single page.

### Math Blaster, Spelling Bee and GeoQuest

| Math Blaster | Spelling Bee | GeoQuest |
|---|---|---|
| ![Math Blaster](docs/screenshots/math-blaster.png) | ![Spelling Bee](docs/screenshots/spelling-bee.png) | ![GeoQuest](docs/screenshots/geoquest.png) |

Math Blaster and Spelling Bee have a sound button, saved best scores per mode, and touch support (tap a falling block; an on-screen keyboard appears on touch screens). Math Blaster's wrong answers are close to the right one, and Spelling Bee shows the correct spelling after a miss.

## Play locally

```bash
git clone https://github.com/Zaarnno-Dev-Hub-dot/zaarno-learning-arcade.git
cd zaarno-learning-arcade
python -m http.server 8000
```

Then open http://localhost:8000. You can also double-click any `.html` file to open it directly in a browser.

## Privacy

The games make no network requests and use no accounts, cookies, analytics or third-party scripts.
Scores and progress are stored only in your browser's `localStorage`. The progress page reads these keys: `plumberTyping.v1`, `mathman.v1`, `mathBlaster.v1`, `spellingBee.v1` and `gq_highScore` (plus the older `mb_highScore` and `sb_highScore`).

## For developers

- Each game is one self-contained file: inline CSS and JavaScript, art drawn in code, sound from the Web Audio API.
- `plumber-typing.html?debug` and `mathman.html?debug` expose a small `window.__plumber` / `window.__mathman`
  object for automated play-testing.
- `node tools/capture-screenshots.mjs` regenerates everything in `docs/screenshots/` with headless Chrome or Edge
  (Node 22+, no npm install needed). Serve the folder on port 8765 first:
  `python -m http.server 8765 --bind 127.0.0.1`.

## License

MIT. See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).