<template>
	<div>
		<div class="container" v-if="note.id" :data-note="note.id">

			<div class="info-saved">
				<button class="btn btn-sm" :disabled="!canUndo" @click="undo()"><ico size="20" ico="undo" /></button>
				<button class="btn btn-sm" :disabled="!canRedo" @click="redo()"><ico size="20" ico="redo" /></button>

				<button class="btn btn-sm text-muted" v-show="!isSaving && !canSave" @click="saveAll" :title="infoSaved">Saved<span v-show="infoSaved"> on {{infoSaved}}</span></button>
				<button class="btn btn-sm btn-primary" v-show="!isSaving && canSave" @click="saveAll">Save changes</button>
				<button class="btn btn-sm" v-show="isSaving" disabled>Saving <ico size="20" ico="loading" class="spin" /></button>
			</div>


			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			<p>INDEX: {{selectedIndex}}</p>

			<div class="blocks">
				<block-element
				v-for="(block, index) in note.blocks"
				:key="keyElement(block, index)"
				:index="index"
				:block="block"
				@onKeydown="onKeydown"
				/>
			</div>
			<list-references v-if="note.references.length" :references="note.references" />

		</div>
	</div>
</template>
<script>
	import axios from "axios";
	import { ref, reactive, computed, onMounted, toRefs, nextTick, onBeforeUnmount } from 'vue';

	import store from '@/store';
	import ListReferences from "../components/Note/ListReferences";
	import BlockElement from "../components/Note/BlockElement";
	import Ico from "../components/Ico";
// import { count, increment, alertMessage } from '../plugins/Editor';
//import BlockList from "@/components/BlockList";

