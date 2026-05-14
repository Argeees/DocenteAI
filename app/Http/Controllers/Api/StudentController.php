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
}


