//6 parts
window.onload = function () {
  //1. Initial states
  var num;
  var box;
  var ctx;
  var turn = 1;
  var filled;
  var symbol;
  var winner;
  var gameOver = false;
  var playerX = 'X';
  var playerO = 'O';
  var result = {};
  var wins = { X: 0, O: 0, draws: 0 };
  var moveDelay = 120;
  filled = new Array();
  symbol = new Array();
  winner = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (var i = 0; i < 9; i++) {
    filled[i] = false;
    symbol[i] = '';
  }

  var gameCountInput = document.getElementById('game-count');
  var runButton = document.getElementById('run-games');
  var status = document.getElementById('status');
  var xWinsOutput = document.getElementById('x-wins');
  var oWinsOutput = document.getElementById('o-wins');
  var drawsOutput = document.getElementById('draws');
  document.getElementById('game-form').addEventListener('submit', runGames);

  //2.Drawing X's and O's
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

    symbol[num - 1] = playerX;
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

    symbol[next] = playerO;
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
      if (newSymbol[i] !== 'X' && newSymbol[i] !== 'O') {
        empty[j] = i;
        j++;
      }
    }
    return empty;
  }

  //5. Let each machine play using minimax with alpha-beta pruning
  function playMachineMove(player) {
    var nextMove = miniMaxWithAlphaBeta(symbol, player, -Infinity, Infinity);
    if (!nextMove || !Number.isInteger(nextMove.id) || filled[nextMove.id]) {
      throw new Error('The machine player did not return a valid move.');
    }

    num = nextMove.id + 1;
    box = document.getElementById('canvas' + num);
    ctx = box.getContext('2d');
    if (player === playerX) {
      drawX();
    } else {
      drawO(nextMove.id);
    }
    filled[nextMove.id] = true;
    turn++;
  }

  //Minimax function with alpha-beta pruning
  function miniMaxWithAlphaBeta(newSymbol, player, alpha, beta) {
    var empty = [];
    empty = emptyBoxes(newSymbol);

    if (winnerCheck(newSymbol, playerX)) {
      return { score: 10 }; //Player X wins
    } else if (winnerCheck(newSymbol, playerO)) {
      return { score: -10 }; //Player O wins
    } else if (empty.length === 0) {
      return { score: 0 }; //Game is a draw
    }

    //if its not a terminal state
    //possible moves- their indices and score values
    var posMoves = [];
    //[4] - Example
    for (var i = 0; i < empty.length; i++) {
      //current move - index of current move,score
      var curMove = {};
      //generate the new board with the current move
      curMove.id = empty[i]; //4
      newSymbol[empty[i]] = player;

      if (player === playerX) {
        //Player X maximizes the score
        result = miniMaxWithAlphaBeta(newSymbol, playerO, alpha, beta);
        curMove.score = result.score;

        //Alpha-beta pruning: update X's best guaranteed score and stop at a beta cutoff.
        if (curMove.score > alpha) {
          alpha = curMove.score;
        }
        if (beta <= alpha) {
          newSymbol[empty[i]] = '';
          posMoves.push(curMove);
          break;
        }
      } else {
        //Player O minimizes the score
        result = miniMaxWithAlphaBeta(newSymbol, playerX, alpha, beta);
        curMove.score = result.score;

        //Alpha-beta pruning: update O's best guaranteed score and stop at an alpha cutoff.
        if (curMove.score < beta) {
          beta = curMove.score;
        }
        if (beta <= alpha) {
          newSymbol[empty[i]] = '';
          posMoves.push(curMove);
          break;
        }
      }

      newSymbol[empty[i]] = '';
      posMoves.push(curMove);
    }

    //Calculate score of intermediate states - best move + score with respect to that player + return statement
    var bestMove;
    //Player X maximizes the score; Player O minimizes the score.
    if (player === playerX) {
      var highestScore = -1000;
      for (var j = 0; j < posMoves.length; j++) {
        if (posMoves[j].score > highestScore) {
          highestScore = posMoves[j].score;
          bestMove = j;
        }
      }
    } else {
      var lowestScore = 1000;
      for (var j = 0; j < posMoves.length; j++) {
        if (posMoves[j].score < lowestScore) {
          lowestScore = posMoves[j].score;
          bestMove = j;
        }
      }
    }
    return posMoves[bestMove];
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function clearBoard() {
    for (var i = 0; i < 9; i++) {
      ctx = document.getElementById('canvas' + (i + 1)).getContext('2d');
      ctx.clearRect(0, 0, 100, 100);
      document.getElementById('canvas' + (i + 1)).style.backgroundColor = 'lightyellow';
      filled[i] = false;
      symbol[i] = '';
    }
    turn = 1;
    gameOver = false;
  }

  function updateResults() {
    xWinsOutput.value = wins.X;
    oWinsOutput.value = wins.O;
    drawsOutput.value = wins.draws;
  }

  async function playGame(gameNumber, totalGames) {
    // Clear the board before starting a new game
    clearBoard();
    // Until the game ends, each machine takes turns playing a move. The game ends when one machine wins or the game is a draw
    while (gameOver === false) {
      var player = turn % 2 !== 0 ? playerX : playerO;
      status.textContent =
        'Game ' + gameNumber + ' of ' + totalGames + ': Machine ' + player + ' is choosing a move.';
      playMachineMove(player);
      await delay(moveDelay);

      if (winnerCheck(symbol, player)) {
        wins[player]++;
        gameOver = true;
        status.textContent =
          'Game ' + gameNumber + ' of ' + totalGames + ': Machine ' + player + ' won.';
      } else if (turn > 9) {
        wins.draws++;
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
    wins = { X: 0, O: 0, draws: 0 };
    updateResults();

    try {
      for (var gameNumber = 1; gameNumber <= gameCount; gameNumber++) {
        await playGame(gameNumber, gameCount);
        await delay(moveDelay);
      }
      status.textContent =
        'Completed ' +
        gameCount +
        ' games. Machine X wins: ' +
        wins.X +
        ', Machine O wins: ' +
        wins.O +
        ', draws: ' +
        wins.draws +
        '.';
    } catch (error) {
      status.textContent = 'Unable to complete the games: ' + error.message;
    } finally {
      runButton.disabled = false;
      gameCountInput.disabled = false;
    }
  }
};
