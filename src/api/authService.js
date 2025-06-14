// src/api/authService.js
import { API_BASE_URL } from './config'; // Deve importar de src/api/config.js

export const login = async (email, senha) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  if (!response.ok) {
    const text = await response.text(); // Captura o texto da resposta de erro
    throw new Error(`Erro ao fazer login: ${text}`);
  }

  return response.json();
};
