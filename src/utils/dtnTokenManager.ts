// DTN Token Management Utility
let dtnToken: string | null = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUyNDg3MDAyLCJleHAiOjE3NTI1NzM0MDIsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.CApw67WQo3KDz3mnj9foVTY6y1J9tU0pp4zSjHbjvqsIDhhQENx0hnfDVna1hzauGFD9g865Wj84md5eoCRf4k38u9TqvejNMNahg3cPpxLGbXekBx9e389x5PxgHeB7yi00493aUJKGZ1oFE9xF98a5xwpRfleT77G-bhQhEdRz4qjbsr2bZU93nUhVhBOrAuz1pqHbuFSvx3K1ivzKysResJEMbaSGOTlLnXiLcwz0co1f2oTm2qvZ-tV6e9XiSKdJa_BRlVZa0wt7pUD8Uls8e51L4bkHFFkdIvjNC-EA-0uTot39hfNhWdd1xOwP23OdRLV4epScllm_ymhssg";

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