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
  var wins = {
    X: { wins: 0, losses: 0, draws: 0 },
    O: { wins: 0, losses: 0, draws: 0 },
    '#': { wins: 0, losses: 0, draws: 0 },
  };
  var moveDelay = 120;
  var searchDepth = 4;
  filled = new Array();
  symbol = new Array();
  winner = generateWinningLines(4, 3);

  for (var i = 0; i < 16; i++) {
    filled[i] = false;
    symbol[i] = '';
  }

  var gameCountInput = document.getElementById('game-count');
  var runButton = document.getElementById('run-games');
  var status = document.getElementById('status');
  var xWinsOutput = document.getElementById('x-wins');
  var xLossesOutput = document.getElementById('x-losses');
  var xDrawsOutput = document.getElementById('x-draws');
  var oWinsOutput = document.getElementById('o-wins');
  var oLossesOutput = document.getElementById('o-losses');
  var oDrawsOutput = document.getElementById('o-draws');
  var hashWinsOutput = document.getElementById('hash-wins');
  var hashLossesOutput = document.getElementById('hash-losses');
  var hashDrawsOutput = document.getElementById('hash-draws');
  document.getElementById('game-form').addEventListener('submit', runGames);

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

  //3. Winner check function
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
    var nextMove = miniMax(symbol, playerIndex, searchDepth, true);
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
    turn++;
  }

  //Minimax function for three players (Max^n)
  function miniMax(newSymbol, playerIndex, depth, randomize) {
    var result = {};
    var empty = [];
    empty = emptyBoxes(newSymbol);

    for (var player = 0; player < players.length; player++) {
      if (winnerCheck(newSymbol, players[player])) {
        var terminalScore = [-1000, -1000, -1000];
        terminalScore[player] = 1000;
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
      result = miniMax(newSymbol, nextPlayer, depth - 1, false);
      curMove.scores = result.scores;

      newSymbol[empty[i]] = '';
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
    for (var i = 0; i < 16; i++) {
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
      } else if (turn >= 16) {
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
    var gameCount = gameCountInput.valueAsNumber;
    if (!Number.isInteger(gameCount) || gameCount < 1 || gameCount > 10) {
      status.textContent = 'Enter a whole number from 1 through 10.';
      gameCountInput.focus();
      return;
    }

    runButton.disabled = true;
    gameCountInput.disabled = true;
    wins = {
      X: { wins: 0, losses: 0, draws: 0 },
      O: { wins: 0, losses: 0, draws: 0 },
      '#': { wins: 0, losses: 0, draws: 0 },
    };
    updateResults();

    try {
      for (var gameNumber = 1; gameNumber <= gameCount; gameNumber++) {
        await playGame(gameNumber, gameCount);
        await delay(moveDelay);
      }
      status.textContent =
        'Completed ' +
        gameCount +
        ' games. X: ' +
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
      status.textContent = 'Unable to complete the games: ' + error.message;
    } finally {
      runButton.disabled = false;
      gameCountInput.disabled = false;
    }
  }
};
