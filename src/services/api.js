<<<<<<< HEAD
// src/services/api.js
import axios from "axios";
import { API_BASE_URL } from '../api/config'; ; // <-- CORREÇÃO AQUI: Suba para 'src' e desça para 'api/config'

export const fetchAgendamentos = async (token) => { // Aceita token como parâmetro
  const response = await axios.get(`${API_BASE_URL}/agendamentos`, {
    headers: {
      Authorization: `Bearer ${token}`, // Usa o token passado
    },
  });
  return response.data;
};
=======
// services/api.js
import axios from "axios";

const API_URL = "http://localhost:3000";
 // Ou URL do seu backend

export const fetchAgendamentos = async () => {
  const response = await axios.get(`${API_URL}/agendamentos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT do login
    },
  });
  return response.data;
};  
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd
