export const PUBLIC_CAREER_REQUISITIONS = Object.freeze([]);

export const OPEN_REQUISITION_FIELDS = Object.freeze([
  'id',
  'legalHiringEntity',
  'hiringOwner',
  'engagementType',
  'location',
  'workload',
  'compensation',
  'openingDate',
  'closingDate',
  'selectionStages',
  'applicantPrivacyNotice',
]);

export function validateCareerRequisition(record) {
  const errors = [];
  if (!record || typeof record !== 'object') return ['requisition must be an object'];
  if (record.status !== 'open') return errors;
  if (record.approved !== true) errors.push('approved must be true');
  for (const field of OPEN_REQUISITION_FIELDS) {
    const value = record[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${field} is required for an open requisition`);
    }
  }
  const opens = Date.parse(record.openingDate);
  const closes = Date.parse(record.closingDate);
  if (!Number.isFinite(opens)) errors.push('openingDate must be a valid date');
  if (!Number.isFinite(closes)) errors.push('closingDate must be a valid date');
  if (Number.isFinite(opens) && Number.isFinite(closes) && closes < opens) errors.push('closingDate must not precede openingDate');
  return errors;
}

export function getOpenCareerRequisitions(records = PUBLIC_CAREER_REQUISITIONS) {
  const open = records.filter((record) => record?.status === 'open');
  const failures = open.flatMap((record) => validateCareerRequisition(record).map((error) => `${record?.id || 'unknown'}: ${error}`));
  if (failures.length) throw new Error(`Invalid public career requisition:\n- ${failures.join('\n- ')}`);
  return open;
}
