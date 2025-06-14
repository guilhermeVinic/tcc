// src/services/api.js
import axios from "axios";
import { API_BASE_URL } from '../api/config'; // Caminho correto para config.js

export const fetchAgendamentos = async (token) => { // Aceita token como parâmetro
  const response = await axios.get(`${API_BASE_URL}/agendamentos`, {
    headers: {
      Authorization: `Bearer ${token}`, // Usa o token passado
    },
  });
  return response.data;
};
