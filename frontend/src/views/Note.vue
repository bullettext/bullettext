<template>
	<div>
		<div class="container" v-if="note.id" :data-note="note.id">
			<button onclick="saveAll()">save</button>
			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			<p>selectedIndex:{{selectedIndex}}</p>

			<div class="blocks">
				<ul>
					<li v-for="(block,index) in note.blocks" :key="block.id" :style="styleBlock(block.level)">
						<textarea
							v-if="selectedIndex === index"
							v-model="block.text"
							ref="textarea"
							@input="setInputHeight"
							@keydown="onKeydown"
						/>
						<p @click="onClickBlock(index,$event)" v-html="marked(block.text)"></p>
					</li>
				</ul>
			</div>

			<ul class="references" v-if="note.references">
				<li v-for="(block,index) in references" :key="index">
					<router-link :to="'/'+block.note.slug">{{block.note.name}}</router-link>
					<p>{{block.text}}</p>
				</li>
			</ul>

		</div>
	</div>
</template>
<script>
import axios from "axios";
//import BlockList from "@/components/BlockList";

export default {
	name: "note",
	components: {
	//	BlockList
	},

	props: ["slug"],
	data() {
		return {
			note:{},
			selectedIndex: -1,
			keyDownFunctions: {
				ArrowUp : (event) => {
					if(!this.previusBlock) return;
					if(!this.isFirstLine()) return;
					event.preventDefault();
					this.selectedIndex--;
					let relativeCursorPosition = this.cursorPosition() + this.cursorOffset();
					this.focusTextarea(relativeCursorPosition);
				},
				ArrowDown: (event) => {
					if(!this.nextBlock) return;
					if(!this.isLastLine()) return;
					let relativeCursorPosition = this.cursorPosition() - this.cursorOffset();
					//caso o proximo bloco tenha +1 linha e o cursorposition do current block é maior que o tamanho da primeira linha, define o tamanho maximo como o length da primeira linha para evitar que o cursor seja posicionado na segunda linha
					relativeCursorPosition = Math.min(relativeCursorPosition,this.nextBlock.text.split("\n")[0].length);

					this.selectedIndex++;
					this.focusTextarea(relativeCursorPosition);

				},
				ShiftAltArrowUp : (event) => {
					if(!this.previusBlock) return;
					event.preventDefault();
					this.insertBlock(this.selectedIndex-1,this.removeBlock());
					this.selectedIndex--;
					this.focusTextarea(this.cursorPosition());
				},
				ShiftAltArrowDown: (event) => {
					if(!this.nextBlock) return;
					event.preventDefault();
					this.insertBlock(this.selectedIndex+1,this.removeBlock());
					this.selectedIndex++;
					this.focusTextarea(this.cursorPosition());
				},

				Tab: (event) => {
					event.preventDefault();
					if(!this.previusBlock) return;
					this.currentBlock.level = Math.min(this.previusBlock.level+1,this.currentBlock.level+1);
				},
				ShiftTab: (event) => {
					event.preventDefault();
					if(!this.previusBlock) return;
					this.currentBlock.level	= Math.max(this.currentBlock.level-1,0);
				},
				Delete: (event) => {
					if(this.cursorPosition() !== this.currentBlock.text.length) return;
					if(!this.nextBlock) return;
					event.preventDefault();
					const size = this.currentBlock.text.length;
					this.currentBlock.text += this.nextBlock.text;
					this.removeBlock(+1);
					this.focusTextarea(size);
				},
				ShiftDelete: (event) => {
					event.preventDefault();
					this.removeBlock();
					this.focusTextarea(0);
				},
				Backspace: (event) => {
					if(this.cursorPosition() !== 0) return;
					if(!this.previusBlock) return;
					event.preventDefault();
					const size = this.previusBlock.text.length;
					this.previusBlock.text += this.currentBlock.text;
					this.removeBlock();
					this.selectedIndex--;
					this.focusTextarea(size);
				},
				Enter: (event) => {
					event.preventDefault();
					// if(hasMenu())
					let start = this.cursorPosition();
					let textStart = this.currentBlock.text.substr(0, start);
					let textEnd = this.currentBlock.text.substr(start);
					this.currentBlock.text = textStart;
					let newBlock = {
						text: textEnd,
						parent_id: this.currentBlock.parent_id,
						level: this.currentBlock.level
					};
					this.insertBlock( this.selectedIndex+1, newBlock );
					this.selectedIndex++;
					this.focusTextarea(0);
				},
				CtrlEnter: (event) => {
					this.setTodo();
				},
			}
		}
	},
	computed: {
		notes() {
			return this.$store.getters.notes;
		},
		currentBlock() {
			return this.note.blocks[this.selectedIndex];
		},
		nextBlock() {
			return this.note.blocks[this.selectedIndex + 1];
		},
		previusBlock() {
			return this.note.blocks[this.selectedIndex - 1];
		},
		references(){
			if(!this.notes || !this.note.references) return false;
			var blocks = this.note.references;

			return blocks.map(block=>{
				block.note = this.notes[block.note_id];
				return block;
			})

		},
	},
	methods: {
		cursorPosition(newval){
			if(!this.$refs.textarea) return 0;
			if(newval===undefined){
				return this.$refs.textarea.selectionStart;
			}
			this.$refs.textarea.selectionStart = newval;
			this.$refs.textarea.selectionEnd = newval;
		},
		cursorOffset(){
			let lines = this.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length
			//let match = text.match(/^([\s\S]+)\n/); return match?match.pop().length:0;
		},
		isFirstLine(){
			let lines = this.currentBlock.text.split("\n");
			return lines[0].length >= this.cursorPosition();
		},
		isLastLine(){
			let lines = this.currentBlock.text.split("\n");
			lines.pop();
			return lines.join("\n").length <= this.cursorPosition();
		},
		styleBlock(level) {
			return 	{
				marginLeft: `${20*level}px`
			};
		},
		onKeydown(event){
			let command = '';
			if(event.ctrlKey) command += 'Ctrl';
			if(event.shiftKey) command += 'Shift';
			if(event.altKey) command += 'Alt';
			command += event.key;

			if(typeof this.keyDownFunctions[command] === 'function'){
				console.log(`Key down: ${command}\n---`);
				this.keyDownFunctions[command](event);
			}
		},
		removeBlock(nearBy) {
			if(!nearBy) nearBy = 0;
			let removed = this.note.blocks.splice(this.selectedIndex + nearBy,1);
			return removed[0];
		},
		insertBlock(index,block) {
			this.note.blocks.splice(index,0,block);
		},
		focusTextarea(cursorPosition){
			console.log('cursorPosition',cursorPosition);
			this.$nextTick(function(){
				console.log('textarea depois',this.$refs.textarea);
				this.$refs.textarea.focus();
				this.cursorPosition(cursorPosition)
				this.setInputHeight();
			});
		},
		setInputHeight() {
			this.$refs.textarea.style.height = "1.5em";
			this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`;
		},
		selectBlock(index,e){
			this.selectedIndex = index;

			var cursorPosition = window.getSelection().getRangeAt(0).endOffset;
			this.focusTextarea(cursorPosition);
		},
		onClickBlock(index,event){
			if(event.target.matches('.checkbox')){
				let block = this.note.blocks[index];
				this.toggleCheckbox(block)
				return;
			}
			this.selectBlock(index,event);
		},
		setTodo() {
			let text = this.currentBlock.text;

			if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
				text = "[[TODO]] " + text;
			} else if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\] */, "");
			}
			this.currentBlock.text = text;
		},
		toggleCheckbox(block) {
			let text = block.text;
			if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\]/, "[[TODO]]");
			}
			block.text = text;
		},
		marked(text){
			if(!text) return '';
			text = text.replace(/^\[\[TODO\]\]/,'<span class="checkbox"></span>')
			text = text.replace(/^\[\[DONE\]\]/,'<span class="checkbox checked"></span>')

			text = text.replace(/\*\*([^\*]+)\*\*/g,'<strong>$1</strong>')
			text = text.replace(/__([^_]+)__/g,'<strong>$1</strong>')
			text = text.replace(/~~([^~]+)~~/g,'<del>$1</del>')

			text = text.replace(/\*([^\*]+)\*/g,'<em>$1</em>')
			text = text.replace(/_([^_]+)_/g,'<em>$1</em>')
/*
			var matches = text.match(/\[\[([^\]]+)\]\]/g);
			if(matches) matches.forEach(match=>{
				var note_name = match.replace(/[\[\]]/g,'');
				var note = store.state.notes.find(note=>{
					return note.name == note_name
				});
				if(!note) return;
				text = text.replace(match,`<a class="reference" href="/${note.slug}">${match}</a>`);
			});
*/
			return text;
		}
	},
	mounted() {
		if(!this.notes){
			this.$store.dispatch('getNotesIndex');
		}

		this.$store.dispatch("getNote", this.slug).then(res => {
			this.note = res.data;
		});
	},
};
</script>

<style scoped></style>
