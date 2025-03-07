import { extractDomain, suggestOrganizationName, isValidEmail } from '../domainUtils';

describe('extractDomain', () => {
  it('should extract domain from a valid email', () => {
    expect(extractDomain('user@example.com')).toBe('example.com');
    expect(extractDomain('john.doe@company.co.uk')).toBe('company.co.uk');
    expect(extractDomain('info@sub.domain.org')).toBe('sub.domain.org');
  });

  it('should return null for invalid emails', () => {
    expect(extractDomain('invalid-email')).toBeNull();
    expect(extractDomain('user@')).toBeNull();
    expect(extractDomain('@domain.com')).toBeNull();
    expect(extractDomain('')).toBeNull();
    expect(extractDomain(null as any)).toBeNull();
    expect(extractDomain(undefined as any)).toBeNull();
  });
});

describe('suggestOrganizationName', () => {
  it('should suggest organization name based on domain', () => {
    expect(suggestOrganizationName('example.com')).toBe('Example');
    expect(suggestOrganizationName('my-company.co.uk')).toBe('My Company');
    expect(suggestOrganizationName('cool_startup.io')).toBe('Cool Startup');
  });

  it('should handle empty or invalid domains', () => {
    expect(suggestOrganizationName('')).toBe('');
    expect(suggestOrganizationName(null as any)).toBe('');
    expect(suggestOrganizationName(undefined as any)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
    expect(isValidEmail('info+tag@sub.domain.org')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });
}); 