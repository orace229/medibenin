/**
 * §5.5 — Conflits de synchronisation des parcours (états 8).
 *
 * Deux appareils peuvent modifier la même recommandation hors ligne. La
 * résolution suit exactement les règles documentées :
 *  1. « Réalisée » confirmée par le centre est définitive (seul le centre peut
 *     la corriger, et la correction est tracée).
 *  2. Un refus ou un retrait de consentement l'emporte sur tout état non final
 *     et arrête les relances futures.
 *  3. Pour les autres états, on compare les DATES DES ÉVÉNEMENTS (et non les
 *     dates de synchronisation). À date égale : centre > coordinateur > agent.
 *  4. Chaque conflit est journalisé et affiché au coordinateur.
 *
 * Fonction pure, testée par TEST-S1 de la suite d'acceptation.
 */

export type PathwayState =
  | 'created'
  | 'validated'
  | 'invited'
  | 'scheduled'
  | 'postponed'
  | 'overdue'
  | 'done'
  | 'refused';

export type ActorAuthority = 'center' | 'coordinator' | 'agent';

export interface PathwayEvent {
  state: PathwayState;
  /** Date de l'événement clinique (ISO) — jamais la date de synchronisation. */
  eventDate: string;
  actor: ActorAuthority;
}

export interface ConflictResolution {
  finalState: PathwayState;
  conflictDetected: boolean;
  /** Raison tracée dans le journal (affichée au coordinateur). */
  reason: string;
  winningActor: ActorAuthority | null;
}

/** Ordre d'autorité §5.5.3 : centre, puis coordinateur, puis agent. */
const AUTHORITY_RANK: Record<ActorAuthority, number> = {
  center: 3,
  coordinator: 2,
  agent: 1,
};

export function resolvePathwayConflict(local: PathwayEvent, remote: PathwayEvent): ConflictResolution {
  // Règle 1 : le « Réalisée » confirmé par le centre est définitif.
  const centerDone = [local, remote].find((e) => e.state === 'done' && e.actor === 'center');
  if (centerDone) {
    const other = centerDone === local ? remote : local;
    const conflict = other.state !== 'done';
    return {
      finalState: 'done',
      conflictDetected: conflict,
      reason: conflict
        ? `Sync conflict: centre-confirmed "Réalisée" (definitive) prevails over "${other.state}" recorded by the ${other.actor}`
        : 'Both devices confirm the visit as done',
      winningActor: 'center',
    };
  }

  // Règle 2 : le refus / retrait de consentement l'emporte sur tout état non final.
  const refusal = [local, remote].find((e) => e.state === 'refused');
  if (refusal) {
    const other = refusal === local ? remote : local;
    return {
      finalState: 'refused',
      conflictDetected: other.state !== 'refused',
      reason: `Sync conflict: penalty-free refusal (consent withdrawal) prevails over "${other.state}" recorded by the ${other.actor} — all reminders halt`,
      winningActor: refusal.actor,
    };
  }

  // Règle 3 : comparaison des dates d'événement (pas de synchronisation).
  const localDate = Date.parse(local.eventDate);
  const remoteDate = Date.parse(remote.eventDate);
  if (Number.isFinite(localDate) && Number.isFinite(remoteDate) && localDate !== remoteDate) {
    const later = localDate > remoteDate ? local : remote;
    const other = later === local ? remote : local;
    return {
      finalState: later.state,
      conflictDetected: local.state !== remote.state,
      reason: `Sync conflict: the most recent clinical event (${later.state} by the ${later.actor}) prevails over "${other.state}" by the ${other.actor} — compared by event dates, not sync dates`,
      winningActor: later.actor,
    };
  }

  // À date égale : ordre d'autorité centre > coordinateur > agent.
  const winner = AUTHORITY_RANK[local.actor] >= AUTHORITY_RANK[remote.actor] ? local : remote;
  const other = winner === local ? remote : local;
  return {
    finalState: winner.state,
    conflictDetected: local.state !== remote.state,
    reason:
      local.state !== remote.state
        ? `Sync conflict: equal event dates — authority order (centre > coordinateur > agent) resolves to "${winner.state}" by the ${winner.actor}`
        : 'No conflict: identical states recorded',
    winningActor: local.state !== remote.state ? winner.actor : null,
  };
}
