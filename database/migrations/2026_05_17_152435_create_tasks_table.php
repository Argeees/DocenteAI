<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            // Vinculamos la tarea directamente al maestro (usuario)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title'); // Ej. "Calificar exámenes"
            $table->boolean('is_completed')->default(false); // Para el checkbox (terminada o no)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
