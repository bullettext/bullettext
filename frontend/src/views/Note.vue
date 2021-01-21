<template>
	<div>
		<div class="container" v-if="note.id" :data-note="note.id">
			<button @click="saveAll">save</button>
			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			INDEX: {{selectedIndex}}
			<div class="blocks">
				<block-element
					v-for="(block, index) in note.blocks"
					:key="keyElement(block, index)"
					:index="index"
					:block="block"
					@onKeydown="onKeydown"
				/>
			</div>

			<list-references v-if="note.references" :references="note.references" />

		</div>
	</div>
</template>
<script>
import axios from "axios";
import { ref, reactive, computed, onMounted, toRefs, nextTick } from 'vue';
import store from '@/store';
import ListReferences from "../components/Note/ListReferences";
import BlockElement from "../components/Note/BlockElement";
// import { count, increment, alertMessage } from '../plugins/Editor';
//import BlockList from "@/components/BlockList";

export default {
  components: { ListReferences, BlockElement },
	props: ["slug"],
	setup(props, context) {
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
		});

		const keyDownFunctions = {
			ArrowUp : (event) => {
				if(!computedFunctions.previusBlock) return;
				if(!isFirstLine()) return;
				event.preventDefault();
				store.state.selectedIndex--;
				let relativeCursorPosition = cursorPosition() + cursorOffset();
				focusTextarea(relativeCursorPosition);
			},
			ArrowDown: (event) => {
				if(!computedFunctions.nextBlock) return;
				if(!isLastLine()) return;
				let relativeCursorPosition = cursorPosition() - cursorOffset();
				//caso o proximo bloco tenha +1 linha e o cursorposition do current block é maior que o tamanho da primeira linha, define o tamanho maximo como o length da primeira linha para evitar que o cursor seja posicionado na segunda linha
				relativeCursorPosition = Math.min(relativeCursorPosition,computedFunctions.nextBlock.text.split("\n")[0].length);

				store.state.selectedIndex++;
				focusTextarea(relativeCursorPosition);

			},
			ShiftAltArrowUp : (event) => {
				if(!computedFunctions.previusBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex-1,removeBlock());
				store.state.selectedIndex--;
				focusTextarea(cursorPosition());
			},
			ShiftAltArrowDown: (event) => {
				if(!computedFunctions.nextBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex+1,removeBlock());
				store.state.selectedIndex++;
				focusTextarea(cursorPosition());
			},
			Tab: (event) => {
				event.preventDefault();
				if(!computedFunctions.previusBlock) return;
				computedFunctions.currentBlock.level = Math.min(computedFunctions.previusBlock.level+1,computedFunctions.currentBlock.level+1);
			},
			ShiftTab: (event) => {
				event.preventDefault();
				if(!computedFunctions.previusBlock) return;
				computedFunctions.currentBlock.level	= Math.max(computedFunctions.currentBlock.level-1,0);
			},
			Delete: (event) => {
				if(cursorPosition() !== computedFunctions.currentBlock.text.length) return;
				if(!computedFunctions.nextBlock) return;
				event.preventDefault();
				const size = computedFunctions.currentBlock.text.length;
				computedFunctions.currentBlock.text += computedFunctions.nextBlock.text;
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
				if(!computedFunctions.previusBlock) return;
				event.preventDefault();
				const size = computedFunctions.previusBlock.text.length;
				computedFunctions.previusBlock.text += computedFunctions.currentBlock.text;
				removeBlock();
				store.state.selectedIndex--;
				focusTextarea(size);
			},
			Enter: (event) => {
				event.preventDefault();
				// if(hasMenu())
				let start = cursorPosition();
				let textStart = computedFunctions.currentBlock.text.substr(0, start);
				let textEnd = computedFunctions.currentBlock.text.substr(start);
				computedFunctions.currentBlock.text = textStart;
				let newBlock = {
					text: textEnd,
					parent_id: computedFunctions.currentBlock.parent_id,
					level: computedFunctions.currentBlock.level,
					temp_id:`temp${new Date().getTime()}`,

				};
				insertBlock( state.selectedIndex+1, newBlock );
				store.state.selectedIndex++;
				focusTextarea(0);
			},

		};

		const computedFunctions = reactive({
			currentBlock: computed(() => {
				return state.note.blocks[state.selectedIndex];
			}),
			nextBlock: computed(() => {
				return state.note.blocks[state.selectedIndex + 1];
			}),
			previusBlock: computed(() => {
				return state.note.blocks[state.selectedIndex - 1];
			}),
		});

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
			return `index-${index}-${id}`;
		}
		const cursorOffset = () =>{
			let lines = computedFunctions.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length
			//let match = text.match(/^([\s\S]+)\n/); return match?match.pop().length:0;
		}
		const isFirstLine = () =>{
			let lines = computedFunctions.currentBlock.text.split("\n");
			return lines[0].length >= cursorPosition();
		}
		const isLastLine = () =>{
			let lines = computedFunctions.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length <= cursorPosition();
		}
		const onKeydown = (event) => {
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
			return removed[0];
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

		const findParent = (id, level) => {
			if(level == 0) return null;
			let previusBlock = null;
			let parentId = null;
			state.note.blocks.forEach((block) => {
				if(block.level == level - 1) {
					previusBlock = block;
				} else if(block.level == level) {
					let blockId = block.id || block.temp_id;
					if(blockId == id) {
						let previusBlockId = previusBlock.id || previusBlock.temp_id;
						parentId = previusBlockId;
					}
				}
			});
			return parentId;
		}

		const saveAll = () => {
			console.log('saving');

			const note_id = state.note.id;

			let data = state.note.blocks;
			data.forEach((block, index) => {
				let id = block.id || block.temp_id;
				block.parent_id = findParent(id, block.level);
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
					store.state.notes = [...res.data.new_notes, ...store.state.notes];
			}).catch(res=>{
					console.error('save error');
					console.error(res);
			});
		}

		const updateBlockRefs = () => {

		}

		onMounted(() => {

			store.getNote(props.slug).then(res => {
				state.note = res.data;
			});
		});



		const { note } = toRefs(state);

		const { selectedIndex } = toRefs(store.state);

		return {
			note,
			keyElement,
			selectedIndex,
			onKeydown,
			saveAll
		}
	}
};
</script>
