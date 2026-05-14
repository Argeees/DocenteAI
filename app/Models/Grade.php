<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = ['title', 'description', 'due_date'];
    public function task() {
        return $this->belongsTo(Task::class);
    }

    public function student() {
        return $this->belongsTo(Student::class);
    }
    //
}
