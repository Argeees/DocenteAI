import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; // O tu instancia configurada de axios (ej. import api from '../../api')
import { User, BookOpen, Award, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams(); // Obtenemos el ID del alumno desde la ruta
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                setLoading(true);
                // Ajusta la URL según la configuración de tu axios o tu backend local
                const response = await axios.get(`/api/students/${id}/profile`);
                
                if (response.data.success) {
                    setProfileData(response.data.data);
                } else {
                    setError('No se pudo cargar la información del estudiante.');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Error al conectar con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, [id]);

    // Estado de Carga
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium">Cargando historial del alumno...</p>
            </div>
        );
    }

    // Estado de Error
    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 rounded-xl border border-red-200 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-800">Hubo un problema</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Link to="/students" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Volver a la lista de alumnos
                </Link>
            </div>
        );
    }

    const { student, courses, total_average } = profileData;

    // Función auxiliar para determinar el color del badge del promedio
    const getAverageBadgeColor = (avg) => {
        if (avg >= 8) return 'bg-green-100 text-green-800 border-green-200';
        if (avg >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            
            {/* Botón de regreso */}
            <Link to="/students" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a Alumnos
            </Link>

            {/* Encabezado / Tarjeta del Alumno */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {student.first_name} {student.last_name}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Matrícula: <span className="font-mono font-medium text-gray-700">{student.identifier || 'N/A'}</span>
                        </p>
                    </div>
                </div>

                {/* Widget de Promedio General */}
                <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${getAverageBadgeColor(total_average)} shadow-sm w-full md:w-auto justify-between md:justify-start`}>
                    <div className="space-y-0.5">
                        <p className="text-xs uppercase tracking-wider font-semibold opacity-75">Promedio General</p>
                        <p className="text-2xl font-black">{total_average}</p>
                    </div>
                    <Award className="w-8 h-8 opacity-80" />
                </div>
            </div>

            {/* Listado de Materias / Boleta */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-bold text-gray-800">Historial Académico por Materia</h2>
                </div>

                {courses.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        Este alumno no se encuentra matriculado en ninguna materia actualmente.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-4 px-6">Materia</th>
                                    <th className="py-4 px-6 text-center">Estatus</th>
                                    <th className="py-4 px-6 text-right">Promedio Asignatura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                                            {/* Círculo indicador con el color hexadecimal guardado en la BD */}
                                            <span 
                                                className="w-3.5 h-3.5 rounded-full block border shadow-sm shrink-0" 
                                                style={{ backgroundColor: course.color || '#3b82f6' }}
                                            />
                                            {course.name}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                course.average >= 6 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                                {course.average >= 6 ? 'Aprobado' : 'Reprobado'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-gray-900">
                                            {course.average}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;