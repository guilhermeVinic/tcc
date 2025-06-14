import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAgendamentos } from '../services/api';
import { useAuth } from '../authContext';
import '../components/dashboard.css'; // Mantenha seu CSS personalizado

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.png" alt="CleanWay Logo" className="logo" />
          <h1>Painel de Controle</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
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
        {user && user.tipo === 'admin' && (
          <button
            className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Controle de Preços
          </button>
        )}
      </nav>

      <main className="dashboard-content">
        <section className="card agendamentos-card">
          <h2>Últimos Agendamentos</h2>

          {loading ? (
            <p className="loading-text">Carregando agendamentos...</p>
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
