<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        // Usamos $request->user() en lugar de auth() para evitar falsas alertas en el editor
        $students = Student::where('user_id', $request->user()->id)->get();
        
        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'identifier' => 'nullable|string|max:50'
        ]);

        $student = $request->user()->students()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alumno registrado correctamente',
            'data' => $student
        ], 201);
    }

    public function show(Request $request, Student $student)
    {
        // Seguridad: Validamos que el alumno pertenezca al maestro actual
        if ($student->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    public function update(Request $request, Student $student)
    {
        if ($student->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'identifier' => 'nullable|string|max:50'
        ]);

        $student->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alumno actualizado correctamente',
            'data' => $student
        ]);
    }

    public function destroy(Request $request, Student $student)
    {
        if ($student->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $student->delete(); // Gracias al softDeletes que pusimos, no se borra permanentemente

        return response()->json([
            'success' => true,
            'message' => 'Alumno eliminado correctamente'
        ]);
    }

    /**
     * Obtener el perfil extendido del estudiante adaptado a React (subjects).
     */
    public function profile(Request $request, $id)
    {
        try {
            // 1. Buscamos al estudiante validando que sea del docente autenticado
            $student = Student::where('user_id', $request->user()->id)->findOrFail($id);

            // 2. Obtenemos las materias asociadas a este alumno usando la tabla pivote
            // 'subjects' es la relación Many-to-Many que ya tienes configurada
            $subjects = $student->subjects; 

            // 3. Mapeamos las materias y calculamos sus promedios directo de la tabla 'grades'
            $subjectsMapped = $subjects->map(function($subject) use ($student) {
                
                // Hacemos una consulta directa a la tabla de calificaciones (grades)
                // filtrando por esta materia y este alumno en específico
                $average = \DB::table('grades')
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subject->id)
                    ->avg('score'); // Obtenemos el promedio del campo 'score'

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'color' => $subject->color ?? '#6366f1', // Color por defecto si está vacío
                    'average' => $average ? round($average, 1) : 0
                ];
            });

            // 4. Retornamos la respuesta exacta que tu Dashboard.jsx de React espera
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'identifier' => $student->identifier,
                    'subjects' => $subjectsMapped // Cumple con selectedStudentProfile.subjects en React
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Estudiante no encontrado o no autorizado.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el expediente del alumno.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}