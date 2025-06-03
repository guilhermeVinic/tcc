import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/agendamentos')
      .then((res) => res.json())
      .then((data) => setAgendamentos(data))
      .catch((err) => console.error('Erro ao buscar agendamentos:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.png" alt="CleanWay Logo" className="logo" />
          <h1>Painel de Controle</h1>
        </div>
        <button className="logout-button" onClick={() => navigate('/')}>
          Sair
        </button>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          Controle de Preços
        </button>
      </nav>

      <main className="dashboard-content">
        <section className="card agendamentos-card">
          <h2>Últimos Agendamentos</h2>

          {loading ? (
            <p className="loading-text">Carregando agendamentos...</p>
          ) : agendamentos.length > 0 ? (
            <ul className="agendamentos-list">
              {agendamentos.map(({ id, usuario_id, servico_id, data, horario, status }) => (
                <li key={id} className="agendamento-item">
                  <span><strong>Cliente:</strong> {usuario_id}</span>
                  <span><strong>Serviço:</strong> {servico_id}</span>
                  <span><strong>Data:</strong> {data}</span>
                  <span><strong>Hora:</strong> {horario}</span>
                  <span className={`status ${status.toLowerCase()}`}>{status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Nenhum agendamento encontrado.</p>
          )}
        </section>
      </main>
    </div>
  );
}
