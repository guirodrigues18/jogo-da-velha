import {
  applyMove,
  getValidMoves,
  WINNING_LINES,
  type Cell,
  type GameState,
  type Move,
  type Player
} from './logic';

/* ===========================
   Adversário controlado pelo computador
   =========================== */

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil'
};

/** Tempo de "pensamento" do nível difícil (simulações de Monte Carlo) */
const HARD_THINK_MS = 600;

export function chooseMove(state: GameState, difficulty: Difficulty, thinkMs = HARD_THINK_MS): Move {

  const moves = getValidMoves(state);

  // Em qualquer nível, não deixa passar uma vitória imediata da partida
  const winning = moves.find(move => applyMove(state, ...move).winner === state.currentPlayer);

  if (winning) return winning;

  if (difficulty === 'easy') return randomItem(moves);

  if (difficulty === 'medium') return bestByHeuristic(state, moves);

  return monteCarloMove(state, moves, thinkMs);

}

function randomItem<T>(items: T[]): T {

  return items[Math.floor(Math.random() * items.length)];

}

const opponentOf = (player: Player): Player => (player === 'x' ? 'o' : 'x');

/* ===========================
   Médio: avalia cada jogada com regras de bom senso
   =========================== */

// Centro e cantos valem mais, como no jogo da velha comum
const POSITION_VALUE = [3, 1, 3, 1, 4, 1, 3, 1, 3];

function bestByHeuristic(state: GameState, moves: Move[]): Move {

  let best = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {

    const score = scoreMove(state, move) + Math.random() * 2;

    if (score > bestScore) {
      best = move;
      bestScore = score;
    }

  }

  return best;

}

function scoreMove(state: GameState, [board, cell]: Move): number {

  const me = state.currentPlayer;
  const opp = opponentOf(me);
  const next = applyMove(state, board, cell);

  let score = POSITION_VALUE[cell];

  // Conquistar um mini-tabuleiro (mais valioso se for centro ou canto)
  if (next.boards[board].winner === me) score += 40 + POSITION_VALUE[board] * 5;

  // Bloquear o adversário que fecharia esse mini-tabuleiro
  if (completesLine(state.boards[board].cells, cell, opp)) score += 30;

  // Para onde a jogada manda o adversário
  if (next.activeBoard === null) {
    score -= 15; // jogada livre é um presente para o adversário
  } else if (canWinBoard(next.boards[next.activeBoard].cells, opp)) {
    score -= 35; // ele conquistaria o tabuleiro de destino
  }

  // Nunca entregar a vitória da partida
  if (getValidMoves(next).some(m => applyMove(next, ...m).winner === opp)) score -= 500;

  return score;

}

function completesLine(cells: Cell[], index: number, player: Player): boolean {

  if (cells[index]) return false;

  return WINNING_LINES.some(line =>
    line.includes(index) && line.every(i => i === index || cells[i] === player)
  );

}

function canWinBoard(cells: Cell[], player: Player): boolean {

  return cells.some((_, i) => completesLine(cells, i, player));

}

/* ===========================
   Difícil: busca em árvore de Monte Carlo (MCTS)
   Simula milhares de partidas aleatórias e escolhe a jogada que mais venceu.
   =========================== */

interface Node {
  state: GameState;
  move: Move | null;
  parent: Node | null;
  children: Node[];
  untried: Move[];
  visits: number;
  /** Pontos do ponto de vista de quem fez `move` */
  score: number;
}

const EXPLORATION = 1.4;
const MIN_ITERATIONS = 100;

function createNode(state: GameState, move: Move | null, parent: Node | null): Node {

  return { state, move, parent, children: [], untried: getValidMoves(state), visits: 0, score: 0 };

}

function monteCarloMove(state: GameState, moves: Move[], thinkMs: number): Move {

  const root = createNode(state, null, null);

  root.untried = [...moves];

  const deadline = performance.now() + thinkMs;
  let iterations = 0;

  while (performance.now() < deadline || iterations < MIN_ITERATIONS) {

    let node = root;

    // Seleção: desce pela árvore escolhendo o filho mais promissor
    while (node.untried.length === 0 && node.children.length > 0) node = selectChild(node);

    // Expansão: experimenta uma jogada ainda não testada
    if (node.untried.length > 0) {
      const [move] = node.untried.splice(Math.floor(Math.random() * node.untried.length), 1);
      const child = createNode(applyMove(node.state, ...move), move, node);
      node.children.push(child);
      node = child;
    }

    // Simulação: joga aleatoriamente até o fim
    const result = playout(node.state);

    // Retropropagação: cada nó soma o resultado para quem fez a jogada dele
    for (let n: Node | null = node; n; n = n.parent) {
      n.visits++;
      if (n.parent) {
        const mover = n.parent.state.currentPlayer;
        n.score += result === mover ? 1 : result === 'draw' ? .5 : 0;
      }
    }

    iterations++;

  }

  const mostVisited = root.children.reduce((a, b) => (b.visits > a.visits ? b : a));

  return mostVisited.move!;

}

function selectChild(node: Node): Node {

  const logVisits = Math.log(node.visits);

  let best = node.children[0];
  let bestValue = -Infinity;

  for (const child of node.children) {

    const value = child.score / child.visits + EXPLORATION * Math.sqrt(logVisits / child.visits);

    if (value > bestValue) {
      best = child;
      bestValue = value;
    }

  }

  return best;

}

function playout(start: GameState): Player | 'draw' {

  let state = start;

  while (!state.winner) state = applyMove(state, ...randomItem(getValidMoves(state)));

  return state.winner;

}
