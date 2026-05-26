<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiPlannerController extends Controller
{
    public function generate(Request $request)
    {
        $user = $request->user();

        $hasActiveSubscription = \App\Models\Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->exists();

        if (!$hasActiveSubscription) {
            return response()->json([
                'message' => 'Necesitas activar DocenteAI PRO para generar planeaciones con IA',
            ], 403);
        }
        try {
            $request->validate([
                'grade' => 'required|string',
                'topic' => 'required|string',
            ]);

            $apiKey = trim(env('GEMINI_API_KEY'));

            if (empty($apiKey)) {
                return response()->json(['message' => 'Falta la API Key en el archivo .env'], 500);
            }

            $prompt = "Actúa como un maestro experto en pedagogía. Crea una planeación de clase detallada y moderna para el grado: {$request->grade}, con el tema: {$request->topic}. La estructura debe incluir: 1. Objetivo de aprendizaje, 2. Introducción/Motivación, 3. Desarrollo de la actividad (paso a paso), 4. Cierre/Reflexión y 5. Método de Evaluación. Usa formato Markdown para que sea fácil de leer.";

            // APUNTAMOS EXACTAMENTE AL NUEVO MODELO QUE TIENES DISPONIBLE
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $generatedText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'No se pudo leer la respuesta.';
                return response()->json(['plan' => $generatedText]);
            }

            return response()->json([
                'message' => 'Error de Google Gemini', 
                'details' => $response->json()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno en el servidor Laravel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}