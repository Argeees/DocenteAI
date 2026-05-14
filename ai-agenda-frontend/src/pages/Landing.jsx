// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, CheckCircle2, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* ==========================================
                NAVBAR PÚBLICA
            ========================================== */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-xl tracking-tight">Docente AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Este botón se queda en /login */}
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Iniciar Sesión
                        </Link>
                        {/* Cambiado a /register */}
                        <Link to="/register" className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20">
                            Pruébalo Gratis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ==========================================
                HERO SECTION
            ========================================== */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl -z-10 opacity-50"></div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>La nueva era de la gestión escolar</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                        Tu agenda docente, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                            potenciada por Inteligencia Artificial.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Centraliza alumnos, calificaciones y asistencia. Deja que nuestra IA genere los borradores de tus planeaciones mientras tú mantienes el control total.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* Cambiado a /register */}
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 group">
                            Comenzar ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-colors">
                            Ver funciones
                        </a>
                    </div>
                </div>
            </section>

            {/* ==========================================
                FEATURES SECTION
            ========================================== */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Todo lo que necesitas en un solo lugar</h2>
                        <p className="mt-4 text-lg text-slate-500">Diseñado para evitar duplicidad de trabajo y errores manuales.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<LayoutDashboard className="w-6 h-6 text-indigo-600" />}
                            title="Control Centralizado"
                            description="Maneja tus listas de alumnos, registro de asistencia y control de tareas por fecha. Todo organizado y sin pérdida de datos."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-500" />}
                            title="Cálculos Automáticos"
                            description="Olvídate de Excel. El sistema calcula promedios al instante y genera reportes rápidos por alumno con un par de clics."
                        />
                        <FeatureCard
                            icon={<BrainCircuit className="w-6 h-6 text-cyan-500" />}
                            title="Planeaciones con IA"
                            description="Ingresa el tema y grado. La IA te dará un borrador estructurado en segundos para que tú lo edites y perfecciones."
                        />
                    </div>
                </div>
            </section>

            {/* ==========================================
                PRICING (FREEMIUM)
            ========================================== */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Precios simples y transparentes</h2>
                        <p className="mt-4 text-lg text-slate-500">Comienza gratis y mejora cuando necesites el poder de la IA.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Plan Gratis */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Básico</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900">$0</span>
                                <span className="text-slate-500 font-medium">/para siempre</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <PricingItem text="Gestión de alumnos ilimitada" />
                                <PricingItem text="Control de asistencia" />
                                <PricingItem text="Registro de tareas y calificaciones" />
                                <PricingItem text="Cálculo de promedios automáticos" />
                            </ul>
                            {/* Cambiado a /register */}
                            <Link to="/register" className="block w-full py-3 px-4 bg-slate-100 text-slate-900 font-semibold text-center rounded-xl hover:bg-slate-200 transition-colors">
                                Empieza Gratis
                            </Link>
                        </div>

                        {/* Plan PRO */}
                        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                RECOMENDADO
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Docente PRO</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">$4</span>
                                <span className="text-slate-400 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-slate-300">
                                <PricingItem text="Todo lo del plan Básico" light />
                                <PricingItem text="Generador de planeaciones con IA" light />
                                <PricingItem text="Exportación a PDF y reportes" light />
                                <PricingItem text="Soporte prioritario" light />
                            </ul>
                            {/* Cambiado a /register */}
                            <Link to="/register" className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-center rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                Desbloquear IA
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ==========================================
   COMPONENTES AUXILIARES
========================================== */
function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}

function PricingItem({ text, light = false }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${light ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span className={light ? 'text-slate-300' : 'text-slate-600'}>{text}</span>
        </li>
    );
}