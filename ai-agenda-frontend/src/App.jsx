// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import StudentProfile from './pages/StudentProfile';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider> {/* ¡El envoltorio va aquí arriba! */}
      <Router>
        <Toaster richColors position="top-right" /> {/* Muevo el Toaster aquí para que funcione en todas partes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students/:id/profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;