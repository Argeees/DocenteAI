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
        Schema::create('lesson_plans', function (Blueprint $table) {
            $table->id();
            // Vinculamos la planeación al maestro que la creó
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('grade');
            $table->string('topic');
            $table->longText('content'); // Usamos longText porque las planeaciones son largas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_plans');
    }
};
