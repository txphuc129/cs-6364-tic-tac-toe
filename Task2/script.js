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
  var human = 'X';
  var ai = 'O';
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

  //newGame - event + function
  var n = document.getElementById('new');
  n.addEventListener('click', newGame);

  //Reload page
  function newGame() {
    document.location.reload();
  }

  //Canvas click + retrieving the box's number
  //canvas click event
  document.getElementById('tic').addEventListener('click', function (e) {
    boxClick(e.target.id);
  });

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

    symbol[num - 1] = human;
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

    symbol[next] = ai; // 'O'
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

  //4.Box click function - human playing
  function boxClick(numId) {
    box = document.getElementById(numId);
    ctx = box.getContext('2d');
    switch (numId) {
      case 'canvas1':
        num = 1;
        break;
      case 'canvas2':
        num = 2;
        break;
      case 'canvas3':
        num = 3;
        break;
      case 'canvas4':
        num = 4;
        break;
      case 'canvas5':
        num = 5;
        break;
      case 'canvas6':
        num = 6;
        break;
      case 'canvas7':
        num = 7;
        break;
      case 'canvas8':
        num = 8;
        break;
      case 'canvas9':
        num = 9;
        break;
    }

    if (filled[num - 1] === false) {
      if (gameOver === false) {
        if (turn % 2 !== 0) {
          drawX();
          turn++;
          filled[num - 1] = true;

          if (winnerCheck(symbol, symbol[num - 1]) === true) {
            document.getElementById('result').innerText = "Player '" + symbol[num - 1] + "' won!";
            gameOver = true;
          }

          if (turn > 9 && gameOver !== true) {
            document.getElementById('result').innerText = 'GAME OVER! IT WAS A DRAW!';
            gameOver = true;
            return;
          }

          if (turn % 2 === 0 && gameOver === false) {
            playAI();
          }
        }
      } else {
        alert('Game over. Please click the New Game button to start again');
      }
    } else {
      alert('This box was already filled. Please click on another one.');
    }
  }

  //5. Find the empty boxes
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

  //6. Making the AI play - playAI() and miniMaxWithAlphaBeta()

  //playAI()
  function playAI() {
    var nextMove = miniMaxWithAlphaBeta(symbol, ai, -Infinity, Infinity); //object that stores id of next move and score of the box for next move
    var nextId = 'canvas' + (nextMove.id + 1);
    box = document.getElementById(nextId);
    ctx = box.getContext('2d');
    if (gameOver === false) {
      if (turn % 2 === 0) {
        //if turn is even
        drawO(nextMove.id);
        turn++;
        filled[nextMove.id] = true;

        //winner check - ai wins
        if (winnerCheck(symbol, symbol[nextMove.id]) === true) {
          document.getElementById('result').innerText = "Player '" + symbol[nextMove.id] + "' won!";
          gameOver = true;
        }

        //draw condition
        if (turn > 9 && gameOver !== true) {
          document.getElementById('result').innerText = 'GAME OVER! IT WAS A DRAW!';
          gameOver = true;
        }
      }
    } else {
      alert('Game is over. Please click the New Game button to start again');
    }
  }

  //miniMaxWithAlphaBeta function
  function miniMaxWithAlphaBeta(newSymbol, player, alpha, beta) {
    var result = {};
    var empty = [];
    empty = emptyBoxes(newSymbol); //[]

    if (winnerCheck(newSymbol, human)) {
      return { score: -10 }; //human wins
    } else if (winnerCheck(newSymbol, ai)) {
      return { score: 10 }; //AI wins
    } else if (empty.length === 0) {
      return { score: 0 }; //game is draw
    }

    var posMoves = [];
    for (var i = 0; i < empty.length; i++) {
      var curMove = {};
      //generate the new board with the current move
      curMove.id = empty[i];
      newSymbol[empty[i]] = player; //AI

      if (player === ai) {
        result = miniMaxWithAlphaBeta(newSymbol, human, alpha, beta);
        curMove.score = result.score;

        // Update alpha for the maximizing player
        alpha = Math.max(alpha, curMove.score);
      } else {
        result = miniMaxWithAlphaBeta(newSymbol, ai, alpha, beta);
        curMove.score = result.score; //-10

        // Update beta for the minimizing player
        beta = Math.min(beta, curMove.score);
      }
      newSymbol[empty[i]] = '';

      posMoves.push(curMove);

      if (beta <= alpha) {
        break;
      }
    }

    //Calculate score of intermediate states - best move + score with respect to that player + return statement
    var bestMove;
    //AI - max player (always) -> choose maximum value, human - min player -> choose minimum value

    if (player === ai) {
      var highestScore = -1000;
      for (var j = 0; j < posMoves.length; j++) {
        if (posMoves[j].score > highestScore) {
          highestScore = posMoves[j].score;
          bestMove = j; //0
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
};
