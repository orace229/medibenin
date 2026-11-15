/**
 * Versioned care-schedule document (WCV / IFHAS / national cancer intervals).
 *
 * These are declared starting values: the Abu Dhabi texts are tracked as V3/V4
 * and must replace them before real use. The document is versioned and exposed
 * in governance metadata; changing a value requires a new document version.
 */

import crypto from 'crypto';
import scheduleDoc from '../config/schedules/care-schedules.v1.json';

interface CareScheduleDocument {
  schemaVersion: number;
  documentId: string;
  version: string;
  effectiveDate: string;
  source: string;
  schedules: {
    wcvAgesMonths: number[];
    wcvWindowMonths: number;
    cervicalIntervalMonths: number;
    mammographyIntervalMonths: number;
    colorectalIntervalMonths: number;
    ifhasIntervalMonths: number;
  };
}

const DOC = scheduleDoc as CareScheduleDocument;

if (!DOC.schemaVersion || !DOC.documentId || !DOC.version || !DOC.effectiveDate || !DOC.schedules) {
  throw new Error('Invalid care-schedule document');
}

export const CARE_SCHEDULES = DOC.schedules;

export const CARE_SCHEDULE_METADATA = {
  documentId: DOC.documentId,
  version: DOC.version,
  effectiveDate: DOC.effectiveDate,
  source: DOC.source,
  sha256: crypto.createHash('sha256').update(JSON.stringify(DOC)).digest('hex').slice(0, 16),
};

/**
 * Number of scheduled Well-Child Visits that should have happened up to
 * `ageMonths` but are not covered by the last recorded visit.
 *
 * Returns null when the last visit age is unknown: the caller must then surface
 * missing data (Level Grey) rather than assume no missed visit.
 */
export function computeMissedWcvCount(
  ageMonths: number,
  lastWcvAgeMonths: number | null | undefined
): number | null {
  if (
    lastWcvAgeMonths === null ||
    lastWcvAgeMonths === undefined ||
    !Number.isFinite(Number(lastWcvAgeMonths)) ||
    !Number.isFinite(ageMonths)
  ) {
    return null;
  }
  const last = Number(lastWcvAgeMonths);
  const tolerance = CARE_SCHEDULES.wcvWindowMonths;
  const due = CARE_SCHEDULES.wcvAgesMonths.filter(
    (a) => a <= ageMonths && a <= 72
  );
  // A due visit is considered covered if a visit was recorded within its
  // window after the scheduled age.
  return due.filter((a) => last < a - tolerance).length;
}

/** True when the last screening is within the interval; null when unknown. */
export function isScreeningCurrent(
  monthsSinceLast: number | null | undefined,
  intervalMonths: number
): boolean | null {
  if (monthsSinceLast === null || monthsSinceLast === undefined) return null;
  const m = Number(monthsSinceLast);
  if (!Number.isFinite(m) || m < 0) return null;
  return m <= intervalMonths;
}
