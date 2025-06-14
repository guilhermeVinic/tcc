import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { getServicos, updateServico } from '../api/servicosService';
import '../components/admin.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      navigate('/');
      return;
    }

    const fetchServicos = async () => {
      try {
        const data = await getServicos();
        setServicos(data.map(servico => ({
          ...servico,
          tipo: servico.tipo || 'fixo',
          motivoPromocao: servico.motivo_promocao || ''
        })));
      } catch (err) {
        setError('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
  }, [user, navigate]);

  const handlePrecoChange = (id, novoPreco) => {
    setServicos(servicos.map(servico =>
      servico.id === id ? { ...servico, preco: parseFloat(novoPreco) } : servico
    ));
  };

  const handleMotivoChange = (id, motivo) => {
    setServicos(servicos.map(servico =>
      servico.id === id ? { ...servico, motivoPromocao: motivo } : servico
    ));
  };

  const toggleTipo = (id, novoTipo) => {
    setServicos(servicos.map(servico =>
      servico.id === id ? {
        ...servico,
        tipo: novoTipo,
        motivoPromocao: novoTipo === 'promocao' ? servico.motivoPromocao : ''
      } : servico
    ));
  };

  const salvar = async () => {
    try {
      setLoading(true);
      for (const servico of servicos) {
        await updateServico(servico.id, {
          preco: servico.preco,
          tipo: servico.tipo,
          motivo_promocao: servico.tipo === 'promocao' ? servico.motivoPromocao : null
        }, user.token);
      }
      alert('Serviços atualizados!');
    } catch (err) {
      alert('Erro ao atualizar serviços.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando serviços...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <div className="logo-area">
          <h1>Sistema de Agendamento</h1>
        </div>
        <button className="save-button" onClick={salvar} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </header>

      <div className="price-controls">
        {servicos.map(servico => (
          <div key={servico.id} className="service-card">
            <h3>{servico.nome}</h3>
            <div className="price-input-group">
              <span>R$</span>
              <input
                type="number"
                value={servico.preco}
                onChange={(e) => handlePrecoChange(servico.id, e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="price-actions">
              <button
                className={`price-type ${servico.tipo === 'fixo' ? 'active' : ''}`}
                onClick={() => toggleTipo(servico.id, 'fixo')}
              >
                Fixo
              </button>
              <button
                className={`price-type ${servico.tipo === 'promocao' ? 'active' : ''}`}
                onClick={() => toggleTipo(servico.id, 'promocao')}
              >
                Promoção
              </button>
            </div>
            {servico.tipo === 'promocao' && (
              <div className="promo-reason-group">
                <label>Motivo da Promoção:</label>
                <input
                  type="text"
                  value={servico.motivoPromocao}
                  onChange={(e) => handleMotivoChange(servico.id, e.target.value)}
                  placeholder="Ex: Black Friday, Feriado..."
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
