// src/pages/Register.jsx
import { useState } from 'react';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validación básica en el frontend
        if (password !== passwordConfirmation) {
            return setError('Las contraseñas no coinciden');
        }

        setIsLoading(true);
        setError('');

        try {
            // 1. Pedir la cookie CSRF por seguridad
            await api.get('/sanctum/csrf-cookie');

            // 2. Enviar los datos al endpoint de registro de Laravel
            const response = await api.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            // 3. Guardar el token y redirigir
            localStorage.setItem('auth_token', response.data.access_token);
            window.location.href = '/dashboard';

        } catch (err) {
            // Extraer mensajes de error de validación de Laravel si existen
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else {
                setError(err.response?.data?.message || 'Error al crear la cuenta');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 my-8">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform hover:-rotate-6 transition-transform">
                        <Sparkles className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
                        Crear Cuenta
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Únete a Docente AI gratis</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {/* Input Nombre */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Tu nombre completo"
                            required
                        />
                    </div>

                    {/* Input Email */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="correo@escuela.edu"
                            required
                        />
                    </div>

                    {/* Input Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Crea una contraseña"
                            required
                            minLength={8}
                        />
                    </div>

                    {/* Input Confirmar Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Confirma tu contraseña"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 mt-2 group"
                    >
                        {isLoading ? 'Creando cuenta...' : 'Comenzar ahora'}
                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-500">¿Ya tienes una cuenta? </span>
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Inicia sesión aquí
                    </Link>
                </div>

            </div>
        </div>
    );
}