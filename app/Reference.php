<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Reference extends Model
{
	protected $fillable = ['note_id', 'block_id'];
}
