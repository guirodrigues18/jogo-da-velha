import { useEffect, useState, type FormEvent } from 'react';
import type { Player } from '../game/logic';
import { signIn } from '../online/firebase';
import { getRoomPreview, type RoomPreview } from '../online/rooms';
import { getPartyPreview, type PartyPreview } from '../online/parties';
import { loadNickname, normalizeNickname, NICKNAME_MAX_LENGTH } from '../online/nickname';
import { firstName, getAccountInfo } from '../online/accountInfo';
import { loadPreferences, savePreferences } from '../game/preferences';
import { useChallenge } from '../stats/rivals';
import { t } from '../i18n';
import HelpDialog from './HelpDialog';
import SymbolPicker from './SymbolPicker';

/** O que quem cria escolhe: 1x1 (com o símbolo), 2x2 Duplas ou Champs (com o máximo de jogadores) */
export type OnlineChoice =
  | { kind: 'solo'; symbol: Player }
  | { kind: 'duo' }
  | { kind: 'champs'; max: 3 | 4 };

type ModeKind = OnlineChoice['kind'];

const MODE_KINDS: ModeKind[] = ['solo', 'duo', 'champs'];
const CHAMPS_SIZES = [3, 4] as const;

interface Props {
  /** null = vai criar; com id = foi convidado para a sala 1x1 */
  roomId: string | null;
  /** Convidado para um grupo (2x2 ou Champs) */
  partyId?: string | null;
  /** `choice`: o modo de quem cria (ignorado para quem foi convidado) */
  onSubmit: (nickname: string, choice: OnlineChoice) => void;
  onCancel: () => void;
}

export default function NicknameForm({ roomId, partyId = null, onSubmit, onCancel }: Props) {

  // Sugere o último apelido usado ou, para quem entrou com Google, o primeiro nome
  const [value, setValue] = useState(() => loadNickname() || firstName(getAccountInfo()));
  // Quem já escolheu um apelido não precisa digitar de novo (dá para trocar aqui ou no 👤)
  const [editing, setEditing] = useState(() => !loadNickname());
  const [symbol, setSymbol] = useState(() => loadPreferences().symbol);
  const [kind, setKind] = useState<ModeKind>('solo');
  const [champsMax, setChampsMax] = useState<3 | 4>(4);
  const [preview, setPreview] = useState<RoomPreview | null>(null);
  const [partyPreview, setPartyPreview] = useState<PartyPreview | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // Revanche pedida no ranking de rivais
  const rival = useChallenge();

  // Convidado: mostra quem fez o desafio, ou quem está jogando (se não der, fica o título genérico)
  useEffect(() => {

    if (!roomId) return;

    let cancelled = false;

    signIn()
      .then(() => getRoomPreview(roomId))
      .then(result => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };

  }, [roomId]);

  // Convidado para um grupo: mostra o modo e quem chamou
  useEffect(() => {

    if (!partyId) return;

    let cancelled = false;

    signIn()
      .then(() => getPartyPreview(partyId))
      .then(result => {
        if (!cancelled) setPartyPreview(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };

  }, [partyId]);

  const creating = !roomId && !partyId;
  // Revanche pedida no ranking de rivais é sempre 1x1
  const choosing = creating && !rival;

  let choice: OnlineChoice = { kind: 'solo', symbol };

  if (choosing && kind === 'duo') choice = { kind: 'duo' };
  else if (choosing && kind === 'champs') choice = { kind: 'champs', max: champsMax };

  const nickname = normalizeNickname(value);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!nickname) return;
    if (creating && choice.kind === 'solo') savePreferences({ symbol });
    onSubmit(nickname, choice);
  };

  const watching = Boolean(preview?.full);
  const hostName = preview?.hostRole ? preview.names[preview.hostRole] : undefined;

  let title = rival && creating ? t.rivals.challengeTitle(rival.name) : t.nickname.playOnline;
  let subtitle: string | null = editing ? t.nickname.ask : null;
  let action = choice.kind === 'solo' ? t.nickname.create : t.party.create;

  if (partyId) {
    const modeName = partyPreview ? t.party.modes[partyPreview.mode] : null;
    if (partyPreview?.watching) {
      title = t.party.watchTitle(modeName ?? '');
      subtitle = editing ? t.nickname.watchAsk : t.party.watchInfo;
      action = t.nickname.watch;
    } else {
      title = partyPreview?.hostName && modeName ? t.party.invitedBy(partyPreview.hostName, modeName) : t.nickname.invited;
      action = t.nickname.join;
    }
  } else if (roomId && watching) {
    title = t.nickname.watchTitle(preview?.names.x ?? t.player('X'), preview?.names.o ?? t.player('O'));
    subtitle = editing ? t.nickname.watchAsk : t.nickname.watchInfo;
    action = t.nickname.watch;
  } else if (roomId) {
    title = hostName ? t.nickname.challenged(hostName) : t.nickname.invited;
    action = t.nickname.join;
  }

  return (
    <div className="container online-message">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-title">{title}</div>
        {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        {editing ? (
          <input
            className="nickname-input"
            value={value}
            onChange={event => setValue(event.target.value)}
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder={t.nickname.placeholder}
            aria-label={t.nickname.placeholder}
            autoComplete="nickname"
            enterKeyHint="go"
            autoFocus
          />
        ) : (
          <p className="nickname-chip">
            {t.nickname.playingAs} <strong>{nickname}</strong>
            <button className="link-button" type="button" onClick={() => setEditing(true)}>
              ✏️ {t.nickname.change}
            </button>
          </p>
        )}
        {choosing && (
          <div className="online-mode-picker">
            <div className="segmented small" role="group" aria-label={t.party.modeLabel}>
              {MODE_KINDS.map(option => (
                <button
                  key={option}
                  type="button"
                  className={option === kind ? 'active' : ''}
                  onClick={() => setKind(option)}
                  aria-pressed={option === kind}
                >
                  {t.party.modes[option]}
                </button>
              ))}
            </div>
            <p className="online-mode-hint">{t.party.modeHints[kind]}</p>
            {kind === 'champs' && (
              <div className="segmented small" role="group" aria-label={t.party.sizeLabel}>
                {CHAMPS_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    className={size === champsMax ? 'active' : ''}
                    onClick={() => setChampsMax(size)}
                    aria-pressed={size === champsMax}
                  >
                    {t.party.sizeOption(size)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {creating && choice.kind === 'solo' && <SymbolPicker value={symbol} onChange={setSymbol} />}
        <button className="btn" type="submit" disabled={!nickname}>
          {action}
        </button>
        <div className="form-links">
          <button className="link-button" type="button" onClick={() => setHelpOpen(true)}>
            {t.nickname.howToPlay}
          </button>
          <button className="link-button" type="button" onClick={onCancel}>
            {t.nickname.back}
          </button>
        </div>
      </form>

      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  );

}
