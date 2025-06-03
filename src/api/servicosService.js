// src/api/servicosService.js
import { API_BASE_URL } from './config';

// Exportação explícita da função getServicos
export const getServicos = async () => {
  const response = await fetch(`${API_BASE_URL}/servicos`);
  if (!response.ok) throw new Error('Erro ao buscar serviços');
  return response.json();
};

// Exportação explícita da função updateServico
export const updateServico = async (id, data, token) => {
  const response = await fetch(`${API_BASE_URL}/servicos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Erro ao atualizar serviço');
  return response.json();
};