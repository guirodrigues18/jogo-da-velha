const COLORS = ['#00e5ff', '#ff4fd8', '#8b5cf6', '#ffffff'];

/** Chuva de confete (a biblioteca só é baixada na primeira vitória) */
export async function celebrate() {

  const { default: confetti } = await import('canvas-confetti');

  // Acima do modal de fim de partida
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 150 };

  confetti({ ...base, particleCount: 110, spread: 75, origin: { y: .7 } });

  setTimeout(() => {
    confetti({ ...base, particleCount: 55, angle: 60, spread: 60, origin: { x: 0, y: .75 } });
    confetti({ ...base, particleCount: 55, angle: 120, spread: 60, origin: { x: 1, y: .75 } });
  }, 250);

}
