//6 parts
window.onload = function () {
  //1. Initial states
  var players = ['X', 'O', 'I'];
  var boardSize = 3;
  var symbols = [];
  var cells = [];
  var winningLines = [];
  var turn = 0;
  var gameOver = false;
  var wins = {
    X: { wins: 0, losses: 0, draws: 0 },
    O: { wins: 0, losses: 0, draws: 0 },
    I: { wins: 0, losses: 0, draws: 0 },
  };
  var moveDelay = 120;

  var board = document.getElementById('tic');
  var boardSizeInput = document.getElementById('board-size');
  var gameCountInput = document.getElementById('game-count');
  var runButton = document.getElementById('run-games');
  var status = document.getElementById('status');
  var heading = document.getElementById('head');
  var xWinsOutput = document.getElementById('x-wins');
  var xLossesOutput = document.getElementById('x-losses');
  var xDrawsOutput = document.getElementById('x-draws');
  var oWinsOutput = document.getElementById('o-wins');
  var oLossesOutput = document.getElementById('o-losses');
  var oDrawsOutput = document.getElementById('o-draws');
  var iWinsOutput = document.getElementById('i-wins');
  var iLossesOutput = document.getElementById('i-losses');
  var iDrawsOutput = document.getElementById('i-draws');

  document.getElementById('game-form').addEventListener('submit', runGames);
  boardSizeInput.addEventListener('input', updateBoardSize);
  renderBoard(boardSize);

  //2. Generate B-in-a-row winning patterns and draw the selected board.
  function generateWinningLines(size) {
    var lines = [];
    for (var row = 0; row < size; row++) {
      var rowLine = [];
      var columnLine = [];
      for (var column = 0; column < size; column++) {
        rowLine.push(row * size + column);
        columnLine.push(column * size + row);
      }
      lines.push(rowLine, columnLine);
    }

    var diagonalDown = [];
    var diagonalUp = [];
    for (var index = 0; index < size; index++) {
      diagonalDown.push(index * size + index);
      diagonalUp.push(index * size + (size - index - 1));
    }
    lines.push(diagonalDown, diagonalUp);
    return lines;
  }

  function renderBoard(size) {
    boardSize = size;
    symbols = new Array(size * size).fill('');
    cells = [];
    winningLines = generateWinningLines(size);
    turn = 0;
    gameOver = false;
    heading.textContent = size + 'x' + size + ' Three-Machine Tic-Tac-Toe';
    board.style.setProperty('--board-size', size);
    board.setAttribute('aria-label', size + ' by ' + size + ' Tic-Tac-Toe board');
    board.replaceChildren();

    for (var index = 0; index < size * size; index++) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.disabled = true;
      cell.textContent = '';
      cell.setAttribute('aria-label', 'Cell ' + (index + 1) + ', empty');
      cell.style.fontSize = Math.min(56, Math.floor(460 / size)) + 'px';
      cells.push(cell);
      board.appendChild(cell);
    }
  }

  function updateBoardSize() {
    var selectedSize = boardSizeInput.valueAsNumber;
    if (
      Number.isInteger(selectedSize) &&
      selectedSize >= 3 &&
      selectedSize <= 10 &&
      selectedSize !== boardSize
    ) {
      renderBoard(selectedSize);
      wins = {
        X: { wins: 0, losses: 0, draws: 0 },
        O: { wins: 0, losses: 0, draws: 0 },
        I: { wins: 0, losses: 0, draws: 0 },
      };
      updateResults();
      status.textContent =
        'Board updated to ' + boardSize + 'x' + boardSize + '. Select Run games to play.';
    }
  }

  //3. Check for a win and find empty cells on the current board.
  function winnerCheck(currentSymbols, player) {
    return winningLines.some(function (line) {
      return line.every(function (cellIndex) {
        return currentSymbols[cellIndex] === player;
      });
    });
  }

  function emptyBoxes(currentSymbols) {
    var empty = [];
    for (var index = 0; index < currentSymbols.length; index++) {
      if (currentSymbols[index] === '') {
        empty.push(index);
      }
    }
    return empty;
  }

  //4. Evaluate the board for each machine and return potential win scores.
  function evaluateBoard(currentSymbols) {
    var scores = [0, 0, 0];
    for (var i = 0; i < winningLines.length; i++) {
      var line = winningLines[i];
      var linePlayer = -1;
      var markCount = 0;
      var blocked = false;

      for (var j = 0; j < line.length; j++) {
        var markOwner = players.indexOf(currentSymbols[line[j]]);
        if (markOwner !== -1) {
          if (linePlayer !== -1 && linePlayer !== markOwner) {
            blocked = true;
            break;
          }
          linePlayer = markOwner;
          markCount++;
        }
      }

      if (!blocked && linePlayer !== -1) {
        scores[linePlayer] += Math.pow(4, markCount - 1);
      }
    }
    return scores;
  }

  //5. Let each machine play using multi-player minimax.
  function playMachineMove(playerIndex) {
    var nextMove = chooseMove(playerIndex);
    if (!nextMove || !Number.isInteger(nextMove.id) || symbols[nextMove.id] !== '') {
      throw new Error('The machine player did not return a valid move.');
    }

    var player = players[playerIndex];
    symbols[nextMove.id] = player;
    cells[nextMove.id].textContent = player;
    cells[nextMove.id].setAttribute('aria-label', 'Cell ' + (nextMove.id + 1) + ', ' + player);
    cells[nextMove.id].classList.add('mark-player-' + playerIndex);
    turn++;
  }

  //Minimax function for three players (Max^n) with a node budget.
  function miniMax(currentSymbols, playerIndex, depth, search) {
    //Stop this search iteration before it exceeds the node budget.
    if (search.nodes >= search.nodeBudget) {
      search.stopped = true;
      return null;
    }
    search.nodes++;

    for (var player = 0; player < players.length; player++) {
      if (winnerCheck(currentSymbols, players[player])) {
        var terminalScore = [-1000000000, -1000000000, -1000000000];
        terminalScore[player] = 1000000000;
        return { scores: terminalScore };
      }
    }

    var empty = emptyBoxes(currentSymbols);
    if (empty.length === 0) {
      return { scores: [0, 0, 0] };
    }
    if (depth === 0) {
      return { scores: evaluateBoard(currentSymbols) };
    }

    var bestMove;
    var nextPlayer = (playerIndex + 1) % players.length;
    for (var i = 0; i < empty.length; i++) {
      var move = empty[i];
      currentSymbols[move] = players[playerIndex];
      var childResult = miniMax(currentSymbols, nextPlayer, depth - 1, search);
      currentSymbols[move] = '';

      if (search.stopped) {
        return null;
      }
      if (!bestMove || childResult.scores[playerIndex] > bestMove.scores[playerIndex]) {
        bestMove = { id: move, scores: childResult.scores };
      }
    }
    return bestMove;
  }

  function chooseMove(playerIndex) {
    var bestCompletedMove;
    var search = {
      nodes: 0,
      nodeBudget: Math.max(100, Math.floor(20000 / symbols.length)),
      stopped: false,
    };
    var maximumDepth = Math.min(8, emptyBoxes(symbols).length);

    //Keep the best move from the deepest iteration that completed in budget.
    for (var depth = 1; depth <= maximumDepth; depth++) {
      var result = miniMax(symbols, playerIndex, depth, search);
      if (search.stopped) {
        break;
      }
      bestCompletedMove = result;
    }

    if (!bestCompletedMove) {
      throw new Error('The search budget was too small to select a move.');
    }
    return bestCompletedMove;
  }

  function clearBoard() {
    symbols = new Array(boardSize * boardSize).fill('');
    turn = 0;
    gameOver = false;
    for (var index = 0; index < cells.length; index++) {
      cells[index].textContent = '';
      cells[index].setAttribute('aria-label', 'Cell ' + (index + 1) + ', empty');
      cells[index].className = 'cell';
    }
  }

  //6. Track results and play the requested batch of games.
  function updateResults() {
    xWinsOutput.value = wins.X.wins;
    xLossesOutput.value = wins.X.losses;
    xDrawsOutput.value = wins.X.draws;
    oWinsOutput.value = wins.O.wins;
    oLossesOutput.value = wins.O.losses;
    oDrawsOutput.value = wins.O.draws;
    iWinsOutput.value = wins.I.wins;
    iLossesOutput.value = wins.I.losses;
    iDrawsOutput.value = wins.I.draws;
  }

  function recordWin(winnerSymbol) {
    for (var i = 0; i < players.length; i++) {
      if (players[i] === winnerSymbol) {
        wins[winnerSymbol].wins++;
      } else {
        wins[players[i]].losses++;
      }
    }
  }

  function recordDraw() {
    for (var i = 0; i < players.length; i++) {
      wins[players[i]].draws++;
    }
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  async function playGame(gameNumber, totalGames) {
    clearBoard();
    while (!gameOver) {
      var playerIndex = turn % players.length;
      var player = players[playerIndex];
      status.textContent =
        'Game ' +
        gameNumber +
        ' of ' +
        totalGames +
        ' on a ' +
        boardSize +
        'x' +
        boardSize +
        ' board: Machine ' +
        player +
        ' is choosing a move.';
      playMachineMove(playerIndex);
      await delay(moveDelay);

      if (winnerCheck(symbols, player)) {
        recordWin(player);
        gameOver = true;
        status.textContent =
          'Game ' + gameNumber + ' of ' + totalGames + ': Machine ' + player + ' won.';
      } else if (turn >= symbols.length) {
        recordDraw();
        gameOver = true;
        status.textContent = 'Game ' + gameNumber + ' of ' + totalGames + ': draw.';
      }
    }
    updateResults();
  }

  async function runGames(event) {
    event.preventDefault();
    var selectedSize = boardSizeInput.valueAsNumber;
    var gameCount = gameCountInput.valueAsNumber;
    if (!Number.isInteger(selectedSize) || selectedSize < 3 || selectedSize > 10) {
      status.textContent = 'Enter a whole board size from 3 through 10.';
      boardSizeInput.focus();
      return;
    }
    if (!Number.isInteger(gameCount) || gameCount < 1 || gameCount > 10) {
      status.textContent = 'Enter a whole number of games from 1 through 10.';
      gameCountInput.focus();
      return;
    }

    runButton.disabled = true;
    boardSizeInput.disabled = true;
    gameCountInput.disabled = true;
    var activeGame = 0;
    renderBoard(selectedSize);
    wins = {
      X: { wins: 0, losses: 0, draws: 0 },
      O: { wins: 0, losses: 0, draws: 0 },
      I: { wins: 0, losses: 0, draws: 0 },
    };
    updateResults();

    try {
      for (var gameNumber = 1; gameNumber <= gameCount; gameNumber++) {
        activeGame = gameNumber;
        await playGame(gameNumber, gameCount);
        await delay(moveDelay);
      }
      status.textContent =
        'Completed ' +
        gameCount +
        ' games on a ' +
        boardSize +
        'x' +
        boardSize +
        ' board. X: ' +
        wins.X.wins +
        ' wins, ' +
        wins.X.losses +
        ' losses, ' +
        wins.X.draws +
        ' draws. O: ' +
        wins.O.wins +
        ' wins, ' +
        wins.O.losses +
        ' losses, ' +
        wins.O.draws +
        ' draws. I: ' +
        wins.I.wins +
        ' wins, ' +
        wins.I.losses +
        ' losses, ' +
        wins.I.draws +
        ' draws.';
    } catch (error) {
      console.error(error);
      status.textContent =
        'Stopped on a ' +
        boardSize +
        'x' +
        boardSize +
        ' board with ' +
        players.length +
        ' players during game ' +
        activeGame +
        ': ' +
        error.message;
    } finally {
      runButton.disabled = false;
      boardSizeInput.disabled = false;
      gameCountInput.disabled = false;
    }
  }
};
