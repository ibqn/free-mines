console.log("running");

const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 9;
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
    x: index % boardWidth,
    y: Math.floor(index / boardWidth),
  })).map((tile) => ({
    ...tile,
    element: document.createElement("div"),
    get state() {
      return this.element.dataset.state;
    },
    set state(value) {
      this.element.dataset.state = value;
    },
  }));

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

console.log("board", board);

const matchPosition = (a, b) => a.x === b.x && a.y === b.y;

const markTile = (index) => {
  const tile = board[index];
  const { state } = tile;

  if (state !== TILE_STATE.HIDDEN && state !== TILE_STATE.MARKED) {
    return;
  }

  if (state === TILE_STATE.MARKED) {
    tile.state = TILE_STATE.HIDDEN;
  } else {
    tile.state = TILE_STATE.MARKED;
  }
};

const nearbyTiles = (index) => {
  let tiles = [];
  for (let offsetX = -1; offsetX <= 1; offsetX++) {
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
      if (offsetX === 0 && offsetY == 0) {
        continue;
      }

      const x = index % BOARD_WIDTH;
      const y = Math.floor(index / BOARD_WIDTH);

      if (
        x + offsetX < 0 ||
        x + offsetX >= BOARD_WIDTH ||
        y + offsetY < 0 ||
        y + offsetY >= BOARD_HEIGHT
      ) {
        continue;
      }

      const idx = index + offsetX + offsetY * BOARD_WIDTH;
      const tile = board[idx];

      if (tile) {
        tiles.push({ ...tile, idx });
      }
    }
  }

  return tiles;
};

const revealTile = (index) => {
  const tile = board[index];
  const { state, mine, element } = tile;

  console.log("reveal tile", tile);

  if (state !== TILE_STATE.HIDDEN) {
    return;
  }

  if (mine) {
    console.log("match");
    tile.state = TILE_STATE.MINE;
    return;
  }

  tile.state = TILE_STATE.NUMBER;
  const tiles = nearbyTiles(index);
  // console.log("=tiles", tiles);
  const minesCount = tiles.filter(({ mine }) => mine).length;
  if (minesCount === 0) {
    element.innerText = "";
    tiles.forEach(({ idx }) => revealTile(idx));
  } else {
    element.innerText = minesCount;
  }
};

const checkWin = () => {};
const checkLose = () => {};

const randomNumber = (upperBound) => Math.floor(Math.random() * upperBound);

const generateMinePositions = (exceptIndex) => {
  const positions = [];

  while (positions.length < NUMBER_OF_MINES) {
    const position = {
      x: randomNumber(BOARD_WIDTH),
      y: randomNumber(BOARD_HEIGHT),
    };

    if (
      !matchPosition(position, board[exceptIndex]) &&
      !positions.some(matchPosition.bind(null, position))
    ) {
      positions.push(position);
      board[position.x + position.y * BOARD_WIDTH].mine = true;
    }
  }
  console.log("mines generated");
};

const handleClick = (event, index) => {
  const tile = board[index];
  console.log("left click event", event.target, "tile", tile, "index", index);

  if (gameState !== GAME_STATE.START && gameState !== GAME_STATE.GOING) {
    return;
  }

  if (gameState === GAME_STATE.START) {
    generateMinePositions(index);
    gameState = GAME_STATE.GOING;
  }

  revealTile(index);
};

const handleRightClick = (event, index) => {
  event.preventDefault();

  const tile = board[index];
  console.log("right click event", event.target, "tile", tile);

  markTile(index);
};

const boardElement = document.getElementById("board");

boardElement.style.setProperty("--board-width", BOARD_WIDTH);
boardElement.style.setProperty("--board-height", BOARD_HEIGHT);

board.forEach((tile, index) => {
  tile.state = TILE_STATE.HIDDEN;

  const { element } = tile;

  element.addEventListener("click", (event) => handleClick(event, index));
  element.addEventListener("contextmenu", (event) =>
    handleRightClick(event, index)
  );
  // element.innerText = `${tile.x}-${tile.y}`;
  boardElement.appendChild(element);
});
