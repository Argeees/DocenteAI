<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('plan_type'); // monthly o quarterly
            $table->integer('amount'); // monto en centavos o pesos, usaremos pesos MXN
            $table->string('currency')->default('MXN');

            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->string('payment_provider')->default('mercadopago');

            $table->string('external_reference')->unique();
            $table->string('mercadopago_preference_id')->nullable();
            $table->string('mercadopago_payment_id')->nullable();

            $table->json('raw_response')->nullable();

            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
