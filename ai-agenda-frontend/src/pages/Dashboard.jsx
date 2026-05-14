// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Users, CheckSquare, BrainCircuit, LogOut, Sparkles, Home, BookOpen, Loader2, Send } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
    // Estado para controlar qué pantalla se ve
    const [activeTab, setActiveTab] = useState('home');

    // Estados para el Planeador IA
    const [grade, setGrade] = useState('');
    const [topic, setTopic] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        } catch (error) {
            console.error("Error cerrando sesión", error);
        }
    };

    // Función que llamará a tu backend para generar la planeación
    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        if (!grade || !topic) return;

        setIsGenerating(true);
        setGeneratedPlan('');

        try {
            // Haremos la petición a Laravel (que luego conectaremos a Gemini)
            const response = await api.post('/api/generate-plan', {
                grade: grade,
                topic: topic
            });

            setGeneratedPlan(response.data.plan);
        } catch (error) {
            console.error(error);
            // Ahora React mostrará el error exacto que viene del Backend o de Google
            const errorMsg = error.response?.data?.details?.error?.message
                || error.response?.data?.message
                || "Hubo un error de conexión.";
            setGeneratedPlan("⚠️ Error: " + errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* ==========================================
                NAVBAR SUPERIOR FLOTANTE
            ========================================== */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm shadow-slate-200/50 rounded-2xl px-6 py-3 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg hidden sm:block">Docente AI</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
                    <NavButton icon={<Home />} text="Inicio" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavButton icon={<BrainCircuit />} text="Planeador IA" isPremium isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* ==========================================
                CONTENIDO PRINCIPAL
            ========================================== */}
            <main className="pt-28 px-4 pb-12 max-w-6xl mx-auto">

                {/* VISTA: INICIO */}
                {activeTab === 'home' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, Maestro 👋</h1>
                            <p className="text-slate-500 mt-1 text-lg">Aquí tienes el resumen de tus clases de hoy.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total de Alumnos" value="0" icon={<Users className="w-6 h-6 text-indigo-500" />} />
                            <StatCard title="Tareas por Revisar" value="0" icon={<CheckSquare className="w-6 h-6 text-amber-500" />} />
                            <StatCard title="Planeaciones IA" value="0" icon={<BrainCircuit className="w-6 h-6 text-cyan-500" />} />
                        </div>
                        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 text-center border-dashed">
                            <p className="text-slate-400">Selecciona una opción del menú para comenzar</p>
                        </div>
                    </div>
                )}

                {/* VISTA: PLANEADOR IA */}
                {activeTab === 'planner' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Columna Izquierda: Formulario */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Asistente IA</h2>
                                    <p className="text-sm text-slate-500">Genera tu clase en segundos</p>
                                </div>
                            </div>

                            <form onSubmit={handleGeneratePlan} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Grado / Nivel</label>
                                    <input
                                        type="text"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        placeholder="Ej. 3ro de Primaria"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tema de la clase</label>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Ej. El ciclo del agua, sus fases y la importancia para el medio ambiente..."
                                        rows="4"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isGenerating || !topic || !grade}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-200"
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Generar Planeación</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Columna Derecha: Resultado */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                    Borrador de Planeación
                                </h3>
                                {generatedPlan && (
                                    <button className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100">
                                        Copiar texto
                                    </button>
                                )}
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                                {!generatedPlan && !isGenerating && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Send className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Escribe un tema a la izquierda para comenzar la magia.</p>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="h-full flex flex-col items-center justify-center text-indigo-500 animate-pulse">
                                        <BrainCircuit className="w-12 h-12 mb-4" />
                                        <p className="font-medium text-slate-600">La IA está estructurando tu clase...</p>
                                    </div>
                                )}

                                {generatedPlan && !isGenerating && (
                                    <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                                        {generatedPlan}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

/* ==========================================
   COMPONENTES DE UI
========================================== */
function NavButton({ icon, text, isActive, onClick, isPremium }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
        >
            {React.cloneElement(icon, { className: 'w-4 h-4' })}
            <span className="hidden sm:inline">{text}</span>
            {isPremium && (
                <span className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full sm:ml-1">PRO</span>
            )}
        </button>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}