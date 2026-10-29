export const NICKNAME_MAX_LENGTH = 16;

const NICKNAME_KEY = 'jogo-da-velha:nickname';
const JOINED_KEY_PREFIX = 'jogo-da-velha:sala:';

/** Remove espaços repetidos e limita o tamanho */
export function normalizeNickname(value: string): string {

  return value.replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX_LENGTH);

}

// O armazenamento pode estar indisponível (ex.: aba anônima); nesse caso só não lembra

export function loadNickname(): string {

  try {
    return localStorage.getItem(NICKNAME_KEY) ?? '';
  } catch {
    return '';
  }

}

export function saveNickname(nickname: string) {

  try {
    localStorage.setItem(NICKNAME_KEY, nickname);
  } catch {
    // Vale só para esta visita
  }

}

/** Lembra, durante a sessão, que este navegador já entrou na sala (ao recarregar, não pergunta o apelido) */
export function markJoined(roomId: string) {

  try {
    sessionStorage.setItem(JOINED_KEY_PREFIX + roomId, '1');
  } catch {
    // Ao recarregar, o apelido será pedido de novo (já preenchido)
  }

}

export function hasJoined(roomId: string): boolean {

  try {
    return sessionStorage.getItem(JOINED_KEY_PREFIX + roomId) === '1';
  } catch {
    return false;
  }

}
