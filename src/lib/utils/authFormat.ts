export const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 3))}@${domain}`;
};

export const normalizeRwandaPhone = (value: string) => value.replace(/\D/g, '');

export const normalizeLoginPhone = (value: string) => {
  const digits = normalizeRwandaPhone(value);
  if (digits.startsWith('250')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
};

export const isValidRwandaPhone = (value: string) => /^07[2389]\d{7}$/.test(normalizeRwandaPhone(value));

export const isValidLoginRwandaPhone = (value: string) => /^7[2389]\d{7}$/.test(normalizeLoginPhone(value));

export const maskPhoneNumber = (phoneNumber: string) => {
  const normalizedPhone = normalizeLoginPhone(phoneNumber);
  return `+250 ${normalizedPhone.slice(0, 3)} *** ${normalizedPhone.slice(-3)}`;
};

