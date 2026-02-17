export interface VCardData {
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
}

export function generateVCardString(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName}`,
  ];

  if (data.jobTitle) lines.push(`TITLE:${data.jobTitle}`);
  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.address) lines.push(`ADR;TYPE=WORK:;;${data.address}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
