/**
 * Public legal / company identity — safe for client bundles.
 * Defaults sourced from Vera IT Impressum (https://verait.de/legal/impressum).
 * Hansala contact email is info@hansala.com; env can override any field.
 */

export type LegalFieldKey =
  | "entityName"
  | "address"
  | "country"
  | "registrationNumber";

export type LegalCompany = {
  brand: string;
  entityName: string | null;
  address: string | null;
  country: string | null;
  /** Register court / number as published — no HRB on source impressum. */
  registrationNumber: string | null;
  vatId: string | null;
  phone: string | null;
  contactEmail: string;
  privacyEmail: string;
  securityEmail: string;
  founderName: string | null;
  founderRole: string | null;
};

/** Public facts from Vera IT Impressum (June 2026). */
const DEFAULTS = {
  entityName: "Vera IT",
  address: "Rehrstieg 16d, 21147 Hamburg",
  country: "Germany",
  registrationNumber: "Amtsgericht Hamburg",
  vatId: "DE456074487",
  phone: "+49 155 63740470",
  contactEmail: "info@hansala.com",
  securityEmail: "security@hansala.com",
  founderName: "Jovica Mihajlovic",
  founderRole: "Managing Director",
} as const;

const REQUIRED: LegalFieldKey[] = [
  "entityName",
  "address",
  "country",
  "registrationNumber",
];

function pub(name: string): string | null {
  const value = process.env[`NEXT_PUBLIC_${name}`]?.trim();
  return value || null;
}

export function getLegalCompany(): LegalCompany {
  const contact = pub("LEGAL_CONTACT_EMAIL") ?? DEFAULTS.contactEmail;
  return {
    brand: "Hansala",
    entityName: pub("LEGAL_ENTITY_NAME") ?? DEFAULTS.entityName,
    address: pub("LEGAL_ADDRESS") ?? DEFAULTS.address,
    country: pub("LEGAL_COUNTRY") ?? DEFAULTS.country,
    registrationNumber:
      pub("LEGAL_REGISTRATION_NUMBER") ?? DEFAULTS.registrationNumber,
    vatId: pub("LEGAL_VAT_ID") ?? DEFAULTS.vatId,
    phone: pub("LEGAL_PHONE") ?? DEFAULTS.phone,
    contactEmail: contact,
    privacyEmail: pub("LEGAL_PRIVACY_EMAIL") ?? contact,
    securityEmail: pub("LEGAL_SECURITY_EMAIL") ?? DEFAULTS.securityEmail,
    founderName: pub("LEGAL_FOUNDER_NAME") ?? DEFAULTS.founderName,
    founderRole: pub("LEGAL_FOUNDER_ROLE") ?? DEFAULTS.founderRole,
  };
}

export function missingLegalFields(company = getLegalCompany()): LegalFieldKey[] {
  return REQUIRED.filter((key) => !company[key]);
}

export function isLegalComplete(company = getLegalCompany()): boolean {
  return missingLegalFields(company).length === 0;
}

export function legalCopyrightName(company = getLegalCompany()): string {
  return company.entityName ?? company.brand;
}
