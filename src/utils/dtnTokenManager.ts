// DTN Token Management Utility
let dtnToken: string | null = null;

export const setDirectDTNToken = (token: string): void => {
  dtnToken = token;
  localStorage.setItem('dtn_token', token);
  console.log('🔑 DTN Token set successfully');
};

export const getDirectDTNToken = (): string | null => {
  if (dtnToken) return dtnToken;
  
  const stored = localStorage.getItem('dtn_token');
  if (stored) {
    dtnToken = stored;
    return stored;
  }
  
  return null;
};

export const clearDirectDTNToken = (): void => {
  dtnToken = null;
  localStorage.removeItem('dtn_token');
  console.log('🗑️ DTN Token cleared');
};

export const hasValidDTNToken = (): boolean => {
  const token = getDirectDTNToken();
  return token !== null && token.length > 0;
};