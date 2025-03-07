/**
 * Extracts the domain from an email address.
 * 
 * @param email - The email address to extract the domain from
 * @returns The domain part of the email, or null if the email is invalid
 */
export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Suggests an organization name based on a domain.
 * 
 * @param domain - The domain to suggest a name for
 * @returns A suggested organization name
 */
export function suggestOrganizationName(domain: string): string {
  if (!domain) {
    return '';
  }
  
  // Extract the first part of the domain (before the first dot)
  const parts = domain.split('.');
  const name = parts[0];
  
  // Capitalize the first letter of each word
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Checks if an email is valid.
 * 
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 