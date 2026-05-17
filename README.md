# MemoryScrambleGame

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
# memory-scramble-game
Premium Memory Scramble Game built with Angular and TypeScript featuring dynamic board generation, responsive modern UI, smooth animations, immersive sound effects, customizable card themes, countdown timer, moves counter, restart system, and high score tracking for an engaging real-game experience.

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
