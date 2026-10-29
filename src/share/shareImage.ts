/**
 * Abre o menu de compartilhamento nativo (Instagram, WhatsApp...) com a imagem.
 * Onde o navegador não suporta compartilhar arquivos, a imagem é baixada.
 */
export async function shareImage(blob: Blob, fileName: string): Promise<void> {

  const file = new File([blob], fileName, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {

    try {
      // Sem title/text: alguns apps (como o Instagram) ignoram a imagem se houver texto junto
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      // Usuário fechou o menu de compartilhamento
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }

  }

  downloadFile(file);

}

function downloadFile(file: File) {

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = file.name;
  link.click();

  URL.revokeObjectURL(url);

}
