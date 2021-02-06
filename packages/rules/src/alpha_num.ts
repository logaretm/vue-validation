import { alphanumeric, getLocale } from './alpha_helper';

const alphaNumValidator = (value: unknown, params?: [string] | { locale?: string }): boolean => {
  const locale = getLocale(params);
  if (Array.isArray(value)) {
    return value.every(val => alphaNumValidator(val, { locale }));
  }

  const valueAsString = String(value);
  // Match at least one locale.
  if (!locale) {
    return Object.keys(alphanumeric).some(loc => alphanumeric[loc].test(valueAsString));
  }

  return (alphanumeric[locale] || alphanumeric.en).test(valueAsString);
};

export default alphaNumValidator;
