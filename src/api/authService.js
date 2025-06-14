<<<<<<< HEAD
import { API_BASE_URL } from './config'; // Deve importar do config.js na mesma pasta

export const login = async (email, senha) => {
  const response = await fetch(`${API_BASE_URL}/login`, { // Usa a API_BASE_URL para a requisição
=======
import { API_BASE_URL } from './config';

export const login = async (email, senha) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao fazer login: ${text}`);
  }

  return response.json();
};
