//6 parts
window.onload = function () {
  //1. Initial states
  var num;
  var box;
  var ctx;
  var turn = 0;
  var filled;
  var symbol;
  var winner;
  var gameOver = false;
  var players = ['X', 'O', '#'];
  var boardSize = 3;
  var wins = {
    X: { wins: 0, losses: 0, draws: 0 },
    O: { wins: 0, losses: 0, draws: 0 },
    '#': { wins: 0, losses: 0, draws: 0 },
  };
  var moveDelay = 120;
  filled = new Array();
  symbol = new Array();
  winner = generateWinningLines(boardSize, 3);

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
  var hashWinsOutput = document.getElementById('hash-wins');
  var hashLossesOutput = document.getElementById('hash-losses');
  var hashDrawsOutput = document.getElementById('hash-draws');

  boardSizeInput.min = 3;
  boardSizeInput.max = 6;
  document.getElementById('game-form').addEventListener('submit', runGames);
  boardSizeInput.addEventListener('input', updateBoardSize);
  renderBoard(boardSize);

  //2.Drawing X's, O's, and #'s
  //Draw X
  function drawX() {
    box.style.backgroundColor = '#fb5181';
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(85, 85);
    ctx.moveTo(85, 15);
    ctx.lineTo(15, 85);
    ctx.lineWidth = 21;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    symbol[num - 1] = players[0];
  }

  //Drawing O
  function drawO(next) {
    box.style.backgroundColor = '#93f273';
    ctx.beginPath();
    ctx.arc(50, 50, 35, 0, 2 * Math.PI);
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    symbol[next] = players[1];
  }

  //Drawing #
  function drawHash(next) {
    box.style.backgroundColor = '#8cc8ff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText('#', 50, 50);

    symbol[next] = players[2];
  }

  function generateWinningLines(size, length) {
    var lines = [];
    for (var row = 0; row < size; row++) {
      for (var startColumn = 0; startColumn <= size - length; startColumn++) {
        var horizontal = [];
        var vertical = [];
        for (var offset = 0; offset < length; offset++) {
          horizontal.push(row * size + startColumn + offset);
          vertical.push((startColumn + offset) * size + row);
        }
        lines.push(horizontal, vertical);
      }
    }

    for (var startRow = 0; startRow <= size - length; startRow++) {
      for (var startColumn = 0; startColumn <= size - length; startColumn++) {
        var diagonalDown = [];
        for (var offset = 0; offset < length; offset++) {
          diagonalDown.push((startRow + offset) * size + startColumn + offset);
        }
        lines.push(diagonalDown);
      }
      for (var rightColumn = length - 1; rightColumn < size; rightColumn++) {
        var diagonalUpRight = [];
        for (var offset = 0; offset < length; offset++) {
          diagonalUpRight.push((startRow + offset) * size + rightColumn - offset);
        }
        lines.push(diagonalUpRight);
      }
    }
    return lines;
  }

  //Generate the board based on the selected size
  function renderBoard(size) {
    boardSize = size;
    filled = new Array();
    symbol = new Array();
    winner = generateWinningLines(size, 3);
    turn = 0;
    gameOver = false;

    heading.textContent = size + 'x' + size + ' Three-Machine Tic-Tac-Toe';
    board.style.setProperty('--board-size', size);
    board.setAttribute('aria-label', size + ' by ' + size + ' Tic-Tac-Toe board');
    board.replaceChildren();

    for (var i = 0; i < size * size; i++) {
      filled[i] = false;
      symbol[i] = '';

      var cell = document.createElement('canvas');
      cell.id = 'canvas' + (i + 1);
      cell.width = 100;
      cell.height = 100;
      cell.className = 'cell';
      cell.setAttribute('aria-label', 'Cell ' + (i + 1) + ', empty');
      board.appendChild(cell);
    }
  }

  function updateBoardSize() {
    var selectedSize = boardSizeInput.valueAsNumber;
    if (
      Number.isInteger(selectedSize) &&
      selectedSize >= 3 &&
      selectedSize <= 6 &&
      selectedSize !== boardSize
    ) {
      renderBoard(selectedSize);
      wins = {
        X: { wins: 0, losses: 0, draws: 0 },
        O: { wins: 0, losses: 0, draws: 0 },
        '#': { wins: 0, losses: 0, draws: 0 },
      };
      updateResults();
      status.textContent =
        'Board updated to ' + boardSize + 'x' + boardSize + '. Select Run games to play.';
    }
  }

  //3.Winner check function
  function winnerCheck(symbol, player) {
    for (var j = 0; j < winner.length; j++) {
      if (
        symbol[winner[j][0]] == player &&
        symbol[winner[j][1]] == player &&
        symbol[winner[j][2]] == player
      ) {
        return true;
      }
    }
    return false;
  }

  //4. Find the empty boxes
  function emptyBoxes(newSymbol) {
    var j = 0;
    var empty = [];
    for (var i = 0; i < newSymbol.length; i++) {
      if (players.indexOf(newSymbol[i]) === -1) {
        empty[j] = i;
        j++;
      }
    }
    return empty;
  }

  //5. Let each machine play using multi-player minimax
  function playMachineMove(playerIndex) {
    var nextMove = chooseMove(playerIndex);
    if (!nextMove || !Number.isInteger(nextMove.id) || filled[nextMove.id]) {
      throw new Error('The machine player did not return a valid move.');
    }

    num = nextMove.id + 1;
    box = document.getElementById('canvas' + num);
    ctx = box.getContext('2d');
    if (playerIndex === 0) {
      drawX();
    } else if (playerIndex === 1) {
      drawO(nextMove.id);
    } else {
      drawHash(nextMove.id);
    }
    filled[nextMove.id] = true;
    box.setAttribute('aria-label', 'Cell ' + num + ', ' + players[playerIndex]);
    turn++;
  }

  
  //Minimax function for three players (Max^n) with a node budget
  function miniMax(newSymbol, playerIndex, depth, randomize, search) {
    //Stop the search if the node budget has been reached
    if (search.nodes >= search.nodeBudget) {
      search.stopped = true;
      return null;
    }
    search.nodes++;

    var result = {};
    var empty = [];
    empty = emptyBoxes(newSymbol);

    for (var player = 0; player < players.length; player++) {
      if (winnerCheck(newSymbol, players[player])) {
        var terminalScore = [-1000000000, -1000000000, -1000000000];
        terminalScore[player] = 1000000000;
        return { scores: terminalScore };
      }
    }

    if (empty.length === 0) {
      return { scores: [0, 0, 0] };
    }

    if (depth === 0) {
      return { scores: evaluateBoard(newSymbol) };
    }

    var posMoves = [];
    for (var i = 0; i < empty.length; i++) {
      var curMove = {};
      //generate the new board with the current move
      curMove.id = empty[i];
      newSymbol[empty[i]] = players[playerIndex];

      var nextPlayer = (playerIndex + 1) % players.length;
      result = miniMax(newSymbol, nextPlayer, depth - 1, false, search);

      newSymbol[empty[i]] = '';

      if (search.stopped) {
        return null;
      }

      curMove.scores = result.scores;
      posMoves.push(curMove);
    }

    //Calculate score of intermediate states - best move + score with respect to that player + return statement
    var bestMoves = [];
    //Each player maximizes their own score
    var highestScore = -Infinity;

    for (var j = 0; j < posMoves.length; j++) {
      if (posMoves[j].scores[playerIndex] > highestScore) {
        highestScore = posMoves[j].scores[playerIndex];
        bestMoves = [j];
      } else if (posMoves[j].scores[playerIndex] === highestScore) {
        bestMoves.push(j);
      }
    }

    var bestMove;
    if (randomize) {
      bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      bestMove = bestMoves[0];
    }

    return posMoves[bestMove];
  }

  //Iterative deepening to find the best move within the search budget
  function chooseMove(playerIndex) {
    var bestCompletedMove;
    var search = {
      nodes: 0,
      nodeBudget: Math.max(100, Math.floor(20000 / symbol.length)),
      stopped: false,
    };
    var maximumDepth = Math.min(8, emptyBoxes(symbol).length);

    //Keep the best move from the deepest completed search
    for (var depth = 1; depth <= maximumDepth; depth++) {
      search.nodes = 0;
      search.stopped = false;

      var result = miniMax(symbol, playerIndex, depth, true, search);

      if (search.stopped) {
        break;
      }

      bestCompletedMove = result;
    }

    //If no iteration completed, choose a legal move
    if (!bestCompletedMove) {
      var empty = emptyBoxes(symbol);
      if (empty.length === 0) {
        return null;
      }
      return { id: empty[Math.floor(Math.random() * empty.length)] };
    }

    return bestCompletedMove;
  }

  function evaluateBoard(currentSymbols) {
    var scores = [0, 0, 0];
    var lineWeights = [0, 1, 8, 64];

    for (var i = 0; i < winner.length; i++) {
      var line = winner[i];
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
        scores[linePlayer] += lineWeights[markCount];
      }
    }
    return scores;
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function clearBoard() {
    for (var i = 0; i < boardSize * boardSize; i++) {
      ctx = document.getElementById('canvas' + (i + 1)).getContext('2d');
      ctx.clearRect(0, 0, 100, 100);
      document.getElementById('canvas' + (i + 1)).style.backgroundColor = 'lightyellow';
      filled[i] = false;
      symbol[i] = '';
    }
    turn = 0;
    gameOver = false;
  }

  function updateResults() {
    xWinsOutput.value = wins.X.wins;
    xLossesOutput.value = wins.X.losses;
    xDrawsOutput.value = wins.X.draws;
    oWinsOutput.value = wins.O.wins;
    oLossesOutput.value = wins.O.losses;
    oDrawsOutput.value = wins.O.draws;
    hashWinsOutput.value = wins['#'].wins;
    hashLossesOutput.value = wins['#'].losses;
    hashDrawsOutput.value = wins['#'].draws;
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

  async function playGame(gameNumber, totalGames) {
    // Clear the board before starting a new game
    clearBoard();
    // Until the game ends, each machine takes a turn. Three matching marks in a line wins
    while (gameOver === false) {
      var playerIndex = turn % players.length;
      var player = players[playerIndex];
      status.textContent =
        'Game ' + gameNumber + ' of ' + totalGames + ': Machine ' + player + ' is choosing a move.';
      playMachineMove(playerIndex);
      await delay(moveDelay);

      if (winnerCheck(symbol, player)) {
        recordWin(player);
        gameOver = true;
        status.textContent =
          'Game ' + gameNumber + ' of ' + totalGames + ': Machine ' + player + ' won.';
      } else if (turn >= boardSize * boardSize) {
        recordDraw();
        gameOver = true;
        status.textContent = 'Game ' + gameNumber + ' of ' + totalGames + ': draw.';
      }
    }
    // Update the final results after each game
    updateResults();
  }

  async function runGames(event) {
    event.preventDefault();
    var selectedSize = boardSizeInput.valueAsNumber;
    var gameCount = gameCountInput.valueAsNumber;

    if (!Number.isInteger(selectedSize) || selectedSize < 3 || selectedSize > 6) {
      status.textContent = 'Enter a whole board size from 3 through 6.';
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
    wins = {
      X: { wins: 0, losses: 0, draws: 0 },
      O: { wins: 0, losses: 0, draws: 0 },
      '#': { wins: 0, losses: 0, draws: 0 },
    };
    renderBoard(selectedSize);
    updateResults();

    try {
      for (var gameNumber = 1; gameNumber <= gameCount; gameNumber++) {
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
        ' draws. #: ' +
        wins['#'].wins +
        ' wins, ' +
        wins['#'].losses +
        ' losses, ' +
        wins['#'].draws +
        ' draws.';
    } catch (error) {
      console.error(error);
      status.textContent = 'Unable to complete the games: ' + error.message;
    } finally {
      runButton.disabled = false;
      boardSizeInput.disabled = false;
      gameCountInput.disabled = false;
    }
  }
};
