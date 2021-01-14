<template>
	<div :style="styleBlock(block.level)">
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
import { useStore } from 'vuex';

export default {
	props: ["key", "block"],
	setup(props, context) {
		const store = useStore();
		const block = props.block;
		const index = props.key;

		const state = reactive({
			note: {
				blocks: [],
				references:[],
			 },
			textareaDOM: null,
			selectedIndex: store.state.selectedIndex,
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
			context.emit('onKeydown', event);
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

		const {  selectedIndex, textareaDOM } = toRefs( state );
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
