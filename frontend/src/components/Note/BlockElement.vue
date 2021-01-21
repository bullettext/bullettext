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
	</div>
</template>
<script>
import { ref, reactive, computed, onMounted, toRefs, nextTick } from 'vue';

import store from '@/store';

export default {
	props: ["index", "block"],
	setup(props, context) {
		const block = props.block;
		const index = props.index;

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
			CtrlEnter: (event) => {
				setTodo();
			},

		}

		function cursorPosition(newval) {
			if(!state.textareaDOM) return 0;
			if(newval===undefined){
				return
			state.textareaDOM.selectionStart;
			}

			state.textareaDOM.selectionStart = newval;

			state.textareaDOM.selectionEnd = newval;
		}

		const styleBlock = (level) => {
			return 	{
				marginLeft: `${20*level}px`
			};
		}
		const onKeydown = (event) => {
			console.log({onKeydown: event})
			let command = '';
			if(event.ctrlKey) command += 'Ctrl';
			if(event.shiftKey) command += 'Shift';
			if(event.altKey) command += 'Alt';
			command += event.key;
			if(typeof keyDownFunctions[command] === 'function'){
				keyDownFunctions[command](event);
				return;
			}
			context.emit('onKeydown', event);
		}
		const focusTextarea = (position) => {
			console.log('position',position);
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

			state.textareaDOM.style.height = `${
			state.textareaDOM.scrollHeight}px`;
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
			return text;
		}

		const {  selectedIndex } = toRefs( state );
		const { textareaDOM } = toRefs(store.state);
		return {
			selectedIndex,
			styleBlock,
			textareaDOM,
			marked,
			onClickBlock,
			setInputHeight,
			onKeydown,
			block,
			index
		}
	}
};
</script>
