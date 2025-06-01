require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_para_desenvolvimento';

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cleanway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Middlewares
app.use(cors({
  origin: 'http://localhost:3001', // Altere para a porta do seu frontend
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Garante que todas as respostas sejam JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Pool de conexões
let pool;

// Funções auxiliares
const initializeDatabase = async () => {
  try {
    // Cria conexão temporária para criar o banco se não existir
    const tempConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConn.end();

    // Cria pool de conexões principal
    pool = mysql.createPool(dbConfig);

    // Cria tabelas
    await createTables();
    await seedInitialData();

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      telefone VARCHAR(20),
      tipo ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS servicos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      preco DECIMAL(10,2) NOT NULL,
      duracao VARCHAR(50) NOT NULL,
      tipo ENUM('fixo', 'promocao') DEFAULT 'fixo',
      motivo_promocao VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      servico_id INT NOT NULL,
      data DATE NOT NULL,
      horario TIME NOT NULL,
      status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (servico_id) REFERENCES servicos(id)
    )`
  ];

  for (const query of queries) {
    await pool.query(query);
  }
};

const seedInitialData = async () => {
  const [users] = await pool.query('SELECT * FROM usuarios LIMIT 1');

  if (users.length === 0) {
    const senhaAdmin = bcrypt.hashSync('admin123', 8);
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'admin@cleanway.com', senhaAdmin, '11999999999', 'admin']
    );

    await pool.query(`
      INSERT INTO servicos (nome, preco, duracao, tipo) VALUES 
      ('Lavagem Simples', 30.00, '30 minutos', 'fixo'),
      ('Lavagem Completa', 50.00, '1 hora', 'fixo'),
      ('Lavagem Premium', 80.00, '1.5 horas', 'fixo')
    `);
  }
};

// Middlewares customizados
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const [user] = await pool.query(
      'SELECT tipo FROM usuarios WHERE id = ?',
      [req.userId]
    );

    if (user[0].tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Rotas de Autenticação
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const validPassword = bcrypt.compareSync(senha, user.senha);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas de Serviços
app.get('/servicos', async (req, res) => {
  try {
    const [servicos] = await pool.query('SELECT * FROM servicos');
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.put('/servicos/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { preco, tipo, motivo_promocao } = req.body;

    // Validação básica
    if (!preco || isNaN(preco)) {
      return res.status(400).json({ error: 'Preço inválido' });
    }

    console.log(`Atualizando serviço ${id} com:`, { preco, tipo, motivo_promocao });

    const [result] = await pool.query(
      `UPDATE servicos 
       SET preco = ?, tipo = ?, motivo_promocao = ?
       WHERE id = ?`,
      [preco, tipo, motivo_promocao, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Retorna o serviço atualizado
    const [updatedService] = await pool.query(
      'SELECT * FROM servicos WHERE id = ?',
      [id]
    );

    res.json(updatedService[0]);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar serviço',
      message: error.message 
    });
  }
});

// Inicialização do servidor
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`📌 Endpoint de serviços: http://localhost:${port}/servicos`);
  });
});