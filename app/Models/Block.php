<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{

	protected $fillable = ['note_id', 'text', 'meta', 'parent_id','order'];

	protected $casts = [
		'meta'=>'array',
	];

	public function note(){
		return $this->belongsTo('\App\Models\Note');
	}

	public function references(){
		return $this->belongsToMany('\App\Models\Note','references','block_id','note_id');
	}

	public function children(){
		return $this->hasMany('\App\Models\Block','parent_id');
	}

}
