<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    // Método index ÚNICO y actualizado (trae las materias con sus alumnos)
    public function index(Request $request)
    {
        $subjects = Subject::with('students')->where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['success' => true, 'data' => $subjects]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255', 'color' => 'nullable|string']);

        $subject = Subject::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'color' => $request->color ?? '#4f46e5',
        ]);

        return response()->json(['success' => true, 'data' => $subject], 201);
    }

    public function update(Request $request, Subject $subject)
    {
        if ($subject->user_id !== $request->user()->id) return response()->json(['message' => 'No autorizado'], 403);

        $request->validate(['name' => 'required|string|max:255', 'color' => 'nullable|string']);
        $subject->update($request->only(['name', 'color']));

        return response()->json(['success' => true, 'data' => $subject]);
    }
    
    // Inscribe o actualiza los alumnos de una materia
    public function syncStudents(Request $request, Subject $subject)
    {
        // Verificamos que la materia sea de este maestro
        if ($subject->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'student_ids' => 'array' // Esperamos una lista de IDs: [1, 5, 8]
        ]);

        // La función sync() inscribe a los alumnos de la lista y desinscribe a los que no estén
        $subject->students()->sync($request->student_ids);

        return response()->json([
            'success' => true, 
            'message' => 'Alumnos actualizados correctamente'
        ]);
    }

    public function destroy(Request $request, Subject $subject)
    {
        if ($subject->user_id !== $request->user()->id) return response()->json(['message' => 'No autorizado'], 403);
        $subject->delete();
        return response()->json(['success' => true, 'message' => 'Eliminada']);
    }
}