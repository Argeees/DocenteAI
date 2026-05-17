<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id','first_name', 'last_name', 'identifier'];

    public function user() {
        return $this->belongsTo(User::class);
    }
    // Relación: Un alumno pertenece a muchas materias
    public function subjects()
    {
        return $this->belongsToMany(Subject::class);
    }

    public function grades() {
        return $this->hasMany(Grade::class);
    }
}