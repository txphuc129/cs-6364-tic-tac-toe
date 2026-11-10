# Task 5: BxB Three-Machine Tic-Tac-Toe

## Rules and controls

- Select a board size `B` from 3 through 10 and a batch size `N` from 1 through 10.
- The three machines take turns as X, O, and I, starting with X.
- A machine wins by placing B of its marks in one horizontal, vertical, or diagonal line.
- A full board with no winner is a draw.
- For each win, the winning machine receives one win and each other machine receives one loss. Every machine receives one draw for a drawn game.

## Search and memory limits

The machines use depth-limited Maxⁿ. At each search node, the player whose turn it is chooses the child with the highest score for that player's component. The heuristic scores unblocked winning lines by the number of marks they contain, using `4^(marks - 1)`; terminal wins and draws receive separate utilities.

Search uses depth-first recursion and iterative deepening, up to 8 plies. Each move has a node budget of `max(100, floor(20,000 / B²))`. If the next depth cannot finish within that budget, the machine uses the move from its deepest fully completed iteration. The implementation does not store a full search tree or use a transposition table; only the board, current recursion path, and best completed move are retained.

This budget is a deliberate search limit, not a memory-shortage condition. If execution stops with an application-level error, the page reports the board size, three-player configuration, and game number. Browser/process termination from an actual memory shortage may prevent the page from reporting an error.

## Validation notes

Validation completed for a 3×3 board with 10 games and for each size from 4×4 through 10×10 with 1 game. Generated cell counts and the invariant that each machine's wins + losses + draws equals the number of completed games were checked. No memory-shortage stop was observed in those runs. The search budget can limit how deeply a large-board game is searched, but does not mean the game itself stopped.
