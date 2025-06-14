import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
import { fetchAgendamentos } from '../services/api';
import { useAuth } from '../authContext';
import '../components/dashboard.css'; // Mantenha seu CSS personalizado
=======
import '../components/dashboard.css';
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const { user, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getAgendamentos = async () => {
      if (!user || !user.token) {
        navigate('/');
        return;
      }
      try {
        setLoading(true);
        setError('');
        const data = await fetchAgendamentos(user.token);
        setAgendamentos(data);
      } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
        setError('Erro ao carregar agendamentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    getAgendamentos();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
=======
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/agendamentos')
      .then((res) => res.json())
      .then((data) => setAgendamentos(data))
      .catch((err) => console.error('Erro ao buscar agendamentos:', err))
      .finally(() => setLoading(false));
  }, []);
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.png" alt="CleanWay Logo" className="logo" />
          <h1>Painel de Controle</h1>
        </div>
<<<<<<< HEAD
        <button className="logout-button" onClick={handleLogout}>
=======
        <button className="logout-button" onClick={() => navigate('/')}>
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd
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
<<<<<<< HEAD
        {user && user.tipo === 'admin' && (
          <button
            className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Controle de Preços
          </button>
        )}
=======
        <button
          className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          Controle de Preços
        </button>
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd
      </nav>

      <main className="dashboard-content">
        <section className="card agendamentos-card">
          <h2>Últimos Agendamentos</h2>

          {loading ? (
            <p className="loading-text">Carregando agendamentos...</p>
<<<<<<< HEAD
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : agendamentos.length > 0 ? (
            <ul className="agendamentos-list">
              {agendamentos.map(({ id, usuario_nome, servico_nome, data_formatada, horario_formatado, status }) => (
                <li key={id} className="agendamento-item">
                  {/* Usando os campos formatados do backend e aplicando negrito */}
                  <span><strong>Cliente:</strong> {usuario_nome}</span>
                  <span><strong>Serviço:</strong> {servico_nome}</span>
                  <span><strong>Data:</strong> {data_formatada}</span> {/* Usando data_formatada */}
                  <span><strong>Hora:</strong> {horario_formatado}</span> {/* Usando horario_formatado */}
=======
          ) : agendamentos.length > 0 ? (
            <ul className="agendamentos-list">
              {agendamentos.map(({ id, usuario_id, servico_id, data, horario, status }) => (
                <li key={id} className="agendamento-item">
                  <span><strong>Cliente:</strong> {usuario_id}</span>
                  <span><strong>Serviço:</strong> {servico_id}</span>
                  <span><strong>Data:</strong> {data}</span>
                  <span><strong>Hora:</strong> {horario}</span>
>>>>>>> d3f6a164166995246e37ffc2045b21292de905dd
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
