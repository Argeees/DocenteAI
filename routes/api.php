<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\AiPlannerController;
use App\Http\Controllers\Api\LessonPlanController;
use App\Http\Controllers\Api\SubjectController;

// ==========================================
// RUTAS PÚBLICAS (No requieren token)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// RUTAS PROTEGIDAS (Requieren token de Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Gestión Escolar
    Route::apiResource('students', StudentController::class);
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('grades', GradeController::class);
    
    // Planeador IA (Ruta conectada a React y Gemini)
    Route::post('/generate-plan', [AiPlannerController::class, 'generate']);
    Route::apiResource('lesson-plans', LessonPlanController::class);
    
    // Materias y Matriculación
    Route::apiResource('subjects', SubjectController::class);
    Route::post('/subjects/{subject}/students', [SubjectController::class, 'syncStudents']);

    // Calificaciones (Rutas anidadas por materia)
    Route::get('/subjects/{subject}/grades', [GradeController::class, 'index']);
    Route::post('/subjects/{subject}/grades', [GradeController::class, 'store']);

});