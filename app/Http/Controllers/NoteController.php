<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Str;
use Auth;
use DB;
use Response;
use Log;
use Arr;
class NoteController extends Controller
{

    public function index(Request $request){
        return \App\Note::where('user_id',Auth::user()->id)->orderBy('updated_at','desc')->get();
    }

    public function create(Request $request){
        $input = $request->input();
        $data = [
            'user_id'=>Auth::user()->id,
            'name'=>$input['name'],
            'slug'=>$this->makeSlug($input['name'])
        ];
        $note = \App\Note::create($data);
        return $note;
    }

    public function delete(Request $request, \App\Note $note){
        if($note->user_id != Auth::user()->id) abort(403);
        $note->delete();
        return;
    }


    public function get(Request $request, $slug){
        $user_id = Auth::user()->id;
        $note = \App\Note::where('user_id',$user_id)->where('slug',$slug)->firstOrFail();
        $note->blocks; //query blocks

        return $note;
    }

    public function saveBlocks(Request $request, \App\Note $note){
			if($note->user_id != Auth::user()->id) abort(403);
			$input = $request->input();

			$blocks_ids = [];
			$temp_ids = [];
			//save all first;
			foreach($input as $postdata){
				if(!empty($postdata['id'])){
					$block = \App\Block::where('note_id',$note->id)->findOrFail($postdata['id']);
					$block->text = $postdata['text'];
					$block->order = $postdata['order'];
					$block->save();
					$blocks_ids[] = $block->id;
				} else {
					$block = new \App\Block;
					$block->text = $postdata['text'];
					$block->order = $postdata['order'];
					$block->note_id = $note->id;
					$block->save();
					$blocks_ids[] = $block->id;
					if($postdata['temp_id']) $temp_ids[$postdata['temp_id']] = $block->id;
				}
			}

			foreach($input as $postdata){
				if(!empty($postdata['id'])){
					$block_id = $postdata['id'];
				} else {
					$block_id = $temp_ids[$postdata['temp_id']];
				}
				$block = \App\Block::findOrFail($block_id);

				$parent_id = $postdata['parent_id'];
				if(preg_match('/^temp/',$parent_id)){
					$parent_id = $temp_ids[$parent_id];
				}
				$block->parent_id = $parent_id;
				$block->save();
			}

			//$note->blocks()->whereNotIn('parent-Id',$blocks_ids)->delete();
			$oldBlocks = $note->blocks()->whereNotIn('id',$blocks_ids)->get();
			foreach($oldBlocks as $oldBlock){
				$this->deleteBlockAndChildren($oldBlock);
			}

			return $temp_ids;
		}


		private function deleteBlockAndChildren(\App\Block $block){
			$children = $block->children;
			foreach($children as $child){
				$this->deleteBlockAndChildren($child);
			}
			$block->delete();
		}


    public function update(Request $request, \App\Note $note){
        if($note->user_id != Auth::user()->id) abort(403);
        $input = $request->input();

        $note->name = $input['name'];
        $note->slug = $this->makeSlug($input['name']);

        $note->save();
        return $note;
    }


    private function makeSlug($name){

        $user_id=Auth::user()->id;

        $slug = Str::slug($name);

        $add = 0;
        $slug_final = $slug;
        while(\App\Note::where('user_id',$user_id)->where('slug',$slug_final)->count()) {
            $slug_final = $slug.'-'.(++$add);
        }
        return $slug_final;

    }


}
