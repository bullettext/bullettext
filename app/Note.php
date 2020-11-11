<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

use Str;
use Auth;

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

	public function references(){
		return $this->belongsToMany('\App\Block','references','note_id','block_id');
	}

	protected static function boot() {
		parent::boot();

		Note::saving(function($model){
			$user = Auth::user();
			if($user){
				$user_id = $user->id;
			} else {
				$user_id = $model->user_id;
			}

			$slug = Str::slug($model->name);

			$add = 0;
			$slug_final = $slug;
			while(\App\Note::where('user_id',$user_id)->where('slug',$slug_final)->count()) {
				$slug_final = $slug.'-'.(++$add);
			}
			$model->slug = $slug_final;
			return $model;

		});
	}

}
