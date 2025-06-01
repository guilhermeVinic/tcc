// dashboardpage.jsx - Versão modificada
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Cabeçalho com logo */}
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.png" alt="CleanWay Logo" className="logo" />
          <h1>Painel de Controle</h1>
        </div>
        <button 
          className="logout-button"
          onClick={() => navigate('/')}
        >
          Sair
        </button>
      </header>

      {/* Barra de navegação */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-button ${window.location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${window.location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          Controle de Preços
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main className="dashboard-content">
        {/* Seção de Agendamentos */}
        <section className="card agendamentos-card">
          <h2>Últimos Agendamentos</h2>
          <div className="placeholder">
            <p>Agendamentos serão exibidos aqui</p>
          </div>
        </section>
      </main>
    </div>
  );
}