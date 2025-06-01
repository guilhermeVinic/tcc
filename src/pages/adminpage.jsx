import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServicos, updateServico } from '../api/servicosService';
import { useAuth } from '../authContext';
import '../components/admin.css';


export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verifica autenticação ao carregar a página
  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      navigate('/');
      return;
    }

    const fetchServicos = async () => {
      try {
        const data = await getServicos();
        const servicosFormatados = data.map(servico => ({
          ...servico,
          tipo: servico.tipo || 'fixo',
          motivoPromocao: servico.motivo_promocao || ''
        }));
        setServicos(servicosFormatados);
      } catch (err) {
        setError('Erro ao carregar serviços: ' + err.message);
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

  const toggleTipoServico = (id, novoTipo) => {
    setServicos(servicos.map(servico =>
      servico.id === id ? {
        ...servico,
        tipo: novoTipo,
        motivoPromocao: novoTipo === 'promocao' ? servico.motivoPromocao : ''
      } : servico
    ));
  };

  const salvarPrecos = async () => {
    try {
      setLoading(true);
      setError('');

      // Verificação crítica do token
      if (!user?.token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Filtra apenas serviços modificados
      const servicosParaAtualizar = servicos.filter(servico => 
        servico.tipo === 'promocao' || servico.motivoPromocao !== ''
      );

      // Atualiza cada serviço
      await Promise.all(
        servicosParaAtualizar.map(servico =>
          updateServico(
            servico.id,
            {
              preco: servico.preco,
              tipo: servico.tipo,
              motivo_promocao: servico.tipo === 'promocao' ? servico.motivoPromocao : null
            },
            user.token // Token garantido pela verificação
          )
        )
      );

      alert('Preços atualizados com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Sessão expirada')) {
        navigate('/'); // Redireciona para login se token for inválido
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando serviços...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          ← Voltar
        </button>
        <h1>Controle de Preços</h1>
        <button 
          className="save-button" 
          onClick={salvarPrecos} 
          disabled={loading || !user?.token}
        >
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
                disabled={loading}
              />
            </div>
            <div className="price-actions">
              <button
                className={`price-type ${servico.tipo === 'fixo' ? 'active' : ''}`}
                onClick={() => toggleTipoServico(servico.id, 'fixo')}
                disabled={loading}
              >
                Fixo
              </button>
              <button
                className={`price-type ${servico.tipo === 'promocao' ? 'active' : ''}`}
                onClick={() => toggleTipoServico(servico.id, 'promocao')}
                disabled={loading}
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
                  disabled={loading}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}