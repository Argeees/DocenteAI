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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            // Conectamos la calificación con la materia
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            // Conectamos la calificación con el alumno
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            $table->string('description'); // Ej: "Examen de Matemáticas", "Proyecto Final"
            $table->decimal('score', 5, 2); // Permite calificaciones con decimales (ej: 9.50 o 10.00)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
