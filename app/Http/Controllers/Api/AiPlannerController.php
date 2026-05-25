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

        // 3. CONSTRUIR EL PROMPT ALINEADO A LA NUEVA ESCUELA MEXICANA (NEM)
        $prompt = "Genera una planeación didáctica formal, práctica y creativa alineada estrictamente con los planes de estudio vigentes de la Nueva Escuela Mexicana (NEM) para el grado/nivel '{$validated['grade_level']}'. 
        El tema central a abordar es: '{$validated['topic']}' y la sesión tiene una duración estimada de {$validated['duration']} minutos.

        La estructura obligatoria que debe contener el reporte es la siguiente:
        1. DATOS GENERALES: Grado, Fase correspondiente de la NEM, Tema y Duración de la sesión.
        2. ELEMENTOS CURRICULARES DE LA NEM:
           - Campo(s) Formativo(s) principal(es) (Lenguajes, Saberes y pensamiento científico, Ética, naturaleza y sociedades, o De lo humano y lo comunitario).
           - Ejes Articuladores implicados (Inclusión, Pensamiento crítico, Interculturalidad crítica, Igualdad de género, Vida saludable, Apropiación de las culturas a través de la lectura y la escritura, o Artes y experiencias estéticas).
           - PDA (Proceso de Desarrollo de Aprendizaje): Redacta un objetivo claro acorde al enfoque actual.
        3. SECUENCIA DIDÁCTICA (Metodología sociocrítica adaptada al entorno):
           - INICIO: Recuperación de saberes previos y planteamiento de una situación detonadora.
           - DESARROLLO: Actividades de indagación, acción conjunta o resolución de problemas vinculados a la comunidad.
           - CIERRE: Espacio de reflexión formativa, síntesis del aprendizaje y socialización de resultados.
        4. EVALUACIÓN FORMATIVA: Técnicas, instrumentos sugeridos (como rúbricas, diarios de clase o escalas de observación) y criterios claros de evaluación.

        Devuelve el resultado final ÚNICAMENTE en formato HTML limpio y bien estructurado (usando etiquetas semánticas como <h3>, <p>, <ul>, <li>, <strong>) listo para ser insertado directamente en un editor WYSIWYG. NO utilices bloques de código Markdown ni envuelvas el texto en marcas como ```html.";

        // 4. LLAMAR A LA API DE GEMINI (Modelo 1.5 Flash)
        try {
            $apiKey = env('GEMINI_API_KEY');
            $url = "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=){$apiKey}";

            $response = Http::post($url, [
                // Instrucciones del sistema (El nuevo rol pedagógico oficial)
                'systemInstruction' => [
                    'parts' => [
                        ['text' => 'Eres un experto pedagogo de la Secretaría de Educación Pública (SEP) en México, especializado en el codiseño curricular y el marco de la Nueva Escuela Mexicana (NEM).']
                    ]
                ],
                // El mensaje estructurado del usuario
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
                'error' => $response->json() 
            ], 500);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Ocurrió un error inesperado: ' . $e->getMessage()], 500);
        }
    }
}