<template>
	<div>
		<div class="container" v-if="note.id" :data-note="note.id">
			<button onclick="saveAll()">save</button>
			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			INDEX: {{selectedIndex}}
			<div class="blocks">
				<block-element
					v-for="(block, index) in note.blocks"
					:key="index"
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
import { useStore } from 'vuex';
import ListReferences from "../components/Note/ListReferences";
import BlockElement from "../components/Note/BlockElement";
// import { count, increment, alertMessage } from '../plugins/Editor';
//import BlockList from "@/components/BlockList";

export default {
  components: { ListReferences, BlockElement },
	props: ["slug"],
	setup(props, context) {
		const store = useStore();

		const state = reactive({
			note: {
				blocks: [],
				references:[],
			 },
			textareaDOM: null,
			selectedIndex: computed(() => {
				return store.state.selectedIndex;
			}),
		});

		const keyDownFunctions = {
			ArrowUp : (event) => {
				if(!computedFunctions.previusBlock) return;
				if(!isFirstLine()) return;
				event.preventDefault();
				state.selectedIndex--;
				let relativeCursorPosition = cursorPosition() + cursorOffset();
				focusTextarea(relativeCursorPosition);
			},
			ArrowDown: (event) => {
				if(!computedFunctions.nextBlock) return;
				if(!isLastLine()) return;
				let relativeCursorPosition = cursorPosition() - cursorOffset();
				//caso o proximo bloco tenha +1 linha e o cursorposition do current block é maior que o tamanho da primeira linha, define o tamanho maximo como o length da primeira linha para evitar que o cursor seja posicionado na segunda linha
				relativeCursorPosition = Math.min(relativeCursorPosition,computedFunctions.nextBlock.text.split("\n")[0].length);

				state.selectedIndex++;
				focusTextarea(relativeCursorPosition);

			},
			ShiftAltArrowUp : (event) => {
				if(!computedFunctions.previusBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex-1,removeBlock());
				state.selectedIndex--;
				focusTextarea(cursorPosition());
			},
			ShiftAltArrowDown: (event) => {
				if(!computedFunctions.nextBlock) return;
				event.preventDefault();
				insertBlock(state.selectedIndex+1,removeBlock());
				state.selectedIndex++;
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
				state.selectedIndex--;
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
					level: computedFunctions.currentBlock.level
				};
				insertBlock( state.selectedIndex+1, newBlock );
				state.selectedIndex++;
				focusTextarea(0);
			},
			CtrlEnter: (event) => {
				setTodo();
			},
		};

		const computedFunctions = reactive({
			currentBlock: computed(() => {
				console.log('found');
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
			console.log('IsLastLine');
			let lines = computedFunctions.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length <= cursorPosition();
		}
		const styleBlock = (level) => {
			return 	{
				marginLeft: `${20*level}px`
			};
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
		const selectBlock = (index) => {
			state.selectedIndex = index;

			let position = window.getSelection().getRangeAt(0).endOffset;
			focusTextarea(position);
		}
		const onClickBlock = (index,event) => {
			if(event.target.matches('.checkbox')){
				let block = note.blocks[index];
				toggleCheckbox(block)
				return;
			}
			selectBlock(index,event);
		}
		const setTodo = () => {
			let text = computedFunctions.currentBlock.text;

			if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
				text = "[[TODO]] " + text;
			} else if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\] */, "");
			}
			computedFunctions.currentBlock.text = text;
		}
		const toggleCheckbox = (block) => {
			let text = block.text;
			if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\]/, "[[TODO]]");
			}
			block.text = text;
		}
		const marked = (text) => {
			if(!text) return '';
			text = text.replace(/^\[\[TODO\]\]/,'<span class="checkbox"></span>');
			text = text.replace(/^\[\[DONE\]\]/,'<span class="checkbox checked"></span>');

			text = text.replace(/\*\*([^\*]+)\*\*/g,'<strong>$1</strong>');
			text = text.replace(/__([^_]+)__/g,'<strong>$1</strong>');
			text = text.replace(/~~([^~]+)~~/g,'<del>$1</del>');

			text = text.replace(/\*([^\*]+)\*/g,'<em>$1</em>');
			text = text.replace(/_([^_]+)_/g,'<em>$1</em>');
			return text;
		}

		onMounted(() => {
			store.dispatch("getNote", props.slug).then(res => {
				state.note = res.data;
				console.log({references: state.note.references});
			});
		});

		const { note, selectedIndex, textareaDOM } = toRefs(state);
		return {
			note,
			selectedIndex,
			styleBlock,
			textareaDOM,
			marked,
			onClickBlock,
			setInputHeight,
			onKeydown
		}
	}
};
</script>
