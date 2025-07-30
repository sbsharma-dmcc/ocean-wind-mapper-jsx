// DTN Token Management Utility
let dtnToken: string | null = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUzODI0MjAzLCJleHAiOjE3NTM5MTA2MDMsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.NO7Ujsbyx-Cwv_w9A-gmQ0ZfYQuPWgAfI9vL5YC3x9IhasVWMcIzPxSpO5nJi4os0uXmKQWG2lOdrXRTSe9QCfLj93hirzAiy98a7-n55oCNfrj_EUHzKe0R8OBM48xmBSouOmKXP8hwGwvcicWOpnvzZ366lxJfX1Ue7xdH-xdO54SrVL0_VF-QvXgLzE5AzVOdkTK4BMzUdPj8fY7hJ2sNnpwk8_FiFXebdmZgu0ynwaSSUs7fIoDAUXx8iEb3HYNZ_U_6iIeB9hPZfRV54ooiMmC2YnZiX1Mr73NGEV3_u9ORMmJJNVy2HdZDoaOfTBnyDm116ScMgamSBjpGPA";

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