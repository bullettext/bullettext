<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{

	protected $fillable = ['note_id', 'text', 'meta', 'parent_id','order'];

	protected $casts = [
		'meta'=>'array',
	];

	public function note(){
		return $this->belongsTo('\App\Note');
	}

	public function children(){
		return $this->hasMany('\App\Block','parent_id');
	}

}
