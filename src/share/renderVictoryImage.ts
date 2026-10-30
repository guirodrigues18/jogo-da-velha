import { getWinningLine, type MiniBoard, type Player } from '../game/logic';
import { t } from '../i18n';

/* ===========================
   Configuração da imagem (formato Stories)
   =========================== */

const WIDTH = 1080;
const HEIGHT = 1920;
const CENTER = WIDTH / 2;

const COLORS = {
  x: '#00e5ff',
  o: '#ff4fd8',
  purple: '#8b5cf6',
  text: '#fff',
  muted: '#96a0d4',
  card: 'rgba(13, 19, 41, .78)',
  board: 'rgba(12, 18, 39, .95)',
  cell: '#141b39',
  border: 'rgba(255, 255, 255, .08)'
};

// Topo e rodapé ficam livres: o Instagram sobrepõe a interface dele nessas áreas
const CARD = { x: 130, y: 620, size: 820, padding: 30, radius: 44 };
const BOARD = {
  x: CARD.x + CARD.padding,
  y: CARD.y + CARD.padding,
  size: CARD.size - CARD.padding * 2,
  gap: 20
};
const MINI_SIZE = (BOARD.size - BOARD.gap * 2) / 3;
const MINI = { padding: 12, gap: 9, radius: 26 };

type Ctx = CanvasRenderingContext2D;

/* ===========================
   Geração da imagem
   =========================== */

export async function renderVictoryImage(
  boards: MiniBoard[],
  winner: Player,
  winnerName = t.player(winner.toUpperCase())
): Promise<Blob> {

  // Garante que a fonte Inter está carregada antes de desenhar textos
  await Promise.all(['500', '700', '800'].map(weight => document.fonts.load(`${weight} 48px Inter`)));

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d')!;

  drawBackground(ctx);
  drawHeader(ctx, boards, winner, winnerName);
  drawBoardCard(ctx, boards, winner);
  drawCallToAction(ctx);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem'))), 'image/png');
  });

}

/* ===========================
   Fundo
   =========================== */

function drawBackground(ctx: Ctx) {

  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);

  bg.addColorStop(0, '#040612');
  bg.addColorStop(.45, '#081122');
  bg.addColorStop(1, '#02040d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawGlow(ctx, 0, 0, 900, 'rgba(93, 76, 255, .45)');
  drawGlow(ctx, WIDTH, HEIGHT, 900, 'rgba(0, 229, 255, .28)');
  drawGlow(ctx, WIDTH, 1000, 600, 'rgba(255, 79, 216, .12)');

  // X e O gigantes e apagados, como decoração
  ctx.save();
  ctx.globalAlpha = .07;
  ctx.lineCap = 'round';
  ctx.lineWidth = 34;

  ctx.strokeStyle = COLORS.x;
  ctx.translate(930, 150);
  ctx.rotate(.2);
  ctx.beginPath();
  ctx.moveTo(-130, -130);
  ctx.lineTo(130, 130);
  ctx.moveTo(130, -130);
  ctx.lineTo(-130, 130);
  ctx.stroke();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = COLORS.o;
  ctx.beginPath();
  ctx.arc(120, 1790, 160, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

}

/* ===========================
   Cabeçalho: logo, selo e vencedor
   =========================== */

function drawHeader(ctx: Ctx, boards: MiniBoard[], winner: Player, winnerName: string) {

  drawLogo(ctx, 170);
  drawBadge(ctx, t.image.badge, 250, winner);

  ctx.textAlign = 'center';

  withGlow(ctx, COLORS[winner], 45, () => {
    // Apelidos longos diminuem a fonte para caber na largura
    ctx.font = `800 ${fitFontSize(ctx, winnerName, 800, 150, WIDTH - 140)}px Inter`;
    ctx.fillStyle = COLORS[winner];
    ctx.fillText(winnerName, CENTER, 440);
  });

  ctx.font = '700 58px Inter';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(t.image.won, CENTER, 515);

  const moves = boards.reduce((total, b) => total + b.cells.filter(Boolean).length, 0);
  const conquered = boards.filter(b => b.winner === winner).length;

  ctx.font = '500 36px Inter';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(t.image.stats(moves, conquered), CENTER, 572);

}

function drawLogo(ctx: Ctx, y: number) {

  const title = t.title;
  const version = ' 2.0';

  ctx.font = '800 54px Inter';
  ctx.textAlign = 'left';

  const titleWidth = ctx.measureText(title).width;
  const startX = CENTER - ctx.measureText(title + version).width / 2;

  ctx.fillStyle = COLORS.text;
  ctx.fillText(title, startX, y);

  ctx.fillStyle = COLORS.x;
  ctx.fillText(version, startX + titleWidth, y);

}

function drawBadge(ctx: Ctx, text: string, centerY: number, winner: Player) {

  ctx.font = '700 34px Inter';

  const width = ctx.measureText(text).width + 80;
  const height = 72;
  const x = CENTER - width / 2;
  const y = centerY - height / 2;

  const border = ctx.createLinearGradient(x, 0, x + width, 0);
  border.addColorStop(0, COLORS[winner]);
  border.addColorStop(1, COLORS.purple);

  ctx.fillStyle = 'rgba(255, 255, 255, .06)';
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CENTER, centerY + 2);
  ctx.textBaseline = 'alphabetic';

}

/* ===========================
   Tabuleiro final
   =========================== */

