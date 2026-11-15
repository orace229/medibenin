import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateInvitationPolicy,
  isPurposeAllowed,
  type ConsentLike,
} from './pathwayPolicy.ts';

const allowedConsent: ConsentLike = {
  evaluationAndCalendar: true,
  channelReminders: true,
  shareWithFacility: true,
  anonymousStatistics: true,
  existingGenomicResult: false,
};

test('consent: an explicit false blocks the purpose, a missing row keeps the default', () => {
  assert.equal(isPurposeAllowed(allowedConsent, 'channelReminders'), true);
  assert.equal(isPurposeAllowed({ ...allowedConsent, channelReminders: false }, 'channelReminders'), false);
  assert.equal(isPurposeAllowed(undefined, 'channelReminders'), true);
});

test('invitation: reminders withdrawal blocks preview and send', () => {
  const consent = { ...allowedConsent, channelReminders: false };
  assert.equal(
    evaluateInvitationPolicy({ mode: 'preview', level: 'orange', state: 'validated', consent }).allowed,
    false
  );
  const send = evaluateInvitationPolicy({ mode: 'send', level: 'orange', state: 'validated', consent });
  assert.equal(send.allowed, false);
  assert.equal(send.status, 403);
});

test('invitation: Red and Grey pathways cannot be invited', () => {
  const red = evaluateInvitationPolicy({ mode: 'send', level: 'red', state: 'validated', consent: allowedConsent });
  const grey = evaluateInvitationPolicy({ mode: 'send', level: 'grey', state: 'validated', consent: allowedConsent });
  assert.equal(red.allowed, false);
  assert.equal(red.status, 403);
  assert.equal(grey.allowed, false);
  assert.equal(grey.status, 403);
});

test('invitation: unvalidated and refused pathways are blocked', () => {
  const created = evaluateInvitationPolicy({ mode: 'send', level: 'orange', state: 'created', consent: allowedConsent });
  const refused = evaluateInvitationPolicy({ mode: 'send', level: 'orange', state: 'refused', consent: allowedConsent });
  assert.equal(created.allowed, false);
  assert.equal(created.status, 409);
  assert.equal(refused.allowed, false);
  assert.equal(refused.status, 403);
});

test('invitation: validated/invited Orange or Yellow can be sent', () => {
  for (const state of ['validated', 'invited']) {
    for (const level of ['orange', 'yellow']) {
      const result = evaluateInvitationPolicy({ mode: 'send', level, state, consent: allowedConsent });
      assert.equal(result.allowed, true, `${level}/${state}`);
    }
  }
});

test('invitation: an invalid mode is rejected', () => {
  const result = evaluateInvitationPolicy({ mode: 'approve', level: 'orange', state: 'validated', consent: allowedConsent });
  assert.equal(result.allowed, false);
  assert.equal(result.status, 400);
});
