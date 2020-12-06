<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Str;
use Auth;
use DB;
use Response;
use Log;
use Arr;
use App\Models\Block;
class BlockController extends Controller
{


    public function create(Request $request){
        $input = $request->input();
        $data = [
            'note_id'=>$input['note_id'],
            'text'=>$input['text'],
            'meta'=>$input['meta'] ?? [],
            'order'=>$input['order'] ?? 1,
            'parent_id'=>$input['parent_id'] ?? null,
        ];
        $block = Block::create($data);

        $blocks = DB::table('blocks')->where('note_id',$input['note_id'])->where('parent_id',$block->parent_id)->select('id','order')->orderBy('order')->orderBy('id')->get();
        $countBlocks = count($blocks);
        for($x=0;$x<$countBlocks;$x++){
            if($blocks[$x]->order==$x+1) continue;
            DB::table('blocks')->where('id',$blocks[$x]->id)->update(['order'=>$x+1]);
        }

        return $block;
    }

    public function get(Request $request, Block $block){
        if($block->note->user_id != Auth::user()->id) abort(403);
        return $block;
    }


    public function update(Request $request, Block $block){
        if($block->note->user_id != Auth::user()->id) abort(403);
        $input = $request->input();

        if(array_key_exists('meta',$input)) $block->meta = $input['meta'];
        if(array_key_exists('text',$input)) $block->text = $input['text'];
        if(array_key_exists('order',$input)) $block->order = $input['order'];
        if(array_key_exists('parent_id',$input)) $block->parent_id = $input['parent_id'];
        $block->save();
        return $block;
    }

    public function batchUpdate(Request $request){

        //TODO validate current note_id and input note_id

        $input = $request->input();
        $blocksCreated = 0;
        $blocksUpdated = 0;
        foreach($input as $inputBlock){
            if(empty($inputBlock['id'])){
                $data = [
                    'note_id'=>$inputBlock['note_id'],
                    'text'=>$inputBlock['text'],
                    'meta'=>$inputBlock['meta'] ?? [],
                    'order'=>$inputBlock['order'] ?? 1,
                    'parent_id'=>$inputBlock['parent_id'] ?? null,
                ];
                $block = Block::create($data);
                $blocksCreated++;
            } else {
                $block = Block::findOrFail($inputBlock['id']);
                if(array_key_exists('note_id',$inputBlock)) $block->note_id = $inputBlock['note_id'];
                if(array_key_exists('meta',$inputBlock)) $block->meta = $inputBlock['meta'];
                if(array_key_exists('text',$inputBlock)) $block->text = $inputBlock['text'];
                if(array_key_exists('order',$inputBlock)) $block->order = $inputBlock['order'];
                if(array_key_exists('parent_id',$inputBlock)) $block->parent_id = $inputBlock['parent_id'];
                $block->save();
                $blocksUpdated++;
            }

        }
        return $blocksCreated+$blocksUpdated;

    }


    public function delete(Request $request, Block $block){
        if($block->note->user_id != Auth::user()->id) abort(403);
        $block->delete();
        return;
    }


}
