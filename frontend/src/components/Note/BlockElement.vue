<template>
	<div :style="styleBlock(block.level)" :data-index="index" :data-id="block.id" :data-temp_id="block.temp_id">
		<textarea
			v-if="selectedIndex === index"
			v-model="block.text"
			ref="textareaDOM"
			@input="setInputHeight"
			@keydown="onKeydown"
		/>
		<p @click="onClickBlock(index,$event)" v-html="marked(block.text)"></p>
		<context-menu
			v-if="menu.open && selectedIndex === index"
			:isReference="menu.isReference"
			@action="callAction"
			@close="closeMenu"
			class="menu-context"
			:style="styleMenu"
		/>
	</div>
</template>
<script>
import { ref, reactive, computed, onMounted, toRefs, nextTick } from 'vue';

import store from '@/store';
import {useRouter} from 'vue-router';
import ContextMenu from './ContextMenu.vue';

export default {
	props: ["index", "block"],
	components: { ContextMenu },
	setup(props, context) {

		const router = useRouter();

		const block = props.block;
		const index = props.index;

		const state = reactive({
			note: {
				blocks: [],
				references:[],
			 },
			 menu: {
				 active: false,
				 top: 0,
				 left: 0,
				 position: 0
			 },
			selectedIndex: computed(() => {
				return store.state.selectedIndex;
			}),
			textareaDOM: computed(() => {
				return store.state.textareaDOM;
			}),
		});

		const styleMenu = computed(() => {
			return 	{
				top: `${state.menu.top}px`,
				left: `${state.menu.left}px`,
			};
		});

		const keyDownFunctions = {
			CtrlEnter: (event) => {
				setTodo();
			},
		  CtrlB: (event) => {
				setBold(event);
			},
			CtrlI: (event) => {
				setItalic(event);
			},
		  '/': (event) => {
				createMenu();
			},
		  '[': (event) => {
				addLetter(']');
				if(prevCharacter('[') && nextCharacter(']')) {
					createMenu(true);
				}
			},
		  'Shift(': (event) => {
				addLetter(')');
			},
		}

		const createMenu = (isReference) => {
			const position = getCaretPosition();
			state.menu.top = position.y;
			state.menu.left = position.x;
			state.menu.position = cursorPosition();
			state.menu.open = true;
			state.menu.isReference = (isReference || false);
		}

		const prevCharacter = (letter) => {
			const textarea = state.textareaDOM;
			const selectionStart = textarea.selectionStart;
			let prevCharacter = block.text.substring(selectionStart-1,selectionStart);
			return letter == prevCharacter;
		}
		const nextCharacter = (letter) => {
			const textarea = state.textareaDOM;
			const selectionEnd = textarea.selectionEnd;
			let nextCharacter = block.text.substring(selectionEnd,selectionEnd+1);
			return letter == nextCharacter;
		}

		const closeMenu = ()=>{
				state.menu.open = false;
		}

		const addLetter = (letter) => {
			const selectionStart = state.textareaDOM.selectionStart;
			block.text = block.text.substring(0,selectionStart) +
				letter +
				block.text.substring(selectionStart);
			nextTick(function() {
				state.textareaDOM.selectionStart = state.textareaDOM.selectionEnd = selectionStart;
			})
		}

		const setTextFormat = (append, event) => {
			const selectionStart = state.textareaDOM.selectionStart;
			const selectionEnd = state.textareaDOM.selectionEnd;
			const sizeAppend = append.length;
			block.text = block.text.substring(0,selectionStart) + append + block.text.substring(selectionStart);
			block.text = block.text.substring(0,selectionEnd+sizeAppend) + append + block.text.substring(selectionEnd+sizeAppend);
			state.textareaDOM.selectionStart = selectionStart + sizeAppend;
			state.textareaDOM.selectionEnd = selectionEnd + sizeAppend;
			if(event) event.preventDefault();
		}
		const setBold = (event) => {
			setTextFormat('**', event);
		}

		const setItalic = (event) => {
			setTextFormat('*', event);
		}

		const insertCurrentDate = () => {
			const date = new Date();
			const year = date.getFullYear();
			const month = ('0'+(date.getMonth()+1)).substr(-2);
			const day = ('0'+(date.getDate())).substr(-2);
			const dateStr = `[[${year}-${month}-${day}]]`;
			addLetter(dateStr);
		}

		const insertCurrentTime = function() {
			const date = new Date();
			const hours = ('0'+(date.getHours()+1)).substr(-2);
			const minutes = ('0'+(date.getMinutes()+1)).substr(-2);
			const timeStr = `${hours}:${minutes}`;
			addLetter(timeStr);
		}

		const datepiker = function() {
			alert('Not implemented');
		}

		const cursorPosition = (newval) => {
			console.log(state.textareaDOM);
			if(!state.textareaDOM) return 0;
			if(newval===undefined){
				return state.textareaDOM.selectionStart;
			}

			state.textareaDOM.selectionStart = newval;

			state.textareaDOM.selectionEnd = newval;
		}

		const styleBlock = (level) => {
			return 	{
				marginLeft: `${20*level}px`
			};
		}

		const callAction = (event) => {
			const action = event.action;
			const params = event.params || {};
			console.log({action, params});
			focusTextarea(state.menu.position);
			nextTick(function() {
				if(action == 'setItalic') {
					setItalic();
				}
				if(action == 'setBold') {
					setBold();
				}
				if(action == 'insertCurrentDate') {
					insertCurrentDate();
				}
				if(action == 'insertCurrentTime') {
					insertCurrentTime();
				}
				if(action == 'createMenuReference') {
					createMenu();
				}
				if(action == 'reference') {
					console.log('entrou');
					addLetter(params.text);
				}
				if(action == 'datepiker') {
					datepiker();
				}
				if(action == 'insertTodo') {
					setTodo();
				}
				if(action == 'write') {
					addLetter(params.text);
				}
			})
		}

		const onKeydown = (event) => {
			if(process.env.VUE_APP_VERBOSE) console.log({onKeydown: event})
			let command = '';
			if(event.ctrlKey) command += 'Ctrl';
			if(event.shiftKey) command += 'Shift';
			if(event.altKey) command += 'Alt';
			command += event.key;
			if(process.env.VUE_APP_VERBOSE) console.log({command})

			if(state.menu.open) { return false; }

			if(typeof keyDownFunctions[command] === 'function'){
				keyDownFunctions[command](event);
			}
			context.emit('onKeydown', event);
		}
		const focusTextarea = (position) => {
			if(process.env.VUE_APP_VERBOSE) console.log('position',position);
			nextTick(function() {
				if(!state.textareaDOM){
					console.error('Textarea not found');
					return;
				}
				state.textareaDOM.focus();
				cursorPosition(position);
				setInputHeight();
			});
		}
		const setInputHeight = () => {
			state.textareaDOM.style.height = "1.5em";
			state.textareaDOM.style.height = `${state.textareaDOM.scrollHeight}px`;
		}
		const getCaretPosition = () => {
			const textarea = state.textareaDOM;
			var span = document.createElement('span');
			span.className = 'calculate';
			var text = state.textareaDOM.value.substr(0,textareaDOM.selectionStart);
			span.innerHTML = text + '<span id="caret"></span>';
			span.style.width = state.textareaDOM.offsetWidth+'px';

			document.body.appendChild(span);

			var caret = span.querySelector('#caret');
			var ret = {
				x:caret.offsetLeft+4,
				y:caret.offsetTop,
			}

			document.querySelectorAll('.calculate').forEach(span=>{
				span.parentNode.removeChild(span);
			});

			return ret;
		}
		const selectBlock = (index) => {
			store.state.selectedIndex = index;
			let position = window.getSelection().getRangeAt(0).endOffset;
			focusTextarea(position);
		}
		const onClickBlock = (index,event) => {
			if(event.target.matches('.checkbox')){
				toggleCheckbox(block)
				return;
			}
			if(event.target.matches('.reference')){
				event.preventDefault();
				router.push({path:event.target.href})
				return;
			}
			selectBlock(index,event);
		}
		const setTodo = () => {
			let text = block.text;

			if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
				text = "[[TODO]] " + text;
			} else if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\] */, "");
			}
			block.text = text;
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

			var matches = text.match(/\[\[([^\]]+)\]\]/g);
			if(matches) matches.forEach(match=>{
				var note_name = match.replace(/[\[\]]/g,'');
				var note = store.state.notes.find(note=>{
					return note.name == note_name
				});
				if(!note) return;
				text = text.replace(match,`<a class="reference" href="/${note.slug}">${match}</a>`);
			});

			return text;
		}


		const {  selectedIndex, menu } = toRefs( state );
		const { textareaDOM } = toRefs(store.state);
		return {
			menu,
			callAction,
			selectedIndex,
			styleBlock,
			textareaDOM,
			marked,
			onClickBlock,
			setInputHeight,
			onKeydown,
			block,
			index,
			closeMenu,
			styleMenu
		}
	}
};
</script>
