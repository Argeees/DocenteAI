// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, BrainCircuit, LogOut, Sparkles, Home, BookOpen, Loader2, Send, UserPlus, X, Edit2, Trash2, Save, Archive, Library, Plus, GraduationCap, ArrowLeft, ClipboardEdit } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('home');

    // ==========================================
    // ESTADOS
    // ==========================================
    // IA y Agenda
    const [grade, setGrade] = useState('');
    const [topic, setTopic] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedPlans, setSavedPlans] = useState([]);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    // Alumnos
    const [students, setStudents] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ first_name: '', last_name: '', identifier: '' });
    const [editingId, setEditingId] = useState(null);

    // Materias
    const [subjects, setSubjects] = useState([]);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', color: '#4f46e5' });
    const [editingSubjectId, setEditingSubjectId] = useState(null);

    // Matriculación
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Calificaciones
    const [currentGradeSubject, setCurrentGradeSubject] = useState(null);
    const [gradeTaskName, setGradeTaskName] = useState('');
    const [studentScores, setStudentScores] = useState({});
    const [isSavingGrades, setIsSavingGrades] = useState(false);

    // Tareas / Pendientes
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSavingTask, setIsSavingTask] = useState(false);

    // ==========================================
    // EFECTOS DE CARGA Y FETCH ULTRA-SEGUROS
    // ==========================================
    useEffect(() => {
        if (activeTab === 'home' || activeTab === 'students' || activeTab === 'subjects') fetchStudents();
        if (activeTab === 'home' || activeTab === 'agenda') fetchPlans();
        if (activeTab === 'home' || activeTab === 'subjects') fetchSubjects();
        if (activeTab === 'home') fetchTasks();
    }, [activeTab]);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/api/students');
            const data = response.data?.data || response.data;
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) { setStudents([]); }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/api/subjects');
            const data = response.data?.data || response.data;
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) { setSubjects([]); }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/api/lesson-plans');
            const data = response.data?.data || response.data;
            setSavedPlans(Array.isArray(data) ? data : []);
        } catch (error) { setSavedPlans([]); }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get('/api/tasks');
            const data = response.data?.data || response.data;
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) { setTasks([]); }
    };

    // ==========================================
    // FUNCIONES: TAREAS / PENDIENTES
    // ==========================================
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        setIsSavingTask(true);
        try {
            await api.post('/api/tasks', { title: newTaskTitle });
            setNewTaskTitle('');
            fetchTasks();
        } catch (error) { console.error("Error creando tarea", error); }
        finally { setIsSavingTask(false); }
    };

    const handleToggleTask = async (task) => {
        try {
            await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });
            fetchTasks();
        } catch (error) { console.error("Error actualizando tarea", error); }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/api/tasks/${id}`);
            fetchTasks();
        } catch (error) { console.error("Error eliminando tarea", error); }
    };

    // ==========================================
    // FUNCIONES: CALIFICACIONES
    // ==========================================
    const openGradebook = (subject) => {
        setCurrentGradeSubject(subject);
        setGradeTaskName('');
        setStudentScores({});
        setActiveTab('gradebook');
    };

    const handleSaveGrades = async (e) => {
        e.preventDefault();
        const validScores = Object.entries(studentScores).filter(([id, score]) => score !== '');

        if (validScores.length === 0) {
            alert("Por favor ingresa al menos una calificación antes de guardar.");
            return;
        }

        setIsSavingGrades(true);
        try {
            const promises = validScores.map(([studentId, score]) => {
                return api.post(`/api/subjects/${currentGradeSubject.id}/grades`, {
                    student_id: studentId,
                    description: gradeTaskName,
                    score: parseFloat(score)
                });
            });

            await Promise.all(promises);
            alert(`¡Se guardaron ${validScores.length} calificaciones exitosamente!`);
            setStudentScores({});
            setGradeTaskName('');
            setActiveTab('subjects');
        } catch (error) {
            console.error("Error guardando calificaciones", error);
            alert("Hubo un error al guardar las calificaciones.");
        } finally {
            setIsSavingGrades(false);
        }
    };

    // ==========================================
    // FUNCIONES: MATRICULACIÓN
    // ==========================================
    const openEnrollModal = (subject) => {
        setSelectedSubject(subject);
        const enrolledIds = subject.students ? subject.students.map(s => s.id) : [];
        setSelectedStudentIds(enrolledIds);
        setShowEnrollModal(true);
    };

    const handleToggleStudent = (studentId) => {
        setSelectedStudentIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
    };

    const handleSaveEnrollment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/subjects/${selectedSubject.id}/students`, { student_ids: selectedStudentIds });
            setShowEnrollModal(false);
            fetchSubjects();
        } catch (error) { console.error("Error guardando matriculación", error); }
    };

    // ==========================================
    // FUNCIONES: MATERIAS 
    // ==========================================
    const handleSaveSubject = async (e) => {
        e.preventDefault();
        try {
            if (editingSubjectId) await api.put(`/api/subjects/${editingSubjectId}`, newSubject);
            else await api.post('/api/subjects', newSubject);
            closeSubjectModal();
            fetchSubjects();
        } catch (error) { console.error("Error guardando materia", error); }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('¿Eliminar esta materia?')) return;
        try {
            await api.delete(`/api/subjects/${id}`);
            fetchSubjects();
        } catch (error) { console.error("Error eliminando materia", error); }
    };

    const openEditSubjectModal = (subject) => {
        setNewSubject({ name: subject.name, color: subject.color });
        setEditingSubjectId(subject.id);
        setShowSubjectModal(true);
    };

    const closeSubjectModal = () => {
        setShowSubjectModal(false);
        setNewSubject({ name: '', color: '#4f46e5' });
        setEditingSubjectId(null);
    };

    // ==========================================
    // FUNCIONES: ALUMNOS
    // ==========================================
    const handleSaveStudent = async (e) => {
        e.preventDefault();
        try {
            if (editingId) await api.put(`/api/students/${editingId}`, newStudent);
            else await api.post('/api/students', newStudent);
            closeModal();
            fetchStudents();
        } catch (error) { console.error("Error guardando alumno", error); }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('¿Eliminar alumno?')) return;
        try {
            await api.delete(`/api/students/${id}`);
            fetchStudents();
            fetchSubjects();
        } catch (error) { console.error("Error eliminando alumno", error); }
    };

    const openEditModal = (student) => {
        setNewStudent({ first_name: student.first_name, last_name: student.last_name, identifier: student.identifier || '' });
        setEditingId(student.id);
        setShowStudentModal(true);
    };

    const closeModal = () => {
        setShowStudentModal(false);
        setNewStudent({ first_name: '', last_name: '', identifier: '' });
        setEditingId(null);
    };

    // ==========================================
    // FUNCIONES: IA Y AGENDA
    // ==========================================
    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        if (!grade || !topic) return;
        setIsGenerating(true);
        setGeneratedPlan('');
        try {
            const response = await api.post('/api/generate-plan', { grade, topic });
            setGeneratedPlan(response.data.plan);
        } catch (error) {
            const errorMsg = error.response?.data?.details?.error?.message || error.response?.data?.message || "Error de conexión.";
            setGeneratedPlan("⚠️ Error: " + errorMsg);
        } finally { setIsGenerating(false); }
    };

    const handleSavePlan = async () => {
        if (!generatedPlan || !grade || !topic) return;
        setIsSavingPlan(true);
        try {
            await api.post('/api/lesson-plans', { grade, topic, content: generatedPlan });
            alert("¡Planeación guardada!");
            setGrade(''); setTopic(''); setGeneratedPlan('');
            fetchPlans();
            setActiveTab('agenda');
        } catch (error) { alert("Error al guardar."); }
        finally { setIsSavingPlan(false); }
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        } catch (error) { console.error(error); }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            {/* NAVBAR SUPERIOR */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm shadow-slate-200/50 rounded-2xl px-6 py-3 flex items-center justify-between z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg hidden sm:block">Docente AI</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
                    <NavButton icon={<Home />} text="Inicio" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavButton icon={<Users />} text="Alumnos" isActive={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <NavButton icon={<Library />} text="Materias" isActive={activeTab === 'subjects' || activeTab === 'gradebook'} onClick={() => setActiveTab('subjects')} />
                    <NavButton icon={<BrainCircuit />} text="Crear Clase" isPremium isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
                    <NavButton icon={<Archive />} text="Mi Agenda" isActive={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                    <span className="hidden sm:inline">Salir</span>
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main className="pt-28 px-4 pb-12 max-w-6xl mx-auto">

                {/* VISTA: INICIO */}
                {activeTab === 'home' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, Maestro 👋</h1>
                            <p className="text-slate-500 mt-1 text-lg">Aquí tienes el resumen de tu plataforma.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Alumnos" value={students.length} icon={<Users className="w-6 h-6 text-indigo-500" />} />
                            <StatCard title="Materias" value={subjects.length} icon={<Library className="w-6 h-6 text-rose-500" />} />
                            <StatCard title="Clases IA" value={savedPlans.length} icon={<BrainCircuit className="w-6 h-6 text-cyan-500" />} />
                            <StatCard title="Tareas" value={tasks.filter(t => !t.is_completed).length} icon={<CheckSquare className="w-6 h-6 text-amber-500" />} />
                        </div>

                        {/* WIDGET DE LISTA DE PENDIENTES */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                    <CheckSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Lista de Pendientes</h2>
                                    <p className="text-sm text-slate-500">Organiza tus actividades escolares del día</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Ej. Revisar maquetas de geografía..."
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all"
                                    disabled={isSavingTask}
                                />
                                <button
                                    type="submit"
                                    disabled={isSavingTask || !newTaskTitle.trim()}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {tasks.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-6">No tienes tareas pendientes. ¡Buen trabajo!</p>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-slate-100/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={task.is_completed}
                                                    onChange={() => handleToggleTask(task)}
                                                    className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                                                />
                                                <span className={`text-sm font-medium transition-all ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA: MATERIAS */}
                {activeTab === 'subjects' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Mis Materias</h2>
                                <p className="text-slate-500 text-sm">Organiza tus asignaturas y califica a tus alumnos</p>
                            </div>
                            <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                <Plus className="w-4 h-4" /> Nueva Materia
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {subjects.length === 0 ? (
                                <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400">
                                    <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    Aún no has registrado ninguna materia.
                                </div>
                            ) : (
                                subjects.map((subject) => {
                                    const safeColor = subject.color?.startsWith('#') ? subject.color : '#64748b';
                                    const studentCount = subject.students?.length || 0;

                                    return (
                                        <div key={subject.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                                            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: safeColor }}></div>
                                            <div className="flex justify-between items-start mt-2">
                                                <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                    <BookOpen className="w-6 h-6" style={{ color: safeColor }} />
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button onClick={() => openEditSubjectModal(subject)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteSubject(subject.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800 mt-4 line-clamp-2">{subject.name}</h3>

                                            <p className="text-slate-500 text-sm mt-1 mb-6 flex-1">
                                                {studentCount > 0 ? `${studentCount} alumno(s) inscrito(s)` : 'Sin alumnos asignados'}
                                            </p>

                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => openEnrollModal(subject)} className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200">
                                                    <Users className="w-4 h-4" /> Alumnos
                                                </button>

                                                <button
                                                    onClick={() => openGradebook(subject)}
                                                    disabled={studentCount === 0}
                                                    className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
                                                >
                                                    <GraduationCap className="w-4 h-4" /> Calificar
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* VISTA: LIBRETA DE CALIFICACIONES CLÁSICA */}
                {activeTab === 'gradebook' && currentGradeSubject && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <button onClick={() => setActiveTab('subjects')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-2 font-medium text-sm transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Volver a Materias
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-8 rounded-full" style={{ backgroundColor: currentGradeSubject.color?.startsWith('#') ? currentGradeSubject.color : '#64748b' }}></div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentGradeSubject.name}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                            <form onSubmit={handleSaveGrades}>
                                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                                    <div className="flex-1 w-full max-w-md">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                            <ClipboardEdit className="w-4 h-4 text-indigo-500" /> Descripción de la Actividad
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Proyecto Final, Examen Parcial..."
                                            value={gradeTaskName}
                                            onChange={(e) => setGradeTaskName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSavingGrades}
                                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 mt-4 md:mt-0"
                                    >
                                        {isSavingGrades ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Calificaciones</>}
                                    </button>
                                </div>

                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                                            <th className="px-6 py-4 font-bold w-16 text-center">N°</th>
                                            <th className="px-6 py-4 font-bold">Alumno</th>
                                            <th className="px-6 py-4 font-bold w-48 text-center">Calificación (0-10)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentGradeSubject.students?.map((student, index) => (
                                            <tr key={student.id} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4 text-slate-400 font-medium text-center">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-800 font-bold">{student.last_name}, {student.first_name}</p>
                                                    <p className="text-slate-500 text-xs mt-0.5">{student.identifier || 'Sin Matrícula'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        placeholder="-"
                                                        value={studentScores[student.id] || ''}
                                                        onChange={(e) => setStudentScores({ ...studentScores, [student.id]: e.target.value })}
                                                        className="w-full text-center px-3 py-2 bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg font-mono font-bold text-lg text-indigo-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                )}

                {/* VISTA: ALUMNOS */}
                {activeTab === 'students' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Mis Alumnos</h2>
                                <p className="text-slate-500 text-sm">Gestiona tu lista de estudiantes activos</p>
                            </div>
                            <button onClick={() => setShowStudentModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200">
                                <UserPlus className="w-4 h-4" /> Agregar Alumno
                            </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="px-6 py-4 font-medium">Nombre</th>
                                        <th className="px-6 py-4 font-medium">Apellidos</th>
                                        <th className="px-6 py-4 font-medium">Matrícula / ID</th>
                                        <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Aún no tienes alumnos registrados.</td></tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-800 font-medium">{student.first_name}</td>
                                                <td className="px-6 py-4 text-slate-600">{student.last_name}</td>
                                                <td className="px-6 py-4 text-slate-500">{student.identifier || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteStudent(student.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VISTA: PLANEADOR IA (RESTAURADA) */}
                {activeTab === 'planner' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><BrainCircuit className="w-6 h-6" /></div>
                                <div><h2 className="text-xl font-bold text-slate-900">Asistente IA</h2><p className="text-sm text-slate-500">Genera tu clase en segundos</p></div>
                            </div>
                            <form onSubmit={handleGeneratePlan} className="space-y-5">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Grado / Nivel</label><input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Ej. 3ro de Primaria" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" required /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Tema de la clase</label><textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej. El ciclo del agua..." rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-indigo-500" required /></div>
                                <button type="submit" disabled={isGenerating || !topic || !grade} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-md">
                                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</> : <><Sparkles className="w-5 h-5" /> Generar Planeación</>}
                                </button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2"><BookOpen className="w-5 h-5 text-slate-400" />Borrador de Planeación</h3>
                                {generatedPlan && !isGenerating && (
                                    <button onClick={handleSavePlan} disabled={isSavingPlan} className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                                        <Save className="w-4 h-4" /> {isSavingPlan ? 'Guardando...' : 'Guardar en Mi Agenda'}
                                    </button>
                                )}
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                                {!generatedPlan && !isGenerating && <div className="h-full flex flex-col items-center justify-center text-slate-400"><Send className="w-12 h-12 mb-4 opacity-20" /><p>Escribe un tema para comenzar.</p></div>}
                                {isGenerating && <div className="h-full flex flex-col items-center justify-center text-indigo-500 animate-pulse"><BrainCircuit className="w-12 h-12 mb-4" /><p className="font-medium">Estructurando tu clase...</p></div>}
                                {generatedPlan && !isGenerating && <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">{generatedPlan}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA: MI AGENDA (RESTAURADA) */}
                {activeTab === 'agenda' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">Mi Agenda Digital</h2><p className="text-slate-500 text-sm">Todas tus planeaciones generadas con IA</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedPlans.length === 0 ? (
                                <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400"><Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />Aún no has guardado ninguna planeación.</div>
                            ) : (
                                savedPlans.map((plan) => (
                                    <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-80">
                                        <div className="flex justify-between items-start mb-4">
                                            <div><h3 className="font-bold text-lg text-slate-800 line-clamp-1">{plan.topic}</h3><span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full mt-2">{plan.grade}</span></div>
                                        </div>
                                        <div className="text-slate-600 text-sm line-clamp-6 mb-4 flex-1 whitespace-pre-wrap">{plan.content}</div>
                                        <button className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200">Ver clase completa</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* MODAL AGREGAR / EDITAR ALUMNO */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">{editingId ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label><input type="text" required value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Apellidos</label><input type="text" required value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Matrícula / ID (Opcional)</label><input type="text" value={newStudent.identifier} onChange={(e) => setNewStudent({ ...newStudent, identifier: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" /></div>
                            <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors">{editingId ? 'Actualizar Datos' : 'Guardar Estudiante'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL AGREGAR / EDITAR MATERIA */}
            {showSubjectModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">{editingSubjectId ? 'Editar Materia' : 'Nueva Materia'}</h3>
                            <button onClick={closeSubjectModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveSubject} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la materia</label>
                                <input type="text" required value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="Ej. Matemáticas Avanzadas" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Elige un color identificador</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={newSubject.color}
                                        onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                                        className="w-14 h-14 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                                    />
                                    <div className="text-sm text-slate-500">
                                        <p>Color seleccionado:</p>
                                        <p className="font-mono font-bold uppercase">{newSubject.color}</p>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors">{editingSubjectId ? 'Actualizar Materia' : 'Crear Materia'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL MATRICULAR ALUMNOS */}
            {showEnrollModal && selectedSubject && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Matricular Alumnos</h3>
                                <p className="text-slate-500 text-sm">En: {selectedSubject.name}</p>
                            </div>
                            <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSaveEnrollment} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-1">
                                {students.length === 0 ? (
                                    <p className="text-center text-slate-500 text-sm py-4">No tienes alumnos registrados.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {students.map(student => (
                                            <label key={student.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => handleToggleStudent(student.id)}
                                                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{student.first_name} {student.last_name}</p>
                                                    <p className="text-xs text-slate-500">{student.identifier || 'Sin Matrícula'}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors">
                                    Guardar Cambios ({selectedStudentIds.length} seleccionados)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavButton({ icon, text, isActive, onClick, isPremium }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
            {React.cloneElement(icon, { className: 'w-4 h-4' })}
            <span className="hidden sm:inline">{text}</span>
            {isPremium && <span className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full sm:ml-1">PRO</span>}
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