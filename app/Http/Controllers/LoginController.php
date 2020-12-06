<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Response;
use Hash;
use App\Models\User;
class LoginController extends Controller
{


    public function users(Request $request) {
        if(!Auth::user()->is_admin) abort(403);
        return User::all();
    }


    public function logout (Request $request) {
        return Auth::logout();
    }

    public function user(Request $request){
        $user = Auth::user();
        if(!$user) return Response::make([],403);

        //$this->registerVisit($user->id);
        return Response::make($user);

    }
    public function login(Request $request){

        $credentials = $request->only('email', 'password');
        $credentials['email'] =  strtolower($credentials['email']);
        if (Auth::attempt($credentials)) {
            return Response::make(Auth::user());
        } else {
            return Response::make('user or password invalid',403);
        }

    }

/*    private function registerVisit($user_id){

        $visit = new \App\Visit;
        $visit->user_id = $user_id;
        $visit->ip = $_SERVER['REMOTE_ADDR'];
        $visit->user_agent = $_SERVER['HTTP_USER_AGENT'];
        $visit->save();
        return $visit;

    }
*/


    public function register(Request $request){

        $credentials = $request->only('name','email','password');
        $credentials['email'] =  strtolower($credentials['email']);

        $existing = User::where('email',$credentials['email'])->count();
        if($existing) return Response::make("E-mail {$credentials['email']} já registrado, faça o login.",403);

        $credentials['password'] = Hash::make($credentials['password']);
        $user = User::create($credentials);
        Auth::login($user, true);
        return Response::make($user);
    }

    public function forgot(Request $request){

        $credentials = $request->only('email');
        $credentials['email'] =  strtolower($credentials['email']);

        $user = User::where('email',$credentials['email'])->first();
        if(empty($user)) return Response::make("E-mail {$credentials['email']} não registrado.",403);

        //TODO enviar email
        $token = md5($user->id.$user->password);

        $query = [
            'email'=>$credentials['email'],
            'token'=>$token,
        ];
        $url = url('new-password').'?'.http_build_query($query);

        return Response::make($url);
    }


    public function newPassword(Request $request){

        $credentials = $request->only('name','email','password','token');
        $credentials['email'] =  strtolower($credentials['email']);

        $user = User::where('email',$credentials['email'])->first();
        if(empty($user)) return Response::make("E-mail {$credentials['email']} não registrado.",403);
        if($credentials['token'] != md5($user->id.$user->password)) return Response::make("Requisicao invalida.",403);

        $user->password = Hash::make($credentials['password']);
        $user->save();
        return Response::make('Senha alterada com sucesso');
    }


    // public function loginWith(Request $request,$user_id) {
    //     if(!Auth::user()->is_admin) abort(403);
    //     $user = User::findOrFail($user_id);
    //     Auth::login($user);
    //     return 'ok';
    // }
}
