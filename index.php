<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Jogo da Velha 2.0</title>
 <meta name="author" content="TchêTec">
  <meta property="og:image" content="/img/favicon.png">
  <link rel="icon" type="image/png" href="/img/favicon.png">
    <meta property="og:locale" content="pt_BR">

    <link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

:root{
  --bg:#060816;
  --card:rgba(18,24,52,.72);
  --border:rgba(255,255,255,.08);
  --text:#fff;
  --muted:#96a0d4;
  --cyan:#00e5ff;
  --pink:#ff4fd8;
  --green:#00ffb3;
}

body{
  min-height:100vh;
  background:
  radial-gradient(circle at top left, rgba(93,76,255,.25), transparent 28%),
  radial-gradient(circle at bottom right, rgba(0,229,255,.14), transparent 28%),
  linear-gradient(145deg,#040612 0%,#081122 45%,#02040d 100%);
  font-family:'Inter',sans-serif;
  color:white;
  overflow-x:hidden;
  padding:18px;
}

body::before,
body::after{
  content:'';
  position:fixed;
  width:300px;
  height:300px;
  border-radius:50%;
  filter:blur(100px);
  opacity:.22;
  z-index:0;
}

body::before{
  background:#7b5cff;
  top:-100px;
  left:-100px;
}

body::after{
  background:#00d9ff;
  bottom:-100px;
  right:-100px;
}

.container{
  position:relative;
  z-index:1;
  max-width:1200px;
  margin:auto;
}

.top{
  margin-bottom:20px;
}

.title{
  font-size:clamp(2rem,5vw,4rem);
  font-weight:800;
  line-height:1;
  margin-bottom:12px;
}

.title span{
  background:linear-gradient(90deg,var(--cyan),#4dc3ff);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.subtitle{
  color:var(--muted);
  line-height:1.6;
  max-width:800px;
}

.info-bar{
  margin-top:22px;
  display:flex;
  gap:16px;
  flex-wrap:wrap;
}

.info-card{
  background:rgba(13,19,41,.7);
  border:1px solid rgba(255,255,255,.08);
  border-radius:18px;
  padding:16px 20px;
  backdrop-filter:blur(10px);
  flex:1;
  min-width:220px;
}

.info-label{
  color:var(--muted);
  font-size:.85rem;
  margin-bottom:8px;
}

.info-value{
  font-size:1.15rem;
  font-weight:700;
}

.main-board{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
  margin-top:28px;
}

.mini-board{
  background:rgba(12,18,39,.8);
  border:2px solid rgba(255,255,255,.08);
  border-radius:22px;
  padding:10px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  position:relative;
  transition:.25s ease;
  min-height:240px;
  overflow:hidden;
}

.mini-board.active{
  border-color:var(--cyan);
  box-shadow:
  0 0 25px rgba(0,229,255,.28),
  inset 0 0 25px rgba(0,229,255,.08);
  transform:translateY(-2px);
}

.mini-board.locked{
  opacity:.82;
}

.mini-board.free{
  border-color:#8b5cf6;
  box-shadow:
  0 0 25px rgba(139,92,246,.28),
  inset 0 0 20px rgba(139,92,246,.08);
}

.cell{
  aspect-ratio:1;
  background:linear-gradient(180deg,rgba(20,27,57,.95),rgba(13,20,43,.95));
  border:1px solid rgba(255,255,255,.06);
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  position:relative;
  transition:.2s ease;
}

.cell:hover{
  transform:translateY(-2px);
  border-color:rgba(255,255,255,.18);
}

.cell.disabled{
  pointer-events:none;
}

.cell.x::before,
.cell.x::after{
  content:'';
  position:absolute;
  width:60%;
  height:6px;
  background:var(--cyan);
  border-radius:999px;
  box-shadow:0 0 16px rgba(0,229,255,.9);
}

.cell.x::before{
  transform:rotate(45deg);
}

.cell.x::after{
  transform:rotate(-45deg);
}

.cell.o::before{
  content:'';
  width:54%;
  height:54%;
  border-radius:50%;
  border:6px solid var(--pink);
  box-shadow:0 0 18px rgba(255,79,216,.65);
}

.board-overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:8rem;
  font-weight:900;
  z-index:4;
  backdrop-filter:blur(3px);
}

.board-overlay.x{
  color:rgba(0,229,255,.16);
  text-shadow:0 0 30px rgba(0,229,255,.6);
}

.board-overlay.o{
  color:rgba(255,79,216,.16);
  text-shadow:0 0 30px rgba(255,79,216,.6);
}

.board-overlay.draw{
  color:rgba(255,255,255,.1);
  font-size:3rem;
}

.modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.7);
  backdrop-filter:blur(8px);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:99;
  opacity:0;
  visibility:hidden;
  transition:.25s ease;
  padding:20px;
}

