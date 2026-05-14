// src/pages/Login.jsx
import { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post('/api/login', { email, password });
            localStorage.setItem('auth_token', response.data.access_token);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform hover:rotate-6 transition-transform">
                        <Sparkles className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
                        Docente AI
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Automatiza tu planeación hoy</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
                            {error}
                        </div>
                    )}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="correo@escuela.edu"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Tu contraseña"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 group"
                    >
                        {isLoading ? 'Conectando...' : 'Entrar a mi escritorio'}
                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}