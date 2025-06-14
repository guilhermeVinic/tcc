import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authService';
import backgroundImage from '../assets/background.jpg';
import '../components/login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [credenciais, setCredenciais] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login(credenciais.email, credenciais.senha);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Camada de fundo com blur */}
      <div
        className="login-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Camada de gradiente escuro sobre o fundo */}
      <div className="login-overlay"></div>

      {/* Caixa de login */}
      <div className="login-box">
        <img src="/logo.png" alt="CleanWay Logo" className="logo" />
        <h1>Clean Way</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail:</label>
            <input
              type="email"
              value={credenciais.email}
              onChange={(e) => setCredenciais({ ...credenciais, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha:</label>
            <input
              type="password"
              value={credenciais.senha}
              onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Carregando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
