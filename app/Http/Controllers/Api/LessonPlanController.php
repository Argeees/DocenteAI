<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use Illuminate\Http\Request;

class LessonPlanController extends Controller
{
    public function index(Request $request)
    {
        // Usamos auth()->id() para evitar advertencias en VS Code
        $plans = LessonPlan::where('user_id', auth()->id())->latest()->get();
        return response()->json(['success' => true, 'data' => $plans]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'grade' => 'required|string',
            'topic' => 'required|string',
            'content' => 'required|string',
        ]);

        $plan = LessonPlan::create([
            'user_id' => auth()->id(),
            'grade' => $request->grade,
            'topic' => $request->topic,
            'content' => $request->content,
        ]);

        return response()->json(['success' => true, 'data' => $plan], 201);
    }

    // ========================================================
    // Agregamos las funciones faltantes para evitar errores de Route::apiResource
    // ========================================================
    
    public function show(LessonPlan $lessonPlan)
    {
        if ($lessonPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json(['success' => true, 'data' => $lessonPlan]);
    }

    public function update(Request $request, LessonPlan $lessonPlan)
    {
        if ($lessonPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $request->validate([
            'grade' => 'sometimes|required|string',
            'topic' => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
        ]);

        $lessonPlan->update($request->all());
        
        return response()->json(['success' => true, 'data' => $lessonPlan]);
    }

    public function destroy(LessonPlan $lessonPlan)
    {
        if ($lessonPlan->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $lessonPlan->delete();
        return response()->json(['success' => true, 'message' => 'Planeación eliminada']);
    }
}