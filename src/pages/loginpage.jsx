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
      
      // Salva o token e dados do usuário
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redireciona para dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `linear-gradient(135deg, rgba(30, 136, 229, 0.8), rgba(13, 71, 161, 0.8)), url(${backgroundImage})` }}>
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
              onChange={(e) => setCredenciais({...credenciais, email: e.target.value})}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Senha:</label>
            <input
              type="password"
              value={credenciais.senha}
              onChange={(e) => setCredenciais({...credenciais, senha: e.target.value})}
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