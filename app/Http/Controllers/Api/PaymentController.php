<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Crea una preferencia de pago en Mercado Pago para plan mensual o trimestral.
     */
    public function createPreference(Request $request)
    {
        $request->validate([
            'plan_type' => 'required|in:monthly,quarterly',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no autenticado',
            ], 401);
        }

        $planType = $request->plan_type;

        $plans = [
            'monthly' => [
                'title' => 'DocenteAI PRO - Plan mensual',
                'price' => (int) env('MERCADOPAGO_MONTHLY_PRICE', 99),
                'days' => 30,
            ],
            'quarterly' => [
                'title' => 'DocenteAI PRO - Plan trimestral',
                'price' => (int) env('MERCADOPAGO_QUARTERLY_PRICE', 249),
                'days' => 90,
            ],
        ];

        $selectedPlan = $plans[$planType];

        $externalReference = 'docenteai_' . $user->id . '_' . Str::uuid();

        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_type' => $planType,
            'amount' => $selectedPlan['price'],
            'currency' => 'MXN',
            'status' => 'pending',
            'payment_provider' => 'mercadopago',
            'external_reference' => $externalReference,
        ]);

        $frontendUrl = rtrim(env('APP_FRONTEND_URL', 'http://localhost:5173'), '/');

        $payload = [
            'items' => [
                [
                    'title' => $selectedPlan['title'],
                    'quantity' => 1,
                    'currency_id' => 'MXN',
                    'unit_price' => $selectedPlan['price'],
                ],
            ],
            'payer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'external_reference' => $externalReference,
            'back_urls' => [
                'success' => $frontendUrl . '/payment/success',
                'failure' => $frontendUrl . '/payment/failure',
                'pending' => $frontendUrl . '/payment/pending',
            ],
            //'auto_return' => 'approved',
            'notification_url' => env('MERCADOPAGO_NOTIFICATION_URL'),
            'metadata' => [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'plan_type' => $planType,
                'days' => $selectedPlan['days'],
            ],
        ];

        $response = Http::withToken(env('MERCADOPAGO_ACCESS_TOKEN'))
            ->post('https://api.mercadopago.com/checkout/preferences', $payload);

        if (!$response->successful()) {
            $payment->update([
                'status' => 'failed',
                'raw_response' => $response->json(),
            ]);

            return response()->json([
                'message' => 'No se pudo crear la preferencia de pago',
                'error' => $response->json(),
            ], 500);
        }

        $data = $response->json();

        $payment->update([
            'mercadopago_preference_id' => $data['id'] ?? null,
            'raw_response' => $data,
        ]);

        return response()->json([
            'payment_id' => $payment->id,
            'preference_id' => $data['id'] ?? null,
            'init_point' => $data['init_point'] ?? null,
            'sandbox_init_point' => $data['sandbox_init_point'] ?? null,
        ]);
    }

    /**
     * Devuelve el estado actual de suscripción del usuario autenticado.
     */
    public function status(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest('ends_at')
            ->first();

        return response()->json([
            'is_premium' => (bool) $subscription,
            'subscription' => $subscription,
        ]);
    }
    /**
 * Recibe notificaciones de Mercado Pago y activa la suscripción si el pago fue aprobado.
 */
public function webhook(Request $request)
{
    $paymentId = $request->input('data.id') ?? $request->input('id');

    if (!$paymentId) {
        return response()->json([
            'message' => 'Notificación recibida sin ID de pago',
        ], 200);
    }

    $response = Http::withToken(env('MERCADOPAGO_ACCESS_TOKEN'))
        ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

    if (!$response->successful()) {
        return response()->json([
            'message' => 'No se pudo consultar el pago en Mercado Pago',
            'error' => $response->json(),
        ], 200);
    }

    $mpPayment = $response->json();

    $externalReference = $mpPayment['external_reference'] ?? null;

    if (!$externalReference) {
        return response()->json([
            'message' => 'Pago sin referencia externa',
        ], 200);
    }

    $payment = Payment::where('external_reference', $externalReference)->first();

    if (!$payment) {
        return response()->json([
            'message' => 'Pago no encontrado en DocenteAI',
        ], 200);
    }

    $payment->update([
        'status' => $mpPayment['status'] ?? 'unknown',
        'mercadopago_payment_id' => $mpPayment['id'] ?? null,
        'raw_response' => $mpPayment,
        'paid_at' => ($mpPayment['status'] ?? null) === 'approved' ? now() : null,
    ]);

    if (($mpPayment['status'] ?? null) !== 'approved') {
        return response()->json([
            'message' => 'Pago recibido pero no aprobado',
            'status' => $mpPayment['status'] ?? null,
        ], 200);
    }

    $days = $payment->plan_type === 'quarterly' ? 90 : 30;

    $activeSubscription = Subscription::where('user_id', $payment->user_id)
        ->where('status', 'active')
        ->where('ends_at', '>', now())
        ->latest('ends_at')
        ->first();

    $startsAt = $activeSubscription ? $activeSubscription->ends_at : now();
    $endsAt = Carbon::parse($startsAt)->addDays($days);

    Subscription::create([
        'user_id' => $payment->user_id,
        'payment_id' => $payment->id,
        'plan_type' => $payment->plan_type,
        'status' => 'active',
        'starts_at' => $startsAt,
        'ends_at' => $endsAt,
    ]);

    $payment->user->update([
        'is_premium' => true,
    ]);

    return response()->json([
        'message' => 'Suscripción activada correctamente',
    ], 200);
}
}