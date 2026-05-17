<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        // Traemos las tareas del maestro autenticado
        $tasks = Task::where('user_id', auth()->id())->latest()->get();
        return response()->json(['success' => true, 'data' => $tasks]);
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