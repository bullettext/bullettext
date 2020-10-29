<?php

use Illuminate\Database\Seeder;

class users extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	//DB::table('users')->delete();
        // DB::table('users')->truncate();

    	$user = \App\User::create([
    		'name'=>'admin',
    		'email'=>'admin@admin.com',
    		'password'=>Hash::make('admin'),
    		'is_admin'=>true,
        ]);

        $note = \App\Note::create([
            'name'=>'first note',
            'slug'=>'first-note',
            'user_id'=>$user->id
        ]);
        $block1 = \App\Block::create([
            'text'=>'lorem ipsum',
            'note_id'=>$note->id,
            'meta'=>[],
        ]);
        $block2 = \App\Block::create([
            'text'=>'lorem ipsum 2',
            'order'=>2,
            'note_id'=>$note->id,
            'meta'=>[],
        ]);
        $block3 = \App\Block::create([
            'text'=>'lorem ipsum 1.1',
            'note_id'=>$note->id,
            'parent_id'=>$block1->id,
            'meta'=>[],
        ]);



    }
}
