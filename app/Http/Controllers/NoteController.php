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
		$note = \App\Note::with('blocks','references')->where('user_id',$user_id)->where('slug',$slug)->firstOrFail();
		return $note;
	}

	public function saveBlocks(Request $request, \App\Note $note){
		$user = Auth::user();
		if($note->user_id != $user->id) abort(403);
		$input = $request->input();

		$blocks_ids = [];
		$temp_ids = [];
		//save all first;
		foreach($input as $postdata){

			$text = $postdata['text'];

			if(!empty($postdata['id'])){
				$block = \App\Block::where('note_id',$note->id)->findOrFail($postdata['id']);
				$block->text = $text;
				$block->order = $postdata['order'];
				$block->save();
				$blocks_ids[] = $block->id;


			} else {
				$block = new \App\Block;
				$block->text = $text;
				$block->order = $postdata['order'];
				$block->note_id = $note->id;
				$block->save();
				$blocks_ids[] = $block->id;
				if($postdata['temp_id']) $temp_ids[$postdata['temp_id']] = $block->id;
			}


			\App\Reference::where('block_id',$block->id)->delete();


			if(preg_match_all('/\[\[([^]]+)\]\]/',$text,$matches)) {


				foreach($matches[1] as $block_name){


					$related_note = \App\Note::firstOrCreate(['name'=>$block_name,'user_id'=>$user->id]);

					\App\Reference::create([
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
				$oldBlock->delete();
			}

			return $temp_ids;
		}


		public function update(Request $request, \App\Note $note){
			if($note->user_id != Auth::user()->id) abort(403);
			$input = $request->input();

			$note->name = $input['name'];

			$note->save();
			return $note;
		}




	}