function drawBoardCard(ctx: Ctx, boards: MiniBoard[], winner: Player) {

  const border = ctx.createLinearGradient(CARD.x, CARD.y, CARD.x + CARD.size, CARD.y + CARD.size);
  border.addColorStop(0, COLORS.x);
  border.addColorStop(.5, COLORS.purple);
  border.addColorStop(1, COLORS.o);

  withGlow(ctx, 'rgba(139, 92, 246, .6)', 60, () => {
    ctx.fillStyle = COLORS.card;
    ctx.strokeStyle = border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(CARD.x, CARD.y, CARD.size, CARD.size, CARD.radius);
    ctx.fill();
    ctx.stroke();
  });

  boards.forEach((board, i) => {
    const { x, y } = miniBoardPosition(i);
    drawMiniBoard(ctx, board, x, y);
  });

  const line = getWinningLine(boards);

  if (line) drawWinningLine(ctx, line, winner);

}

function miniBoardPosition(index: number) {

  return {
    x: BOARD.x + (index % 3) * (MINI_SIZE + BOARD.gap),
    y: BOARD.y + Math.floor(index / 3) * (MINI_SIZE + BOARD.gap)
  };

}

function drawMiniBoard(ctx: Ctx, board: MiniBoard, x: number, y: number) {

  ctx.fillStyle = COLORS.board;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, MINI_SIZE, MINI_SIZE, MINI.radius);
  ctx.fill();
  ctx.stroke();

  const cellSize = (MINI_SIZE - MINI.padding * 2 - MINI.gap * 2) / 3;

  board.cells.forEach((cell, i) => {

    const cx = x + MINI.padding + (i % 3) * (cellSize + MINI.gap);
    const cy = y + MINI.padding + Math.floor(i / 3) * (cellSize + MINI.gap);

    ctx.fillStyle = COLORS.cell;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cellSize, cellSize, 12);
    ctx.fill();

    if (cell) drawMark(ctx, cell, cx + cellSize / 2, cy + cellSize / 2, cellSize);

  });

  if (board.winner) drawResultOverlay(ctx, board.winner, x, y);

}

/** Desenha X ou O centralizado, com as mesmas proporções do CSS */
function drawMark(ctx: Ctx, player: Player, cx: number, cy: number, cellSize: number) {

  withGlow(ctx, COLORS[player], 14, () => {

    ctx.strokeStyle = COLORS[player];
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();

    if (player === 'x') {

      const d = cellSize * .3 * Math.SQRT1_2;

      ctx.moveTo(cx - d, cy - d);
      ctx.lineTo(cx + d, cy + d);
      ctx.moveTo(cx + d, cy - d);
      ctx.lineTo(cx - d, cy + d);

    } else {

      ctx.arc(cx, cy, cellSize * .24, 0, Math.PI * 2);

    }

    ctx.stroke();

  });

}

function drawResultOverlay(ctx: Ctx, result: Player | 'draw', x: number, y: number) {

  ctx.fillStyle = 'rgba(6, 8, 22, .9)';
  ctx.beginPath();
  ctx.roundRect(x, y, MINI_SIZE, MINI_SIZE, MINI.radius);
  ctx.fill();

  const cx = x + MINI_SIZE / 2;
  const cy = y + MINI_SIZE / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (result === 'draw') {

    ctx.font = '800 34px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, .35)';
    ctx.fillText('EMPATE', cx, cy);

  } else {

    withGlow(ctx, COLORS[result], 50, () => {
      ctx.font = '800 190px Inter';
      ctx.fillStyle = COLORS[result];
      ctx.fillText(result.toUpperCase(), cx, cy + 10);
    });

  }

  ctx.textBaseline = 'alphabetic';

}

/** Linha neon atravessando os 3 mini-tabuleiros da vitória */
function drawWinningLine(ctx: Ctx, line: number[], winner: Player) {

  const center = (index: number) => {
    const { x, y } = miniBoardPosition(index);
    return { x: x + MINI_SIZE / 2, y: y + MINI_SIZE / 2 };
  };

  const start = center(line[0]);
  const end = center(line[2]);

  // Estende a linha um pouco além do centro dos tabuleiros das pontas
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const extra = MINI_SIZE * .38;
  const dx = Math.cos(angle) * extra;
  const dy = Math.sin(angle) * extra;

  const stroke = (color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x - dx, start.y - dy);
    ctx.lineTo(end.x + dx, end.y + dy);
    ctx.stroke();
  };

  withGlow(ctx, COLORS[winner], 50, () => stroke(COLORS[winner], 18));
  stroke('rgba(255, 255, 255, .9)', 6);

}

/* ===========================
   Desafio e convite
   =========================== */

function drawCallToAction(ctx: Ctx) {

  ctx.textAlign = 'center';
  ctx.font = '800 60px Inter';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(t.image.challenge, CENTER, 1545);

  const text = t.image.playFree(window.location.host);

  ctx.font = '700 38px Inter';

  const width = ctx.measureText(text).width + 100;
  const height = 96;
  const x = CENTER - width / 2;
  const y = 1590;

  const bg = ctx.createLinearGradient(x, 0, x + width, 0);
  bg.addColorStop(0, COLORS.purple);
  bg.addColorStop(1, '#00d9ff');

  withGlow(ctx, 'rgba(0, 217, 255, .5)', 40, () => {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.fill();
  });

  ctx.fillStyle = COLORS.text;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CENTER, y + height / 2 + 2);
  ctx.textBaseline = 'alphabetic';

}

/* ===========================
   Utilitários de desenho
   =========================== */

function drawGlow(ctx: Ctx, x: number, y: number, radius: number, color: string) {

  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);

  glow.addColorStop(0, color);
  glow.addColorStop(1, 'transparent');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

}

function fitFontSize(ctx: Ctx, text: string, weight: number, maxSize: number, maxWidth: number): number {

  let size = maxSize;

  ctx.font = `${weight} ${size}px Inter`;

  while (size > 48 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${weight} ${size}px Inter`;
  }

  return size;

}

function withGlow(ctx: Ctx, color: string, blur: number, draw: () => void) {

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  draw();
  ctx.restore();

}
