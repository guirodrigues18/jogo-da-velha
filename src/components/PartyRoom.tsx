import { useEffect, useState, type ComponentProps, type RefObject } from 'react';
import {
  groupTimeoutsLeft,
  MARK_SYMBOLS,
  MARKS,
  markOf,
  wonByElimination,
  type GroupMode
} from '../game/group';
import { minPlayers, usePartyGame } from '../hooks/usePartyGame';
import { PARTY_PARAM } from '../online/config';
import { copyText, shareLink } from '../share/shareLink';
import { track } from '../online/consent';
import { t } from '../i18n';
import GameView from './GameView';
import OnlineMessage from './OnlineMessage';
import ReactionBar from './ReactionBar';
import ReactionLayer from './ReactionLayer';

interface Props {
  /** null = criar um grupo novo */
  partyId: string | null;
  nickname: string;
  /** Modo, tamanho e segundos por jogada de quem cria o grupo */
  create: { mode: GroupMode; max: number; seconds: number };
  /** Onde registrar a função de desistência (usada pelo botão voltar) */
  leaveRoomRef: RefObject<(() => void) | null>;
  onPartyCreated: (partyId: string) => void;
  onLeave: () => void;
}

type Party = ReturnType<typeof usePartyGame>;
type ModalProps = ComponentProps<typeof GameView>['modal'];

const noop = () => {};
const COPIED_FEEDBACK_MS = 2000;

/** Partida em grupo: 2x2 Duplas ou Champs (3 ou 4 jogadores) */
export default function PartyRoom({ partyId, nickname, create, leaveRoomRef, onPartyCreated, onLeave }: Props) {

  const party = usePartyGame(partyId, nickname, create, onPartyCreated);
  const { game, mode } = party;

  useEffect(() => {

    leaveRoomRef.current = party.leave;

    return () => {
      leaveRoomRef.current = null;
    };

  });

  if (party.status === 'error' && party.error) {
    return <OnlineMessage {...t.online.errors[party.error]} actionLabel={t.online.playLocal} onAction={onLeave} />;
  }

  if (party.status === 'connecting' || !partyId) {
    return <OnlineMessage title={partyId ? t.party.joining : t.party.creating} />;
  }

  const leave = () => {
    party.leave();
    onLeave();
  };

  const current = markOf(mode, game.seat);
  const view = { ...game, currentPlayer: current };
  const overlay = <ReactionLayer reactions={party.floatingReactions} onDone={party.dismissReaction} />;
  const reactionBar = party.started && !party.matchClosed && <ReactionBar onReact={party.react} />;

  let turnLabel = party.myTurn ? t.online.yourTurn : t.online.turnOf(party.nameOf(game.seat));

  if (!party.started) {
    turnLabel = party.joinedCount >= party.max ? t.party.waitingStart : t.party.waitingPlayers(party.joinedCount, party.max);
  }
  else if (party.matchClosed || party.hostLeft) turnLabel = t.online.matchOver;
  else if (mode === 'duo' && !party.spectator && party.mySeat !== null && game.seat === (party.mySeat + 2) % 4) {
    turnLabel = t.party.partnerTurn(party.nameOf(game.seat));
  }

  return (
    <GameView
      game={view}
      secondsLeft={party.secondsLeft}
      timerActive={party.timerActive}
      turnSeconds={party.seconds}
      timeoutsLeft={party.inProgress ? groupTimeoutsLeft(game, game.seat) : undefined}
      endNote={wonByElimination(game) ? t.party.endedByElimination : undefined}
      nudge={party.nudge}
      notice={party.notice}
      shake={party.shake}
      overlay={overlay}
      turnLabel={turnLabel}
      myTurn={party.inProgress && !party.spectator ? party.myTurn : undefined}
      onCellClick={party.spectator ? noop : party.play}
      panel={(
        <>
          {party.started
            ? <PartyStatus party={party} onLeave={leave} />
            : <PartyLobby party={party} partyId={partyId} onLeave={leave} />}
          {reactionBar}
        </>
      )}
      modal={party.spectator ? spectatorModal(party, leave) : playerModal(party, leave)}
    />
  );

}

/* ===========================
   Lobby: quem já entrou, convite e "Começar"
   =========================== */

function PartyLobby({ party, partyId, onLeave }: { party: Party; partyId: string; onLeave: () => void }) {

  const [copied, setCopied] = useState(false);

  const { mode, max } = party;
  const inviteUrl = `${window.location.origin}${window.location.pathname}?${PARTY_PARAM}=${partyId}`;
  const inviteText = t.party.inviteMessage(party.nameOf(0), t.party.modes[mode]);
  const needed = minPlayers(mode, max);

  const showCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const invite = async () => {
    const result = await shareLink(inviteUrl, inviteText);
    if (result !== 'cancelled') track('share', { content_type: 'party_invite', method: result });
    if (result === 'copied') showCopied();
  };

  const copy = async () => {
    await copyText(inviteUrl);
    track('share', { content_type: 'party_invite', method: 'copied' });
    showCopied();
  };

  if (party.hostLeft) {
    return (
      <div className="online-panel">
        <div className="online-title">{t.party.closedTitle}</div>
        <p className="online-text">{t.party.closedText}</p>
        <button className="btn" onClick={onLeave}>{t.online.backHome}</button>
      </div>
    );
  }

  const seats = Array.from({ length: max }, (_, seat) => seat);
  // No 2x2, cada dupla numa linha: ✕ (lugares 0 e 2) e ◯ (1 e 3)
  const rows = mode === 'duo' ? [[0, 2], [1, 3]] : [seats];

  return (
    <div className="online-panel party-lobby">
      <div className="online-title">{mode === 'duo' ? t.party.modes.duo : t.party.lobbyTitle(t.party.modes[mode], max)}</div>
      <p className="online-text">{mode === 'duo' ? t.party.rulesDuo : t.party.rulesChamps} {t.party.secondsInfo(party.seconds)}.</p>

      <div className="party-seats">
        {rows.map((row, i) => (
          <div className="party-row" key={i}>
            {mode === 'duo' && <span className="party-team">{t.party.team(MARK_SYMBOLS[MARKS[i]])}</span>}
            {row.map(seat => <SeatChip key={seat} party={party} seat={seat} />)}
          </div>
        ))}
      </div>

      <button className="btn" onClick={invite}>{t.online.sendInvite}</button>
      <button className="btn btn-ghost" onClick={copy}>
        {copied ? t.online.copied : t.online.copyLink}
      </button>
      <p className="invite-bonus">{t.party.spectatorsHint}</p>

      {party.isHost ? (
        <>
          <button className="btn party-start" onClick={party.start} disabled={!party.canStart}>
            {t.party.start}
          </button>
          <p className="invite-bonus">
            {party.canStart ? t.party.readyHint(party.joinedCount) : t.party.needPlayers(needed, party.joinedCount)}
          </p>
        </>
      ) : (
        <p className="invite-bonus">{t.party.waitingHost(party.nameOf(0))}</p>
      )}

      <button className="link-button" onClick={onLeave}>{t.party.leave}</button>
    </div>
  );

}

