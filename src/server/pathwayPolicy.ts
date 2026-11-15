/**
 * Pure pathway / consent policy helpers.
 *
 * Keeping these rules outside the Express handlers makes the two most
 * safety-critical decisions testable without a database:
 *  - a missing consent row keeps the historical default, but an explicit
 *    `false` always blocks the corresponding purpose;
 *  - an invitation is never sent for a Red/Grey, an unvalidated pathway, or a
 *    refused pathway.
 */

export type ConsentPurpose =
  | 'evaluationAndCalendar'
  | 'channelReminders'
  | 'shareWithFacility'
  | 'anonymousStatistics'
  | 'existingGenomicResult';

export type ConsentLike =
  | Partial<Record<ConsentPurpose, boolean | null>>
  | null
  | undefined;

export function isPurposeAllowed(
  consent: ConsentLike,
  purpose: ConsentPurpose
): boolean {
  if (!consent) return true;
  return consent[purpose] !== false;
}

export interface InvitationPolicyInput {
  mode: string;
  level: string;
  state: string;
  consent?: ConsentLike;
}

export interface PolicyResult {
  allowed: boolean;
  status?: number;
  error?: string;
}

export function evaluateInvitationPolicy(input: InvitationPolicyInput): PolicyResult {
  if (input.mode !== 'preview' && input.mode !== 'send') {
    return { allowed: false, status: 400, error: 'mode must be "preview" or "send".' };
  }

  if (!isPurposeAllowed(input.consent, 'channelReminders')) {
    return {
      allowed: false,
      status: 403,
      error:
        'Reminder consent is required: the patient has withdrawn the reminders purpose. No message was generated or sent.',
    };
  }

  if (input.mode === 'preview') return { allowed: true };

  if (input.level === 'red') {
    return {
      allowed: false,
      status: 403,
      error: 'A Red pathway cannot be invited: it requires same-day clinical review.',
    };
  }
  if (input.level === 'grey') {
    return {
      allowed: false,
      status: 403,
      error: 'A Grey pathway cannot be invited: complete the missing data first.',
    };
  }
  if (input.state === 'refused') {
    return {
      allowed: false,
      status: 403,
      error:
        'This invitation was refused by the person. Reminders are stopped; a new invitation requires an explicit patient decision.',
    };
  }
  if (input.state !== 'validated' && input.state !== 'invited') {
    return {
      allowed: false,
      status: 409,
      error: `The pathway must be validated by a clinician before invitation (current state: ${input.state}).`,
    };
  }
  return { allowed: true };
}
