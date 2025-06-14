// src/api/servicosService.js
import { API_BASE_URL } from './config'; // Caminho relativo correto para config.js na mesma pasta

// Exportação explícita da função getServicos
export const getServicos = async () => {
  const response = await fetch(`${API_BASE_URL}/servicos`);
  if (!response.ok) {
    const errorText = await response.text(); // Captura o corpo da resposta para mais detalhes
    throw new Error(`Erro ao buscar serviços: ${response.status} ${response.statusText} - ${errorText}`);
  }
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
  if (!response.ok) {
    const errorText = await response.text(); // Captura o corpo da resposta para mais detalhes
    throw new Error(`Erro ao atualizar serviço: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};
