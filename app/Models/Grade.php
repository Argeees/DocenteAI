<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = ['subject_id', 'student_id', 'description', 'score'];

    // Relación: Una calificación pertenece a un alumno
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}