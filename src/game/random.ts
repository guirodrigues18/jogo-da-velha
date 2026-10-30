/** Gerador de números pseudoaleatórios com semente: a mesma semente gera sempre a mesma sequência */
export function seededRandom(seed: number): () => number {

  let state = seed >>> 0;

  // mulberry32
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

}

/** Transforma um texto (ex.: a data) em um número para usar como semente */
export function hashString(text: string): number {

  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;

}
