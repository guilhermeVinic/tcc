// src/api/servicosService.js
import { API_BASE_URL } from './config.js';

export const updateServico = async (id, data, token) => {
  try {
    const endpoint = `${API_BASE_URL}/servicos/${id}`;
    console.log('Enviando para:', endpoint); // Log para depuração
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    // Verifica primeiro o status da resposta
    if (response.status === 401) {
      throw new Error('Não autorizado - faça login novamente');
    }

    if (response.status === 404) {
      throw new Error('Endpoint não encontrado - verifique a URL da API');
    }

    const textResponse = await response.text();
    
    // Tenta parsear apenas se for JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      if (!response.ok) {
        throw new Error(jsonResponse.message || `Erro ${response.status}`);
      }
      return jsonResponse;
    } catch {
      throw new Error(`Resposta inválida: ${textResponse.substring(0, 100)}`);
    }

  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      endpoint: `${API_BASE_URL}/servicos/${id}`,
      data
    });
    throw new Error(`Falha na comunicação com o servidor: ${error.message}`);
  }
};