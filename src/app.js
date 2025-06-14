// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './authContext'; // Adicione useAuth aqui
import LoginPage from './pages/loginpage';
import DashboardPage from './pages/dashboardpage';
import AdminPage from './pages/adminpage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Componente para proteger rotas
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminOnly && user.tipo !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default App;