<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiPlannerController extends Controller
{
    public function generateLessonPlan(Request $request)
    {
        $user = $request->user();

        // 1. EL MURO DE PAGO (Paywall)
        if (!$user->is_premium) {
            return response()->json([
                'success' => false,
                'message' => 'Esta función es exclusiva del plan Premium. Por favor, mejora tu suscripción.',
                'requires_upgrade' => true
            ], 403);
        }

        // 2. VALIDAR LOS DATOS DE ENTRADA
        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'grade_level' => 'required|string|max:100',
            'duration' => 'required|integer', 
        ]);

        // 3. CONSTRUIR EL PROMPT PARA LA IA
        $prompt = "Genera un borrador de planeación didáctica para el tema '{$validated['topic']}' dirigido a alumnos de '{$validated['grade_level']}'. La clase dura {$validated['duration']} minutos. Incluye: Objetivo, Inicio, Desarrollo, Cierre y Evaluación. Devuelve el resultado en formato HTML limpio para ser insertado directamente en un editor WYSIWYG, sin usar etiquetas markdown como ```html.";

        // 4. LLAMAR A LA API DE GEMINI (Modelo 1.5 Flash)
        try {
            $apiKey = env('GEMINI_API_KEY');
            $url = "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=){$apiKey}";

            $response = Http::post($url, [
                // Instrucciones del sistema (El rol de la IA)
                'systemInstruction' => [
                    'parts' => [
                        ['text' => 'Eres un experto en pedagogía y un asistente diseñado para ayudar a maestros.']
                    ]
                ],
                // El mensaje del usuario
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                // Configuración de creatividad
                'generationConfig' => [
                    'temperature' => 0.7,
                ]
            ]);

            if ($response->successful()) {
                // Navegamos por el JSON de respuesta de Gemini para extraer solo el texto
                $lessonPlan = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';

                return response()->json([
                    'success' => true,
                    'data' => $lessonPlan
                ]);
            }

            return response()->json([
                'message' => 'Error al contactar con la IA', 
                'error' => $response->json() // Útil para depurar si algo falla
            ], 500);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Ocurrió un error inesperado: ' . $e->getMessage()], 500);
        }
    }
}