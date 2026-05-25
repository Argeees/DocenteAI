// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import StudentProfile from './pages/StudentProfile';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* La nueva portada pública (Landing Page) */}
        <Route path="/" element={<Landing />} />

        {/* Ruta para iniciar sesión */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ruta principal del profesor */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Si alguien entra a una ruta que no existe, lo mandamos a la página principal */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/students/:id/profile" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;