.modal.show{
  opacity:1;
  visibility:visible;
}

.modal-card{
  width:100%;
  max-width:450px;
  background:linear-gradient(180deg,#111936,#0a1024);
  border:1px solid rgba(255,255,255,.08);
  border-radius:30px;
  padding:34px;
  text-align:center;
}

.modal-title{
  font-size:2.3rem;
  margin-bottom:12px;
  font-weight:800;
}

.modal-subtitle{
  color:var(--muted);
  line-height:1.6;
  margin-bottom:28px;
}

.btn{
  width:100%;
  border:none;
  padding:16px;
  border-radius:18px;
  background:linear-gradient(90deg,#8b5cf6,#00d9ff);
  color:white;
  font-size:1rem;
  font-weight:700;
  cursor:pointer;
}

.legend{
  margin-top:20px;
  color:var(--muted);
  line-height:1.7;
  font-size:.95rem;
}

@media(max-width:1000px){

  .main-board{
    gap:12px;
  }

  .mini-board{
    min-height:190px;
  }

}

@media(max-width:760px){

  .main-board{
    gap:10px;
  }

  .mini-board{
    min-height:140px;
    padding:6px;
    gap:5px;
    border-radius:16px;
  }

  .cell{
    border-radius:10px;
  }

  .board-overlay{
    font-size:4rem;
  }

}

@media(max-width:500px){

  body{
    padding:10px;
  }

  .info-bar{
    flex-direction:column;
  }

  .main-board{
    gap:8px;
  }

  .mini-board{
    min-height:108px;
    padding:4px;
    gap:4px;
    border-radius:12px;
  }

  .cell.x::before,
  .cell.x::after{
    height:4px;
  }

  .cell.o::before{
    border-width:4px;
  }

}
</style>
</head>

<body>

<div class="container">

  <div class="top">
    <h1 class="title">Jogo da Velha<span> 2.0</span></h1>

    <p class="subtitle">
      Ganhe mini-tabuleiros para dominar o tabuleiro principal.
      Cada jogada define onde o próximo jogador deverá jogar.
    </p>

    <div class="info-bar">

      <div class="info-card">
        <div class="info-label">Turno atual</div>
        <div class="info-value" id="turnText">Jogador X</div>
      </div>

      <div class="info-card">
        <div class="info-label">Próximo tabuleiro</div>
        <div class="info-value" id="boardText">
          Livre
        </div>
      </div>

    </div>

  </div>

  <div class="main-board" id="mainBoard"></div>

  <div class="legend">
    🔥 A posição clicada define o próximo mini-tabuleiro do adversário.<br>
    ⚡ Se o tabuleiro estiver fechado, o próximo jogador pode jogar em qualquer um aberto.
  </div>

</div>

<div class="modal" id="modal">
  <div class="modal-card">
    <div class="modal-title" id="modalTitle"></div>
    <div class="modal-subtitle">
      O jogo será reiniciado automaticamente.
    </div>
    <button class="btn" onclick="restartGame()">
      Jogar novamente
    </button>
  </div>
</div>

<script>

const mainBoard = document.getElementById('mainBoard');
const turnText = document.getElementById('turnText');
const boardText = document.getElementById('boardText');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');

let currentPlayer = 'x';
let activeBoard = null;

const WINNING = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

let boards = [];

function createGame(){

  boards = [];

  mainBoard.innerHTML = '';

  for(let i=0;i<9;i++){

    const board = {
      cells:Array(9).fill(null),
      winner:null,
      element:null
    };

    const boardEl = document.createElement('div');
    boardEl.className = 'mini-board free';
    boardEl.dataset.board = i;

    for(let c=0;c<9;c++){

      const cell = document.createElement('div');

      cell.className = 'cell';

      cell.dataset.board = i;
      cell.dataset.cell = c;

      cell.addEventListener('click', handleMove);

      boardEl.appendChild(cell);

    }

    board.element = boardEl;

    boards.push(board);

    mainBoard.appendChild(boardEl);

  }

  updateBoardHighlights();
  updateTexts();

}

function handleMove(e){

  const boardIndex = Number(e.target.dataset.board);
  const cellIndex = Number(e.target.dataset.cell);

  const board = boards[boardIndex];

  if(board.winner) return;

  if(activeBoard !== null && activeBoard !== boardIndex){

    const forcedBoard = boards[activeBoard];

    if(!forcedBoard.winner){
      return;
    }

  }

  if(board.cells[cellIndex]) return;

  board.cells[cellIndex] = currentPlayer;

  e.target.classList.add(currentPlayer);

  const winner = checkWinner(board.cells);

  if(winner){

    board.winner = winner;

    finishMiniBoard(boardIndex,winner);

  }else if(board.cells.every(c => c)){

    board.winner = 'draw';

    finishMiniBoard(boardIndex,'draw');

  }

  const bigWinner = checkBigWinner();

  if(bigWinner){

    finishGame(bigWinner);

    return;

  }

  activeBoard = cellIndex;

  if(boards[activeBoard].winner){

    activeBoard = null;
  }

  currentPlayer = currentPlayer === 'x' ? 'o' : 'x';

  updateTexts();
  updateBoardHighlights();

}

function finishMiniBoard(index,winner){

  const board = boards[index];

  board.element.classList.add('locked');

  const overlay = document.createElement('div');

  overlay.className = 'board-overlay';

  if(winner === 'x'){

    overlay.classList.add('x');
    overlay.innerText = 'X';

  }else if(winner === 'o'){

    overlay.classList.add('o');
    overlay.innerText = 'O';

  }else{

    overlay.classList.add('draw');
    overlay.innerText = 'EMPATE';

  }

  board.element.appendChild(overlay);

}

function checkWinner(cells){

  for(const combo of WINNING){

    const [a,b,c] = combo;

    if(
      cells[a] &&
      cells[a] === cells[b] &&
      cells[a] === cells[c]
    ){
      return cells[a];
    }

  }

  return null;

}

function checkBigWinner(){

  const bigCells = boards.map(b => {

    if(b.winner === 'draw'){
      return null;
    }

    return b.winner;

  });

  return checkWinner(bigCells);

}

function updateTexts(){

  turnText.innerText =
    currentPlayer === 'x'
    ? 'Jogador X'
    : 'Jogador O';

  if(activeBoard === null){

    boardText.innerText =
      'Livre — qualquer tabuleiro';

  }else{

    boardText.innerText =
      `Tabuleiro ${activeBoard + 1}`;

  }

}

function updateBoardHighlights(){

  boards.forEach((board,index) => {

    board.element.classList.remove('active');
    board.element.classList.remove('free');

    if(board.winner) return;

    if(activeBoard === null){

      board.element.classList.add('free');

    }else if(index === activeBoard){

      board.element.classList.add('active');

    }

  });

}

function finishGame(winner){

  modal.classList.add('show');

  modalTitle.innerText =
    winner === 'x'
    ? '✕ Jogador X venceu!'
    : '◯ Jogador O venceu!';

  setTimeout(() => {

    restartGame();

  },4000);

}

function restartGame(){

  modal.classList.remove('show');

  currentPlayer = 'x';

  activeBoard = null;

  createGame();

}

createGame();

</script>

</body>
</html>
