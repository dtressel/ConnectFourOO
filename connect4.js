/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Game {
  constructor (p1, p2) {
    this.players = [p1, p2];
    this.currPlayer = 1; // active player: 1 or 2
    this.width = 7;
    this.height = 6;
    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.stillHovering = []; // array to determine if the mouse is still hovering over a particular top td cell
    // below are audio samples for piece drops - 0 (for all filled except top) to 5 (for empty column)
    // two copies of each sample so that there are always sounds even when user rapidly places pieces
    this.audioArray = [
      [new Audio('audio/Sound0.mp3'), new Audio('audio/Sound0b.mp3')], 
      [new Audio('audio/Sound1.mp3'), new Audio('audio/Sound1b.mp3')], 
      [new Audio('audio/Sound2.mp3'), new Audio('audio/Sound2b.mp3')], 
      [new Audio('audio/Sound3.mp3'), new Audio('audio/Sound3b.mp3')], 
      [new Audio('audio/Sound4.mp3'), new Audio('audio/Sound4b.mp3')], 
      [new Audio('audio/Sound5.mp3'), new Audio('audio/Sound5b.mp3')]
    ];
    this.makeBoard();
    this.makeHtmlBoard();
    this.setStillHovering();
    console.log(this);
  }

  /** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */
  makeBoard() {
    // sets "board" to empty height x width matrix array
    for (let y = 0; y < this.height; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.width; x++)
        this.board[y][x] = null;
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const htmlBoard = document.createElement('table');
    htmlBoard.setAttribute('id', 'board');
    document.getElementById('game').append(htmlBoard);
    //creates Top row of board with classes for top row styles:
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    //adds event listener to top row:
    this.handleClickBound = this.handleClick.bind(this);
    top.addEventListener("click", this.handleClickBound);
    //creates individual cells for top row:
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", `t${x}`);
      //adds event listeners for show piece on hover:
      this.showHoverPieceBound = this.showHoverPiece.bind(this);
      this.removeHoverPieceBound = this.removeHoverPiece.bind(this);
      headCell.addEventListener("mouseover", this.showHoverPieceBound);
      headCell.addEventListener("mouseleave", this.removeHoverPieceBound);
      top.append(headCell);
    }
    htmlBoard.append(top);

    // creates rows and cells for main board and naming cells with id of "y-x":
    // empty divs are created to contain the blue board styling and to hide blue board overflow
    // Pieces will be placed directly in the td cells but z-index in CSS puts Pieces behind blue board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");
      for (let x = 0; x < this.width; x++) {
        const blueDiv = document.createElement("div");
        blueDiv.classList.add("game-board-div");
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("empty-div");
        emptyDiv.append(blueDiv);
        const cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        cell.append(emptyDiv);
        row.append(cell);
      }
      htmlBoard.append(row);
    }
  }

  // sets inital stillHovering values for all top td cells to false
  setStillHovering() {
    for (let x = 0; x < this.width; x++) {
      this.stillHovering[x] = false;
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    let ySpot;
    for (let y = 5; y >= 0; y--) {
      if (!this.board[y][x]) {
        ySpot = y;
        break;
      }
      if (y === 0) {
        ySpot = null;
      }
    }
    return ySpot;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */
  placeInTable(y, x) {
    const newPiece = document.createElement('div');
    newPiece.style.backgroundColor = `${this.players[this.currPlayer -1].color}`;
    newPiece.classList.add('piece', `fall${y}`);
    console.log(newPiece);
    console.log(document.getElementById(`${y}-${x}`));
    console.log(`${y}-${x}`);
    document.getElementById(`${y}-${x}`).append(newPiece);
    this.audioArray[y][this.currPlayer - 1].play();
  }

  /** endGame: announce game end */

  endGame(msg) {
    // prevent event listeners on top row from triggering
    document.getElementById('column-top').style.pointerEvents = 'none';

    // pop up alert message after animation completes
    setTimeout(() => {
      alert(msg + " Play again!");
      document.getElementById('play-form-container').classList.remove('hidden');
    }, 700);
  }

  // adds the hover piece
  showHoverPiece(evt) {
    this.stillHovering[+(evt.target.id.slice(1))] = false; // shouldn't be necessary but a fail-safe
    const hoverPiece = document.createElement('div');
    hoverPiece.style.backgroundColor = `${this.players[this.currPlayer -1].color}`;
    hoverPiece.classList.add('piece');
    evt.target.append(hoverPiece);
  }

  // removes the hover piece after mouse leaves cell
  removeHoverPiece(evt) {
    this.stillHovering[+(evt.target.id.slice(1))] = false;
    if (evt.target.firstChild) {
      evt.target.firstChild.remove();
    }
  }

  /** handleClick: handle click of column top to play piece */
  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +(evt.target.id.slice(1));

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // remove event listener to avoid accidental double clicks
    document.getElementById("column-top").removeEventListener("click", this.handleClickBound)

    // place piece in board and add to HTML table
    this.placeInTable(y, x);

    // remove hover piece
    if (evt.target.firstChild) {
      evt.target.firstChild.remove();
    }

    // sets still hovering to true for clicked cell
    this.stillHovering[+(evt.target.id.slice(1))] = true;

    // updates in-memory board
    this.board[y][x] = this.currPlayer;

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer} won!`);
    }

    // check for tie
    // check if all top cells in board are filled; if so call, call endGame
    if (this.board[0].every(value => value)) {
      return this.endGame('The game ended in a draw!');
    }

    // switch players
    this.currPlayer === 1 ? this.currPlayer = 2 : this.currPlayer = 1;

    // re-add event listener after brief timeout
    setTimeout(() => {
      document.getElementById("column-top").addEventListener("click", this.handleClickBound);}, 
      300);

    // if mouse is still hovering on same cell, replace hover piece after timeout
    setTimeout(() => {if (this.stillHovering[+(evt.target.id.slice(1))]) {this.showHoverPiece(evt)}}, 700);
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    const _win = cells => 
      cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );

    // For each coordinate on the board, this checks whether it is the start of a horizontal,
    // vertical, down-right diagonal, or down-left diagonal connect 4

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}

// Event Listeners for color picking and start game
const p1ColorSelect = document.getElementById("p1-color");
const p2ColorSelect = document.getElementById("p2-color");
const startGameButton = document.getElementById("start-game");
p1ColorSelect.addEventListener("change", (e) => removeFromOtherList(e, 2));
p2ColorSelect.addEventListener("change", (e) => removeFromOtherList(e, 1));
startGameButton.addEventListener("click", startGame);

// function to disallow picking the same color for each player triggered by color change
function removeFromOtherList(e, listToChange) {
  const list = document.querySelectorAll(`#p${listToChange}-color > option`);
  for (listItem of list) {
    listItem.classList.remove('hidden');
  }
  const toHide = document.getElementById(`${e.target.value}${listToChange}`);
  toHide.classList.add('hidden')
}

// start game function triggered by "start new game" button
function startGame(e) {
  e.preventDefault();
  const player1 = new Player(p1ColorSelect.value);
  const player2 = new Player(p2ColorSelect.value);
  if (document.getElementById('board')) {
    document.getElementById('board').remove();
  }
  document.getElementById('play-form-container').classList.add('hidden');
  new Game (player1, player2);
}