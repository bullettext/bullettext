<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Str;
use Auth;
use DB;
use Response;
use Log;
use Arr;
use App\Models\Note;
use App\Models\Block;
use App\Models\Reference;


class NoteController extends Controller
{

	public function index(Request $request){

		return Note::where('user_id',Auth::user()->id)->orderBy('updated_at','desc')->get();
	}

	public function create(Request $request){
		$input = $request->input();
		$data = [
			'user_id'=>Auth::user()->id,
			'name'=>$input['name'],
		];
		$note = Note::create($data);
		return $note;
	}

	public function delete(Request $request, Note $note){
		if($note->user_id != Auth::user()->id) abort(403);
		$note->delete();
		return;
	}

	private function setLevels($blocks, $parent_id=null,$level=0){
		for($numblocks = count($blocks),$x=0;$x<$numblocks;$x++){
			if($blocks[$x]->parent_id==$parent_id){
				$blocks[$x]->level = $level;
				$blocks = $this->setLevels($blocks,$blocks[$x]->id,$level+1);
			}
		}
		return $blocks;
	}

	public function get(Request $request, $slug){
		$user_id = Auth::user()->id;
		$note = Note::with('blocks','references')->where('user_id',$user_id)->where('slug',$slug)->first();
		$note->blocks = $this->setLevels($note->blocks);

		if($note == null) {
			$data = [
				'user_id'=>Auth::user()->id,
				'name'=>ucfirst($slug),
				'slug'=>$slug
			];
			$note = Note::create($data);
			$note->load('blocks','references');
		}
		return $note;
	}

	public function saveBlocks(Request $request, Note $note){
		$user = Auth::user();
		if($note->user_id != $user->id) abort(403);
		$input = $request->input();

		$blocks_ids = [];
		$temp_ids = [];
		$new_notes = [];
		//save all first;
		foreach($input as $postdata){

			$text = $postdata['text'];

			if(!empty($postdata['id'])){
				$block = Block::where('note_id',$note->id)->findOrFail($postdata['id']);
				$block->text = $text;
				$block->order = $postdata['order'];
				$block->save();
				$blocks_ids[] = $block->id;


			} else {
				$block = new Block;
				$block->text = $text;
				$block->order = $postdata['order'];
				$block->note_id = $note->id;
				$block->save();
				$blocks_ids[] = $block->id;
				if($postdata['temp_id']) $temp_ids[$postdata['temp_id']] = $block->id;
			}


			Reference::where('block_id',$block->id)->delete();


			if(preg_match_all('/\[\[([^]]+)\]\]/',$text,$matches)) {


				foreach($matches[1] as $block_name){


					$related_note = Note::where(['name'=>$block_name,'user_id'=>$user->id])->first();
					if($related_note == null) {
						$related_note = Note::create(['name'=>$block_name,'user_id'=>$user->id]);
						$new_notes[] = $related_note;
					}
					Reference::create([
						'note_id'=>$related_note->id,
						'block_id'=>$block->id,
					]);
				}

			}

		}

		foreach($input as $postdata){
			if(!empty($postdata['id'])){
				$block_id = $postdata['id'];
			} else {
				$block_id = $temp_ids[$postdata['temp_id']];
			}
			$block = Block::findOrFail($block_id);

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
			$oldBlock->delete();
		}

		$return = [];
		$return['temp_ids'] = $temp_ids;
		$return['new_notes'] = $new_notes;
		// dd($return);
		return $return;
	}


	public function update(Request $request, Note $note){
		if($note->user_id != Auth::user()->id) abort(403);
		$input = $request->input();

		$note->fill($input);

		$note->save();
		return $note;
	}




}