export default {
	components: { ListReferences, BlockElement,Ico },
	props: ["slug"],
	setup(props, context) {

		let saveTimer = null;

		const state = reactive({
			note: {
				blocks: [],
				references:[],
			},
			selectedIndex: computed(() => {
				return store.state.selectedIndex;
			}),
			textareaDOM: computed(() => {
				return store.state.textareaDOM;
			}),
			currentBlock: computed(() => {
				return state.note.blocks[state.selectedIndex];
			}),
			nextBlock: computed(() => {
				return state.note.blocks[state.selectedIndex + 1];
			}),
			previusBlock: computed(() => {
				return state.note.blocks[state.selectedIndex - 1];
			}),

			historyCursor:-1,
			history:[],
			historyDisabled:false,
			edited:false,
			lastSavedTime:null,
			version:'0',

		});



		const keyDownFunctions = {
			ArrowUp : (event) => {
				if(!state.previusBlock) return;
				if(!isFirstLine()) return;
				event.preventDefault();
				store.state.selectedIndex--;
				let relativeCursorPosition = cursorPosition() + cursorOffset();
				focusTextarea(relativeCursorPosition);
			},
			ArrowDown: (event) => {
				if(!state.nextBlock) return;
				if(!isLastLine()) return;
				let relativeCursorPosition = cursorPosition() - cursorOffset();
				//caso o proximo bloco tenha +1 linha e o cursorposition do current block é maior que o tamanho da primeira linha, define o tamanho maximo como o length da primeira linha para evitar que o cursor seja posicionado na segunda linha
				relativeCursorPosition = Math.min(relativeCursorPosition,state.nextBlock.text.split("\n")[0].length);

				store.state.selectedIndex++;
				focusTextarea(relativeCursorPosition);

			},
			ShiftAltArrowUp : (event) => {
				if(!state.previusBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex-1,removeBlock());
				store.state.selectedIndex--;
				refactorOrderBlock();
				focusTextarea(cursorPosition());
			},
			ShiftAltArrowDown: (event) => {
				if(!state.nextBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex+1,removeBlock());
				store.state.selectedIndex++;
				refactorOrderBlock();
				focusTextarea(cursorPosition());
			},
			Tab: (event) => {
				event.preventDefault();
				if(!state.previusBlock) return;
				state.currentBlock.level = Math.min(state.previusBlock.level+1,state.currentBlock.level+1);
			},
			ShiftTab: (event) => {
				event.preventDefault();
				if(!state.previusBlock) return;
				state.currentBlock.level	= Math.max(state.currentBlock.level-1,0);
			},
			Delete: (event) => {
				if(cursorPosition() !== state.currentBlock.text.length) return;
				if(!state.nextBlock) return;
				event.preventDefault();
				const size = state.currentBlock.text.length;
				state.currentBlock.text += state.nextBlock.text;
				removeBlock(+1);
				focusTextarea(size);
			},
			ShiftDelete: (event) => {
				event.preventDefault();
				removeBlock();
				focusTextarea(0);
			},
			Backspace: (event) => {
				if(cursorPosition() !== 0) return;
				if(!state.previusBlock) return;
				event.preventDefault();
				const size = state.previusBlock.text.length;
				state.previusBlock.text += state.currentBlock.text;
				removeBlock();
				store.state.selectedIndex--;
				focusTextarea(size);
			},
			Enter: (event) => {
				event.preventDefault();
				// if(hasMenu())
				let start = cursorPosition();
				let textStart = state.currentBlock.text.substr(0, start);
				let textEnd = state.currentBlock.text.substr(start);
				state.currentBlock.text = textStart;
				let newBlock = {
					text: textEnd,
					parent_id: state.currentBlock.parent_id,
					level: state.currentBlock.level,
					temp_id:`temp${new Date().getTime()}`,
				};
				insertBlock( state.selectedIndex+1, newBlock );
				store.state.selectedIndex++;
				focusTextarea(0);
			},

		};





		const canUndo = computed(()=> {
			if(state.historyCursor == state.history.length-1 && state.edited) return true;
			return state.historyCursor>0;
		});
		const canSave = computed(()=>{
      return state.edited;// || this.canRedo;
    });
		const canRedo = computed(()=> {
			return state.historyCursor < state.history.length - 1;
		});

		const isSaving = computed(()=>{
			return state.lastSavedTime == 'Saving';
		});
		const infoSaved = computed(()=>{
			if(state.lastSavedTime == 'Saving') return "Saving...";
			if(state.lastSavedTime === null) return "";
			var date = state.lastSavedTime;
			var hh = ('0'+date.getHours()).substr(-2);
			var mm = ('0'+date.getMinutes()).substr(-2);
			var ss = ('0'+date.getSeconds()).substr(-2);
			return `${hh}:${mm}:${ss}`;
		});

		const undo = () =>{
			if (!canUndo) return;

			if(state.edited && state.historyCursor == state.history.length-1){
				var currentCursor = state.historyCursor;
				pushHistory();
				state.historyCursor = currentCursor;
				reloadPath(state.history[state.historyCursor]);
				state.edited = false;
				return;
			}

			if(state.historyCursor==0) return;

			state.historyDisabled = true;
			state.historyCursor --;
			reloadPath(state.history[state.historyCursor]);
			state.historyDisabled = false;
		}

		const reloadPath = (output)=>{
			console.log('reload',JSON.parse(output));
			state.note.blocks = JSON.parse(output);
			state.version = new Date().getTime();
			state.edited = true;
		}


		const redo = () =>{
			if (!canRedo) return;
			state.historyDisabled = true;
			state.historyCursor ++;
			reloadPath(state.history[state.historyCursor]);
			state.historyDisabled = false;
		}

		const pushHistory = ()=>{
			console.log('pushHistory');
			var output = JSON.stringify(state.note.blocks);
			if (!state.historyDisabled && output !== state.history[state.historyCursor]) {
				state.historyCursor ++;
				state.history.splice(state.historyCursor, state.history.length - state.historyCursor, output);
			}
		}


		function cursorPosition(newval) {
			if(!state.textareaDOM) return 0;
			if(newval===undefined){
				return state.textareaDOM.selectionStart;
			}
			state.textareaDOM.selectionStart = newval;
			state.textareaDOM.selectionEnd = newval;
		}
		const keyElement = (block,index) => {
			const id = block.id ? `id-${block.id}` : `temp_id-${block.temp_id}`;
			return `index-${index}-${id}-h${state.version}`;
		}
		const cursorOffset = () =>{
			let lines = state.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length
			//let match = text.match(/^([\s\S]+)\n/); return match?match.pop().length:0;
		}
		const isFirstLine = () =>{
			let lines = state.currentBlock.text.split("\n");
			return lines[0].length >= cursorPosition();
		}
		const isLastLine = () =>{
			let lines = state.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length <= cursorPosition();
		}
		const onKeydown = (event) => {
			state.edited = true;
			clearTimeout(saveTimer);
			saveTimer = setTimeout(()=>{ saveAll() },5000);

			let command = '';
			if(event.ctrlKey) command += 'Ctrl';
			if(event.shiftKey) command += 'Shift';
			if(event.altKey) command += 'Alt';
			command += event.key;
			if(typeof keyDownFunctions[command] === 'function'){
				console.log(`Key down: ${command}\n---`);
				keyDownFunctions[command](event);
			}
		}
		const removeBlock = (nearBy) => {
			if(!nearBy) nearBy = 0;
			let removed = state.note.blocks.splice(state.selectedIndex + nearBy,1);
			refactorOrderBlock();
			return removed[0];
		}

		const refactorOrderBlock = () => {

			let previusElement = { level: 0 };
			state.note.blocks[0].level=0;
			state.note.blocks.forEach((element) => {
				if(element.level - previusElement.level > 1) {
					element.level = previusElement.level + 1;
				}
				previusElement = element;
			})
		}

		const insertBlock = (index,block) => {
			state.note.blocks.splice(index,0,block);
		}
		const focusTextarea = (position) => {
			console.log('position',position);
			nextTick(function() {
				console.log('textarea depois',state.textareaDOM);
				state.textareaDOM.focus();
				cursorPosition(position);
				setInputHeight();
			});
		}
		const setInputHeight = () => {
			state.textareaDOM.style.height = "1.5em";
			state.textareaDOM.style.height = `${state.textareaDOM.scrollHeight}px`;
		}

		const saveAll = () => {
			console.log('saving');

			clearTimeout(saveTimer);
			state.lastSavedTime = 'Saving';
			state.edited = false;


			refactorOrderBlock();

			const note_id = state.note.id;

			let data = state.note.blocks;

			let path = [];
			//let counter = [];
			data.forEach((block,index) => {
				//set parent_id
				path[block.level] = block.id || block.temp_id;
				block.parent_id = block.level==0?null:path[block.level-1];

				block.order = index;
			});
			console.log(data);
			// addHistory(data);

			axios({
				method:'post',
				url:'/api/notes/save-blocks/'+note_id,
				data:data,
			}).then(res=>{
				console.log(res);
				updateBlocksRefs(res.data.temp_ids);
				pushHistory();
				store.state.notes = [...res.data.new_notes, ...store.state.notes];
				state.lastSavedTime = new Date();
			}).catch(res=>{
				console.error('save error');
				console.error(res);
			});
		}

		const updateBlocksRefs = (data) => {
			for(var temp_id in data){
				var block = state.note.blocks.find(block=>block.temp_id==temp_id);
				block.id = data[temp_id];
				block.temp_id = null;
				console.log(`${temp_id} updated to id ${block.id}`);
			}
		}

		onMounted(() => {
			store.getNote(props.slug).then(res => {
				state.note = res.data;
				if(res.data.blocks.length==0){
					let newBlock = {
						text: '',
						level: 0,
						temp_id:`temp${new Date().getTime()}`,
					};
					res.data.blocks.push(newBlock);
					store.state.selectedIndex=0;
					focusTextarea(0);
				} else {
					store.state.selectedIndex=0;
					if(res.data.blocks[0].text){
						focusTextarea(res.data.blocks[0].text.length);
					} else {
						focusTextarea(0);
					}
				}
				pushHistory()
			});
		});

		onBeforeUnmount(()=>{
			if(state.edited) {
				saveAll();
			}
		})

		const { note, history, historyCursor } = toRefs(state);

		const { selectedIndex } = toRefs(store.state);

		return {
			note,
			keyElement,
			selectedIndex,
			onKeydown,
			saveAll,
			infoSaved,
			undo,
			redo,
			canUndo,
			canRedo,
			isSaving,
			canSave,
			history,
			historyCursor
		}
	}
};
</script>
