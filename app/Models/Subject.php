<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'color'];

    // Relación: Una materia tiene muchos alumnos
    // (Ahora sí está correctamente ADENTRO de la clase)
    public function students()
    {
        return $this->belongsToMany(Student::class);
    }
}