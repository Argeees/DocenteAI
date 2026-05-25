<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        // 1. Traemos las tareas del maestro autenticado
        $tasks = Task::where('user_id', auth()->id())->latest()->get();

        // 2. OPTIMIZACIÓN: Calculamos las estadísticas directamente aquí en la colección
        // Esto evita hacer un contador por separado en la base de datos
        $completed = $tasks->where('is_completed', true)->count();
        $pending = $tasks->where('is_completed', false)->count();

        // 3. Retornamos todo en una sola respuesta limpia
        return response()->json([
            'success' => true,
            'data' => $tasks,
            'stats' => [
                'completed' => $completed,
                'pending' => $pending,
                'total' => $completed + $pending
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255']);

        $task = Task::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'is_completed' => false,
        ]);

        return response()->json(['success' => true, 'data' => $task], 201);
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== auth()->id()) return response()->json(['message' => 'No autorizado'], 403);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'is_completed' => 'sometimes|required|boolean'
        ]);

        $task->update($request->all());

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function destroy(Task $task)
    {
        if ($task->user_id !== auth()->id()) return response()->json(['message' => 'No autorizado'], 403);

        $task->delete();
        return response()->json(['success' => true, 'message' => 'Tarea eliminada']);
    }
}