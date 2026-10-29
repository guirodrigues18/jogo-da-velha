/**
 * Abre o menu de compartilhamento nativo com o link (WhatsApp, Telegram...).
 * Onde não houver suporte, copia o link para a área de transferência.
 */
export async function shareLink(url: string, text: string): Promise<'shared' | 'copied' | 'cancelled'> {

  if (navigator.share) {

    try {
      await navigator.share({ title: 'Jogo da Velha 2.0', text, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }

  }

  await copyText(url);

  return 'copied';

}

export async function copyText(text: string): Promise<void> {

  await navigator.clipboard.writeText(text);

}
