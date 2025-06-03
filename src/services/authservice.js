export async function login(email, senha) {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no login');
      }
  
      return await response.json(); // deve conter token e dados do usuário
    } catch (err) {
      throw new Error(err.message);
    }
  }
  