require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000; // Define a porta para 5000, lendo do .env
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_para_desenvolvimento'; 

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cleanway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

app.use(cors({
  origin: 'http://localhost:5001', // Permite requisições do frontend na porta 5001
  credentials: true
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pool de conexões
let pool;

// 🗄️ Funções de Inicialização e Criação de Tabelas do Banco de Dados
const initializeDatabase = async () => {
  try {
    const tempConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConn.end();

    pool = mysql.createPool(dbConfig);
    await createTables();
    await seedInitialData();

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1); // Encerra o processo se a conexão com o DB falhar
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

// 🔐 Middlewares de Autenticação e Autorização
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // Anexa o ID do usuário à requisição
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const [user] = await pool.query('SELECT tipo FROM usuarios WHERE id = ?', [req.userId]);

    if (user.length === 0 || user[0].tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissões de administrador:', error);
    res.status(500).json({ error: 'Erro interno ao verificar permissões' });
  }
};

// 🚀 ROTAS DA API 🚀

// 🔐 Rota de Login
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

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

// ➕ Rota para Cadastro de Novo Usuário
app.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = bcrypt.hashSync(senha, 8); // Criptografa a senha
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, telefone || null]
    );

    const newUser = {
      id: result.insertId,
      nome,
      email,
      telefone,
      tipo: 'user'
    };

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário' });
  }
});

// 🧼 Rota para buscar todos os serviços
app.get('/servicos', async (req, res) => {
  try {
    const [servicos] = await pool.query('SELECT * FROM servicos');
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});


// 🔧 Rota para atualizar um serviço (apenas admin)
app.put('/servicos/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { preco, tipo, motivo_promocao } = req.body;

    if (!preco || isNaN(preco)) {
      return res.status(400).json({ error: 'Preço inválido' });
    }

    const [result] = await pool.query(
      `UPDATE servicos SET preco = ?, tipo = ?, motivo_promocao = ? WHERE id = ?`,
      [preco, tipo, motivo_promocao, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const [updated] = await pool.query('SELECT * FROM servicos WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço', message: error.message });
  }
});

// 🗓️ Rota para Criar um Novo Agendamento
app.post('/agendamentos', authenticate, async (req, res) => {
  try {
    const { servico_id, data, horario } = req.body;
    const usuario_id = req.userId; // ID do usuário autenticado

    if (!servico_id || !data || !horario) {
      return res.status(400).json({ error: 'Serviço, data e horário são obrigatórios para o agendamento' });
    }

    // Opcional: Validar formato da data e horário, e se a data/horário são futuros.
    // Exemplo básico de validação de data
    if (isNaN(new Date(data).getTime())) {
      return res.status(400).json({ error: 'Formato de data inválido' });
    }

    // Inserir o agendamento no banco de dados
    const [result] = await pool.query(
      'INSERT INTO agendamentos (usuario_id, servico_id, data, horario, status) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, servico_id, data, horario, 'pendente'] // Status inicial como 'pendente'
    );

    // Retornar o agendamento criado
    res.status(201).json({
      message: 'Agendamento criado com sucesso!',
      agendamentoId: result.insertId,
      usuario_id,
      servico_id,
      data,
      horario,
      status: 'pendente'
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno ao criar agendamento', details: error.message });
  }
});

// 📊 Rota para buscar todos os agendamentos (para o Dashboard)
app.get('/agendamentos', authenticate, async (req, res) => {
  try {
    const [agendamentos] = await pool.query(`
      SELECT
        a.id,
        a.usuario_id,
        u.nome AS usuario_nome,
        a.servico_id,
        s.nome AS servico_nome,
        DATE_FORMAT(a.data, '%d/%m/%Y') AS data_formatada,
        TIME_FORMAT(a.horario, '%H:%i') AS horario_formatado,
        a.status,
        a.created_at
      FROM agendamentos AS a
      JOIN usuarios AS u ON a.usuario_id = u.id
      JOIN servicos AS s ON a.servico_id = s.id
      ORDER BY a.data DESC, a.horario DESC;
    `);
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Inicia o servidor e o banco de dados
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`🌐 Endpoints disponíveis:`);
    console.log(`   - Login: http://localhost:${port}/login [POST]`);
    console.log(`   - Cadastro: http://localhost:${port}/register [POST]`);
    console.log(`   - Serviços: http://localhost:${port}/servicos [GET]`);
    console.log(`   - Atualizar Serviço: http://localhost:${port}/servicos/:id [PUT] (Admin)`);
    console.log(`   - Criar Agendamento: http://localhost:${port}/agendamentos [POST] (Autenticado)`);
    console.log(`   - Listar Agendamentos: http://localhost:${port}/agendamentos [GET] (Autenticado)`);
  });
});
