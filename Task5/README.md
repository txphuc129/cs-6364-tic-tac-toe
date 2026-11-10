# Task 5: BxB Three-Machine Tic-Tac-Toe

## Rules and controls

- Select a board size `B` from 3 through 10 and a batch size `N` from 1 through 10.
- The three machines take turns as X, O, and #, starting with X.
- A machine wins by being first to place three of its marks in a contiguous horizontal, vertical, or diagonal line.
- A full board with no winner is a draw.
- For each win, the winning machine receives one win and each other machine receives one loss. Every machine receives one draw for a drawn game.

## Search and memory limits

The machines use depth-limited Max^n. At each search node, the player whose turn it is chooses the child with the highest score for that player's component. The heuristic scores unblocked three-cell winning lines using weights `[0, 1, 8, 64]` for zero through three marks; terminal wins and draws receive separate utilities.

Search uses depth-first recursion and iterative deepening, up to 8 plies. Each move has a node budget of `max(100, floor(20,000 / B^2))`. If the next depth cannot finish within that budget, the machine uses the move from its deepest fully completed iteration. The implementation does not store a full search tree or use a transposition table; only the board, current recursion path, and best completed move are retained.

This budget is a deliberate search limit, not a memory-shortage condition. If execution stops with an application-level error, the page reports the board size, three-player configuration, and game number. Browser/process termination from an actual memory shortage may prevent the page from reporting an error.

## Validation notes

Syntax was checked, and generated three-cell winning lines were verified for every board size from 3x3 through 10x10. One completed game was checked at 3x3 and 10x10, including the scoreboard totals. No memory-shortage stop was observed in those runs. The search budget can limit how deeply a large-board game is searched, but does not mean the game itself stopped.
