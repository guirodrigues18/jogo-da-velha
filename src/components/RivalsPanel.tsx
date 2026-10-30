import { rivalRanking, startChallenge, useRivals } from '../stats/rivals';
import { isOnlineConfigured, roomIdFromUrl } from '../online/config';
import { useAccountInfo } from '../online/accountInfo';
import { t } from '../i18n';

interface Props {
  /** Fecha a janela ao começar uma revanche */
  onChallenge: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

/** Ranking entre você e quem você já enfrentou online, com revanche em um toque */
export default function RivalsPanel({ onChallenge }: Props) {

  const rivals = useRivals();
  const account = useAccountInfo();

  // O placar só vale entre contas Google (o botão de entrar fica no topo da janela)
  if (!account) return <p className="rivals-empty">🔒 {t.rivals.needGoogle}</p>;

  if (!Object.keys(rivals).length) return <p className="rivals-empty">⚔️ {t.rivals.empty}</p>;

  const ranking = rivalRanking(rivals, t.rivals.you);
  // Dentro de uma sala, a revanche faria a pessoa sair da partida atual
  const canChallenge = isOnlineConfigured && !roomIdFromUrl();

  const challenge = (id: string) => {
    startChallenge(id);
    onChallenge();
  };

  return (
    <>
      <p className="stats-note">{t.rivals.note}</p>

      <ol className="rival-ranking">
        {ranking.map((row, i) => {

          const you = row.id === null;
          // Na linha do rival, as vitórias dele são as suas derrotas
          const detail = you
            ? t.rivals.yourRecord(row.wins, row.draws, row.losses)
            : t.rivals.versus(row.losses, row.wins, row.draws);

          return (
            <li key={row.id ?? 'you'} className={you ? 'rival-row you' : 'rival-row'}>
              <span className="rival-position">{MEDALS[i] ?? i + 1}</span>
              <span className="rival-info">
                <strong>{row.name}</strong>
                <small>{detail}</small>
              </span>
              <span className="rival-rate">{Math.round(row.rate * 100)}%</span>
              {!you && canChallenge && (
                <button className="shop-action rival-challenge" onClick={() => challenge(row.id!)} title={t.rivals.rematchHint}>
                  ⚔️ {t.rivals.rematch}
                </button>
              )}
            </li>
          );

        })}
      </ol>

      {!canChallenge && isOnlineConfigured && <p className="stats-note">{t.rivals.inRoom}</p>}
    </>
  );

}
