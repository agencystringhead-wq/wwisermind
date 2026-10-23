import type { Estimate } from '../../lib/gfe/estimate.ts';

/** Invented people and numbers, for tests and the sample PDF. */
export const sampleEstimate = (): Estimate => ({
  practiceName: 'Harborview Counseling',
  providerName: 'Dana Reyes',
  credentials: 'LMFT',
  npi: '1234567893',
  tin: '12-3456789',
  street: '410 Willow Lane, Suite 2',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  phone: '(512) 555-0142',
  email: 'hello@harborviewcounseling.example',
  clientName: 'Jamie Quinn',
  clientDob: '1990-04-12',
  clientAddress: '88 Alder Street, Apt 4, Portland, OR 97205',
  clientPhone: '(555) 010-0199',
  clientEmail: 'jamie.quinn@example.com',
  firstSession: '2026-11-05',
  issued: '2026-10-23',
  diagnosis: 'F41.1',
  rows: [
    { id: 'a', code: '90791', fee: '200', sessions: '1' },
    { id: 'b', code: '90837', fee: '175.00', sessions: '12' },
    { id: 'c', code: '90846', fee: '$90', sessions: '4' },
  ],
});
