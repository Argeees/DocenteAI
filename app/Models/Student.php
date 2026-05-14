<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['first_name', 'last_name', 'identifier'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function grades() {
        return $this->hasMany(Grade::class);
    }
}