/* ===========================
   Partida em andamento: jogadores, vez, eliminados e placar
   =========================== */

function PartyStatus({ party, onLeave }: { party: Party; onLeave: () => void }) {

  const seats = Array.from({ length: party.size }, (_, seat) => seat);
  const rows = party.mode === 'duo' ? [[0, 2], [1, 3]] : [seats];
  const { score } = party;

  return (
    <div className="online-panel online-status party-status">
      <div className="party-seats">
        {rows.map((row, i) => (
          <div className="party-row" key={i}>
            {party.mode === 'duo' && (
              <span className="party-team">
                {t.party.team(MARK_SYMBOLS[MARKS[i]])}
                {score[MARKS[i]] ? ` · 🏆${score[MARKS[i]]}` : ''}
              </span>
            )}
            {row.map(seat => <SeatChip key={seat} party={party} seat={seat} />)}
          </div>
        ))}
      </div>
      {party.spectator && <span className="opponent-status">{t.online.youAreWatching}</span>}
      {party.spectatorNames.length > 0 && !party.spectator && (
        <span className="spectators" title={party.spectatorNames.join(', ')}>
          {t.online.watchingCount(party.spectatorNames.length)}
        </span>
      )}
      <button className="link-button" onClick={onLeave}>{t.online.leave}</button>
    </div>
  );

}

function SeatChip({ party, seat }: { party: Party; seat: number }) {

  const { mode, game } = party;
  const mark = markOf(mode, seat);
  const taken = Boolean(party.party?.seats[seat]);
  const out = party.started && (game.out[seat] || party.left[seat]);
  const current = party.inProgress && game.seat === seat;
  const wins = mode === 'champs' ? party.score[mark] ?? 0 : 0;

  const classes = ['role-chip', mark];

  if (!taken) classes.push('empty');
  if (out) classes.push('out');
  if (current) classes.push('current');

  const online = Boolean(party.party?.online[seat]);

  return (
    <span className={classes.join(' ')} title={out ? t.party.outTag : undefined}>
      {taken && <span className={online && !out ? 'status-dot online' : 'status-dot'} />}
      {MARK_SYMBOLS[mark]}{' '}
      <span className="player-name">{taken ? party.nameOf(seat) : t.party.emptySeat}</span>
      {seat === party.mySeat && <small> {t.online.youTag}</small>}
      {out && <small> · {t.party.outTag}</small>}
      {wins > 0 && <small> · 🏆{wins}</small>}
    </span>
  );

}

/* ===========================
   Modal de fim de partida
   =========================== */

function resultTitle(party: Party): string | undefined {

  const { game, mode, myMark } = party;
  const winner = game.winner;

  if (!winner) return undefined;
  if (winner === 'draw') return t.result.draw;

  if (mode === 'duo') {
    if (myMark === winner) return t.party.teamWon;
    return myMark ? t.party.teamLost(MARK_SYMBOLS[winner]) : t.party.teamWonSpectator(MARK_SYMBOLS[winner]);
  }

  if (myMark === winner) return t.party.champsWon;

  const name = party.nameOf(MARKS.indexOf(winner));

  return myMark ? t.result.otherWon(name) : t.result.someoneWon(name);

}

function playerModal(party: Party, leave: () => void): ModalProps {

  const base = { autoRestart: false, showShare: false, onShare: noop };

  let subtitle: string | undefined;

  if (!party.canRematch) subtitle = party.someoneLeft ? t.party.cantRematch : undefined;
  else if (party.rematchRequested) subtitle = t.party.waitingRematch(party.rematchCount, party.size);
  else if (party.rematchCount > 0) subtitle = t.party.othersWantRematch(party.rematchCount, party.size);

  return {
    ...base,
    title: resultTitle(party),
    subtitle,
    restartLabel: !party.canRematch ? t.online.backHome : party.rematchRequested ? t.online.waiting : t.online.rematch,
    restartDisabled: party.rematchRequested,
    onRestart: party.canRematch ? party.rematch : leave,
    secondaryLabel: party.canRematch ? t.party.leave : undefined,
    onSecondary: leave
  };

}

function spectatorModal(party: Party, leave: () => void): ModalProps {

  return {
    title: resultTitle(party),
    subtitle: t.online.nextMatchHere,
    autoRestart: false,
    restartLabel: t.online.leave,
    showShare: false,
    onShare: noop,
    onRestart: leave
  };

}
