export const HELPDESK_EMAIL_DOMAIN = 'helpdesk.pt';

export const getEmailUsername = (emailValue) => {
  if (typeof emailValue !== 'string') {
    return '';
  }

  const cleanedEmail = emailValue.trim();
  if (!cleanedEmail) {
    return '';
  }

  return cleanedEmail.split('@')[0] || '';
};

export const buildHelpdeskEmail = (emailValue) => {
  if (typeof emailValue !== 'string') {
    return null;
  }

  const cleanedEmail = emailValue.trim().toLowerCase();
  if (!cleanedEmail) {
    return null;
  }

  const emailParts = cleanedEmail.split('@');

  if (emailParts.length === 1) {
    const localPart = emailParts[0];
    if (!localPart) {
      return null;
    }
    return `${localPart}@${HELPDESK_EMAIL_DOMAIN}`;
  }

  if (emailParts.length !== 2) {
    return null;
  }

  const [localPart, domainPart] = emailParts;

  if (!localPart || domainPart !== HELPDESK_EMAIL_DOMAIN) {
    return null;
  }

  return `${localPart}@${HELPDESK_EMAIL_DOMAIN}`;
};
