# Task 5: BxB Three-Machine Tic-Tac-Toe

## Rules and controls

- Select a board size `B` from 3 through 6 and a number of games `N` from 1 through 10.
- The three machines take turns as X, O, and #, starting with X.
- A machine wins by being the first to place three of its marks in a contiguous horizontal, vertical, or diagonal line.
- A full board with no winner is a draw.
- For each win, the winning machine receives one win, and each other machine receives one loss. Every machine receives one draw for a drawn game.
- The board is generated dynamically based on the selected size. The results table displays the wins, losses, and draws for all three machines.

## Search and memory limits

The machines use depth-limited multi-player Minimax (Max^n). At each search node, the player whose turn it is selects the move that maximizes that player's own score.

The heuristic evaluates unblocked three-cell winning lines using weights `[0, 1, 8, 64]` for zero through three marks. Terminal wins receive a score of `1000000000` for the winner and `-1000000000` for the other players. Draws receive `[0, 0, 0]`.

Search uses depth-first recursion with iterative deepening, up to 8 moves ahead. Each search iteration has a node budget of `max(100, floor(20000 / (B * B)))`. If a deeper search cannot finish within that budget, the machine uses the move from its deepest fully completed iteration. When multiple moves have the same best score, one is selected randomly.

If no search iteration completes, the machine selects a random legal move. The implementation does not store a full search tree or use a transposition table. It maintains the current board, recursive search information, and the best move from the deepest completed iteration.

The node budget limits the number of states explored to reduce resource usage on larger boards. Reaching the budget stops the current search iteration, not the game itself.

If an application-level error occurs, the page displays an error message. An actual browser or process termination caused by memory exhaustion may prevent the page from displaying an error.

## Validation notes

The JavaScript generates winning lines for horizontal, vertical, and diagonal sequences of three cells on boards of different sizes.

The implementation validates board sizes from 3 through 6 and game counts from 1 through 10. Each game ends when a machine wins or the board is full. The results table is updated after every game.

The Minimax search uses a node budget to limit the number of explored states. If the budget is reached, the game continues using the best move from a completed search iteration or a random legal move if no iteration completed.

Full browser gameplay and memory exhaustion testing have not been independently verified.