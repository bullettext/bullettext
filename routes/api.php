<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\NoteController;

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

//Route::middleware('auth:api')->group(function(){

    Route::get('/users', [LoginController::class,'users']);
    Route::get('/user', [LoginController::class,'user']);

    Route::get('/logout', [LoginController::class,'logout']);

    Route::post('login', [LoginController::class,'login']);
    Route::post('login', [LoginController::class, 'login']);

    Route::post('register',[LoginController::class,'register']);
    Route::post('forgot',[LoginController::class,'forgot']);
    Route::post('new-password',[LoginController::class,'newPassword']);

    Route::get('notes',[NoteController::class,'index']);

    Route::get('notes/{slug}',[NoteController::class,'get']);
    Route::post('notes',[NoteController::class,'create']);
    Route::post('notes/{note}',[NoteController::class,'update']);
    Route::post('notes/save-blocks/{note}',[NoteController::class,'saveBlocks']);
    Route::delete('notes/{note}',[NoteController::class,'delete']);

//});

