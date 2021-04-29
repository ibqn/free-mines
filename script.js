console.log("running");

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;
const NUMBER_OF_MINES = 10;

const TILE_STATE = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked",
};

const GAME_STATE = {
  START: "start",
  GOING: "going",
  WIN: "win",
  LOSE: "lose",
};

let gameState = GAME_STATE.START;

const createBoard = (boardWidth, boardHeight) =>
  Array.from({ length: boardWidth * boardHeight }, (_, index) => ({
    x: Math.floor(index / boardWidth),
    y: index % boardWidth,
  }));

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

console.log("board", board);

const matchPosition = (a, b) => a.x === b.x && a.y === b.y;

const markTile = (tileElement) => {
  const state = tileElement.dataset.state;
  if (state !== TILE_STATE.HIDDEN && state !== TILE_STATE.MARKED) {
    return;
  }

  if (state === TILE_STATE.MARKED) {
    tileElement.dataset.state = TILE_STATE.HIDDEN;
  } else {
    tileElement.dataset.state = TILE_STATE.MARKED;
  }
};

let mines = [];

const revealTile = (tileElement, tile) => {
  const state = tileElement.dataset.state;

  if (state !== TILE_STATE.HIDDEN) {
    return;
  }

  // console.log("mines", mines, "tile", tile);

  if (mines.some(matchPosition.bind(null, tile))) {
    // console.log("match");
    tileElement.dataset.state = TILE_STATE.MINE;
    return;
  }

  tileElement.dataset.state = TILE_STATE.NUMBER;
};

const checkWin = () => {};
const checkLose = () => {};

const randomNumber = (upperBound) => Math.floor(Math.random() * upperBound);

const generateMinePositions = (
  boardWidth,
  boardHeight,
  numberOfMines,
  exceptTile,
  exceptIndex
) => {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardWidth),
      y: randomNumber(boardHeight),
    };

    if (
      !matchPosition(position, exceptTile) &&
      !positions.some(matchPosition.bind(null, position))
    ) {
      positions.push(position);
      board[position.x * boardWidth + position.y].mine = true;
    }
  }

  return positions;
};

const handleClick = (event, tile, index) => {
  console.log("left click event", event.target, "tile", tile, "index", index);

  if (gameState !== GAME_STATE.START && gameState !== GAME_STATE.GOING) {
    return;
  }

  if (gameState === GAME_STATE.START) {
    mines = generateMinePositions(
      BOARD_WIDTH,
      BOARD_HEIGHT,
      NUMBER_OF_MINES,
      tile,
      index
    );
    gameState = GAME_STATE.GOING;
  }

  revealTile(event.target, tile);
};

const handleRightClick = (event, tile) => {
  event.preventDefault();
  console.log("right click event", event.target, "tile", tile);

  markTile(event.target);
};

const boardElement = document.getElementById("board");

boardElement.style.setProperty("--board-width", BOARD_WIDTH);
boardElement.style.setProperty("--board-height", BOARD_HEIGHT);

board
  .map((tile) => ({
    ...tile,
    element: document.createElement("div"),
    get state() {
      return this.element.dataset.state;
    },
    set state(value) {
      this.element.dataset.state = value;
    },
  }))
  .forEach((tile, index) => {
    tile.state = TILE_STATE.HIDDEN;

    const { element } = tile;

    element.addEventListener("click", (event) =>
      handleClick(event, tile, index)
    );
    element.addEventListener("contextmenu", (event) =>
      handleRightClick(event, tile)
    );
    element.innerText = `${tile.x}-${tile.y}`;
    boardElement.appendChild(element);
  });
