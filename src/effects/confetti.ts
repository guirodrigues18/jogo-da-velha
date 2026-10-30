import { getProfile } from '../shop/wallet';

const COLORS = ['#00e5ff', '#ff4fd8', '#8b5cf6', '#ffffff'];

/** Comemoração da vitória, com o efeito escolhido na loja (a biblioteca só é baixada na primeira vez) */
export async function celebrate() {

  const { default: confetti } = await import('canvas-confetti');

  // Acima do modal de fim de partida
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 150 };
  const effect = getProfile().equipped.effect;

  if (effect === 'effect-stars' || effect === 'effect-hearts') {

    const shape = confetti.shapeFromText({ text: effect === 'effect-stars' ? '⭐' : '💖', scalar: 2.2 });
    const rain = { ...base, shapes: [shape], scalar: 2.2, flat: true, ticks: 220 };

    confetti({ ...rain, particleCount: 40, spread: 100, origin: { y: .55 }, startVelocity: 35 });
    setTimeout(() => confetti({ ...rain, particleCount: 30, spread: 140, origin: { y: .4 }, startVelocity: 25 }), 300);

    return;

  }

  if (effect === 'effect-fireworks') {

    // Explosões em pontos aleatórios do céu, uma atrás da outra
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          ...base,
          particleCount: 70,
          spread: 360,
          startVelocity: 28,
          gravity: .6,
          ticks: 120,
          origin: { x: .2 + Math.random() * .6, y: .2 + Math.random() * .3 }
        });
      }, i * 280);
    }

    return;

  }

  confetti({ ...base, particleCount: 110, spread: 75, origin: { y: .7 } });

  setTimeout(() => {
    confetti({ ...base, particleCount: 55, angle: 60, spread: 60, origin: { x: 0, y: .75 } });
    confetti({ ...base, particleCount: 55, angle: 120, spread: 60, origin: { x: 1, y: .75 } });
  }, 250);

}
