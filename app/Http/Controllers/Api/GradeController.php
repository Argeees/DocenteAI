<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    // Muestra todas las calificaciones de una materia específica
    public function index(Request $request, Subject $subject)
    {
        // Seguridad: Verificamos que la materia sea de este maestro
        if ($subject->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Traemos las calificaciones junto con los datos del alumno calificado
        $grades = Grade::with('student')->where('subject_id', $subject->id)->latest()->get();

        return response()->json(['success' => true, 'data' => $grades]);
    }

    // Guarda una nueva calificación
    public function store(Request $request, Subject $subject)
    {
        if ($subject->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'description' => 'required|string|max:255',
            'score' => 'required|numeric|min:0|max:10' // Calificaciones de 0 a 10
        ]);

        $grade = Grade::create([
            'subject_id' => $subject->id,
            'student_id' => $request->student_id,
            'description' => $request->description,
            'score' => $request->score
        ]);

        return response()->json(['success' => true, 'data' => $grade], 201);
    }
}
