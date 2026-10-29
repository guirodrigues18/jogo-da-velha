import { useEffect, useState } from 'react';
import type { MiniBoard, Player } from '../game/logic';
import { renderVictoryImage } from '../share/renderVictoryImage';
import { shareImage } from '../share/shareImage';
import { unlockAchievement } from '../stats/achievements';

interface Props {
  boards: MiniBoard[];
  winner: Player;
  winnerName?: string;
  onShare: () => void;
}

export default function ShareVictoryButton({ boards, winner, winnerName, onShare }: Props) {

  const [image, setImage] = useState<Blob | null>(null);

  // A imagem é gerada antes do clique: o navegador só permite compartilhar
  // imediatamente após uma ação do usuário
  useEffect(() => {

    let cancelled = false;

    renderVictoryImage(boards, winner, winnerName).then(blob => {
      if (!cancelled) setImage(blob);
    });

    return () => {
      cancelled = true;
    };

  }, [boards, winner, winnerName]);

  const handleClick = () => {

    if (!image) return;

    onShare();
    unlockAchievement('sharer');
    shareImage(image, 'jogo-da-velha-vitoria.png');

  };

  return (
    <button className="btn btn-share" disabled={!image} onClick={handleClick}>
      Compartilhar nos Stories
    </button>
  );

}
