import { extractDomain, suggestOrganizationName, isValidEmail } from '../domainUtils';

describe('extractDomain', () => {
  it('should extract domain from valid email', () => {
    expect(extractDomain('user@example.com')).toBe('example.com');
    expect(extractDomain('another.user@sub.domain.co.uk')).toBe('sub.domain.co.uk');
  });

  it('should return null for invalid emails', () => {
    expect(extractDomain('invalid-email')).toBeNull();
    expect(extractDomain('')).toBeNull();
    expect(extractDomain('user@')).toBeNull();
    expect(extractDomain('@domain.com')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(extractDomain('user@localhost')).toBe('localhost');
    expect(extractDomain(null as unknown as string)).toBeNull();
    expect(extractDomain(undefined as unknown as string)).toBeNull();
  });
});

describe('suggestOrganizationName', () => {
  it('should suggest organization name from domain', () => {
    expect(suggestOrganizationName('example.com')).toBe('Example');
    expect(suggestOrganizationName('acme.co.uk')).toBe('Acme');
    expect(suggestOrganizationName('my-company.io')).toBe('My-company');
  });

  it('should handle domains without TLD', () => {
    expect(suggestOrganizationName('localhost')).toBe('localhost');
    expect(suggestOrganizationName('intranet')).toBe('intranet');
  });

  it('should handle edge cases', () => {
    expect(suggestOrganizationName('')).toBe('');
    expect(suggestOrganizationName(null as unknown as string)).toBe('');
    expect(suggestOrganizationName(undefined as unknown as string)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(true); // Note: This is technically valid by our regex
  });

  it('should handle edge cases', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
}); 