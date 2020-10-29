<?php

use Illuminate\Http\Request;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::get('/users', 'LoginController@users');
Route::get('/user', 'LoginController@user');

Route::get('/logout', 'LoginController@logout');

Route::post('login', 'LoginController@login');
Route::post('register','LoginController@register');
Route::post('forgot','LoginController@forgot');
Route::post('new-password','LoginController@newPassword');

Route::get('notes','NoteController@index');

Route::get('notes/{slug}','NoteController@get');
Route::post('notes','NoteController@create');
Route::post('notes/{note}','NoteController@update');
Route::post('notes/save-blocks/{note}','NoteController@saveBlocks');
Route::delete('notes/{note}','NoteController@delete');

/*
Route::post('blocks/batch','BlockController@batchUpdate');
Route::post('blocks/{block}','BlockController@update');
Route::post('blocks','BlockController@create');
Route::delete('blocks/{block}','BlockController@delete');
*/

