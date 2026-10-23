/* ==========================================================================
   Good Faith Estimate: every piece of legal wording the PDF prints, in one place.

   The disclaimer paragraphs are copied word for word from the CMS standard form "Good Faith Estimate for Health Care Items and Services"
   (Appendix 2, OMB 0938-1433), page "Disclaimer". `npm run gfe:legal` writes this file's content to docs/gfe-legal-wording.md so it can be
   checked by a lawyer or compliance adviser without reading code. Change the wording here only, then run that script.
   ========================================================================== */

export const GFE_TITLE = 'Good Faith Estimate for Health Care Items and Services';

/** The CMS disclaimer, paragraph by paragraph. `bold` paragraphs are printed in bold, as on the CMS form. */
export const DISCLAIMER_HEADING = 'Disclaimer';
export const DISCLAIMER: { text: string; bold?: boolean }[] = [
  {
    text: 'This Good Faith Estimate shows the costs of items and services that are reasonably expected for your health care needs for an item or service. The estimate is based on information known at the time the estimate was created.',
  },
  {
    text: 'The Good Faith Estimate does not include any unknown or unexpected costs that may arise during treatment. You could be charged more if complications or special circumstances occur. If this happens, and your bill is $400 or more for any provider or facility than your Good Faith Estimate for that provider or facility, federal law allows you to dispute the bill.',
  },
  {
    text: 'The Good Faith Estimate is not a contract and does not require the uninsured (or self-pay) individual to obtain the items or services from any of the providers or facilities identified in the Good Faith Estimate.',
  },
  { text: 'If you are billed for more than this Good Faith Estimate, you may have the right to dispute the bill.', bold: true },
  {
    text: 'You may contact the health care provider or facility listed to let them know the billed charges are higher than the Good Faith Estimate. You can ask them to update the bill to match the Good Faith Estimate, ask to negotiate the bill, or ask if there is financial assistance available.',
  },
  {
    text: 'You may also start a dispute resolution process with the U.S. Department of Health and Human Services (HHS). If you choose to use the dispute resolution process, you must start the dispute process within 120 calendar days (about 4 months) of the date on the original bill.',
  },
  {
    text: 'If you dispute your bill, the provider or facility cannot move the bill for the disputed item or service into collection or threaten to do so, or if the bill has already moved into collection, the provider or facility has to cease collection efforts. The provider or facility must also suspend the accrual of any late fees on unpaid bill amounts until after the dispute resolution process has concluded. The provider or facility cannot take or threaten to take any retributive action against you for disputing your bill.',
  },
  {
    text: 'There is a $25 fee to use the dispute process. If the Selected Dispute Resolution (SDR) entity reviewing your dispute agrees with you, you will have to pay the price on this Good Faith Estimate, reduced by the $25 fee. If the SDR entity disagrees with you and agrees with the health care provider or facility, you will have to pay the higher amount.',
  },
  { text: 'To learn more and get a form to start the process, go to www.cms.gov/nosurprises/consumers or call 1-800-985-3059.' },
  {
    text: 'For questions or more information about your right to a Good Faith Estimate or the dispute process, visit www.cms.gov/nosurprises/consumers, email FederalPPDRQuestions@cms.hhs.gov, or call 1-800-985-3059.',
  },
  {
    text: 'Keep a copy of this Good Faith Estimate in a safe place or take pictures of it. You may need it if you are billed a higher amount.',
    bold: true,
  },
];

/** Printed under the services table when any service repeats (more than one session). From the CMS form's instructions for recurring items. */
export const VALID_12_MONTHS = 'The estimated costs are valid for 12 months from the date of the Good Faith Estimate.';

/** The CMS form's lead-in to the itemized list, with the primary service and dates filled in by the generator. */
export const DETAIL_INTRO = (primary: string, firstDate: string) =>
  `The following is a detailed list of expected charges for ${primary}, scheduled for ${firstDate}.`;

/** The CMS form's wording for items booked with someone else. The generator prints it so the client knows other providers give their own estimates. */
export const SEPARATE_PROVIDERS_HEADING = 'Health Care Items/Services Expected to Be Separately Scheduled with Another Provider or Facility';
export const SEPARATE_PROVIDERS_NOTE =
  'None. This estimate covers only the services listed above, from the provider named above. If you are later referred to another provider or facility for other items or services, that provider or facility will issue its own good faith estimate upon scheduling or upon request.';

/** Our own wording, not from the CMS form. Kept short and plain. */
export const SELF_PAY_NOTE =
  'This estimate is for a client who is not using health insurance for these services (a self-pay client).';
export const DIAGNOSIS_NOTE = 'Diagnosis code (if applicable)';
export const FOOTER_LINE = 'Generated with the free GFE tool from wwisermind.com';
export const OFFICIAL_FORM_NOTE =
  'Layout follows the CMS standard form "Good Faith Estimate for Health Care Items and Services" (OMB 0938-1433).';
