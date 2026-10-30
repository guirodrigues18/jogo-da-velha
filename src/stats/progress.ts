import { emptyStats, type Stats } from './achievements';
import { emptyProfile, type Profile } from '../shop/wallet';
import { findItem } from '../shop/catalog';
import { mergeRivals, type Rivals } from './rivals';

/** Tudo o que é salvo na conta: estatísticas, conquistas, moedas, itens e rivais */
export interface Progress {
  stats: Stats;
  profile: Profile;
  rivals: Rivals;
}

/**
 * Junta o progresso deste aparelho com o da nuvem sem perder nada:
 * números ficam com o maior, conquistas e itens comprados são somados
 * e os itens em uso vêm da nuvem (a escolha mais recente em outro aparelho).
 */
export function mergeProgress(local: Progress, cloud: Partial<Progress> | null): Progress {

  if (!cloud) return local;

  const cloudStats = { ...emptyStats(), ...cloud.stats };
  const cloudProfile = { ...emptyProfile(), ...cloud.profile };

  const unlocked = { ...cloudStats.unlocked };

  for (const [id, date] of Object.entries(local.stats.unlocked) as [keyof Stats['unlocked'], number][]) {
    unlocked[id] = Math.min(date, unlocked[id] ?? date);
  }

  const max = (key: Exclude<keyof Stats, 'unlocked'>) => Math.max(local.stats[key], cloudStats[key]);

  const owned = [...new Set([...local.profile.owned, ...cloudProfile.owned])].filter(id => findItem(id));

  // Item em uso vindo da nuvem só vale se existir e estiver comprado
  const equipped = { ...local.profile.equipped };

  for (const [type, id] of Object.entries(cloudProfile.equipped) as [keyof Profile['equipped'], string][]) {
    if (findItem(id)?.type === type && owned.includes(id)) equipped[type] = id;
  }

  return {
    stats: {
      played: max('played'),
      wins: max('wins'),
      losses: max('losses'),
      draws: max('draws'),
      streak: max('streak'),
      bestStreak: max('bestStreak'),
      unlocked
    },
    profile: {
      coins: Math.max(local.profile.coins, cloudProfile.coins),
      owned,
      equipped
    },
    rivals: mergeRivals(local.rivals, cloud.rivals)
  };

}
