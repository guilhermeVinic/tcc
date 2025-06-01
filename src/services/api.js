// services/api.js
import axios from "axios";

const API_URL = "http://localhost:3001"; // Ou URL do seu backend

export const fetchAgendamentos = async () => {
  const response = await axios.get(`${API_URL}/agendamentos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT do login
    },
  });
  return response.data;
};  