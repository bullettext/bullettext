<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Note extends Model
{
    //
	use SoftDeletes;
	protected $fillable = [
		'name',
		'slug',
		'user_id',
	];


	public function user(){
		return $this->belongsTo('\App\User');
	}

	public function blocks(){
		return $this->hasMany('\App\Block')->orderBy('order');
	}

}
