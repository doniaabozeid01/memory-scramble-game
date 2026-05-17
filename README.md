# Memory Scramble Game

Memory Scramble Game is an interactive card matching game built with Angular and TypeScript.  
The player flips face-down cards and tries to find all matching pairs before the countdown timer ends.

## Project Features

- Dynamic board size configuration using rows and columns.
- Board size must be even.
- Maximum board size is 36 cells.
- Random image distribution on the game board.
- Each image is duplicated to create a matching pair.
- Multiple image categories:
  - Football players
  - Animals
  - Cartoon characters
- Countdown timer mode.
- Unlimited time mode.
- Game over message when the timer reaches zero.
- Win message when all pairs are matched.
- Moves counter.
- Restart game button.
- High score tracking.
- Light mode and dark mode.
- Smooth card flip animations.
- Sound effects.
- Responsive design for different screen sizes.
- Modern gaming UI.

## Game Rules

1. The player selects the number of rows, columns, image category, and game time.
2. The total number of cells must be even.
3. The game generates half the number of cells as unique images.
4. Each selected image is duplicated to create pairs.
5. The images are shuffled randomly across the board.
6. The player flips two cards each turn.
7. If the two cards match, they remain open.
8. If they do not match, they flip back again.
9. The game ends when all cards are matched or when the timer reaches zero.
10. If unlimited mode is selected, the game continues until all pairs are matched.

## Technologies Used

- Angular
- TypeScript
- HTML
- SCSS
- Bootstrap
- LocalStorage

## Installation

Clone the repository:

```bash
git clone https://github.com/doniaabozeid01/memory-scramble-game.git
