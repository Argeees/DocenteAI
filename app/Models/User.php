<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 1. IMPORTAMOS SANCTUM

// 2. AGREGAMOS is_premium Y stripe_id PARA EL MODELO DE SUSCRIPCIÓN
#[Fillable(['name', 'email', 'password', 'is_premium', 'stripe_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    // 3. AGREGAMOS HasApiTokens AQUÍ ADENTRO
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_premium' => 'boolean', // 4. CASTEAMOS is_premium COMO BOOLEANO
        ];
    }
    
    public function courses() {
        return $this->hasMany(Course::class);
    }

    public function students() {
        return $this->hasMany(Student::class);
    }
}