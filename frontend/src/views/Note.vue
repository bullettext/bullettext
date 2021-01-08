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
							@input="setInputHeight()"
							@keydown="onKeydown($event)"
						/>
						<p @click="selectBlock(index,$event)">{{ block.text }}</p>
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
			keyUpFunctions: {
				ArrowUp : (event) => {
					this.keyDownFunctions.ArrowUpDown(event, -1);
				},
				ArrowDown: (event) => {
					if(this.$refs.textarea.selectionStart == this.currentBlock().text.length){
						this.keyDownFunctions.ArrowUpDown(event, +1);
					}

				},
				ArrowUpDown: (event, move) => {
					event.preventDefault();
					if(event.shiftKey && event.altKey){
						let removed = this.note.blocks.splice(this.selectedIndex,1);
						this.note.blocks.splice(this.selectedIndex + move,0,removed[0]);
					}
					var cursorPosition = this.$refs.textarea.selectionStart;
					this.selectedIndex += move;
					this.focusTextarea(cursorPosition);
				},
			},
			keyDownFunctions: {
				ArrowUp : (event) => {
					this.keyDownFunctions.ArrowUpDown(event, -1);
				},
				ArrowDown: (event) => {
					if(this.$refs.textarea.selectionStart == this.currentBlock().text.length){
						this.keyDownFunctions.ArrowUpDown(event, +1);
					}

				},
				Tab: (event) => {
					event.preventDefault();
					let move = +1;
					if(event.shiftKey) move = -1;
					this.note.blocks[this.selectedIndex].level += move;
					if(this.note.blocks[this.selectedIndex].level < 0) {
						this.note.blocks[this.selectedIndex].level = 0;
					}
				},
				Delete: (event) => {
					let textarea = this.$refs.textarea;
					if(textarea.selectionStart == textarea.value.length) {
						let nextBlock = this.nextBlock();
						if(!nextBlock) return;

						event.preventDefault();
						const size = this.currentBlock().text.length;
						this.currentBlock().text += nextBlock.text;
						this.removeBlock(+1);
						this.focusTextarea(size);
					}

				},
				Backspace: (event) => {
					let textarea = this.$refs.textarea;
					if(textarea.selectionEnd == 0) {
						let previusBlock = this.previusBlock();
						if(!previusBlock) return;

						event.preventDefault();
						const size = previusBlock.text.length;
						previusBlock.text += this.currentBlock().text;
						this.removeBlock();
						this.selectedIndex--;
						this.focusTextarea(size);
					}
				},
				Enter: (event) => {
					if(event.shiftKey) return;
					event.preventDefault();
					// if(hasMenu())
					if(event.ctrlKey) {
						this.setTodo();
					} else {
						let start = this.$refs.textarea.selectionStart;
						let textStart = this.currentBlock().text.substr(0, start);
						let textEnd = this.currentBlock().text.substr(start);
						this.currentBlock().text = textStart;
						let newBlock = {
							text: textEnd,
							parent_id: this.currentBlock().parent_id,
							level: this.currentBlock().level
						};
						this.note.blocks.splice( this.selectedIndex+1, 0, newBlock );
						this.selectedIndex++;
						this.focusTextarea(0);
					}

				}
			}
		}
	},
	computed: {
		notes() {
			return this.$store.getters.notes;
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
		styleBlock(level) {
			return 	{
				marginLeft: `${20*level}px`
			};
		},
		onKeydown(event){
			if(typeof this.keyDownFunctions[event.key] === 'function'){
				console.log(`Key down: ${event.key}\n---`);
				this.keyDownFunctions[event.key](event);
			}
		},
		onKeyup(event){
			if(typeof this.keyUpnFunctions[event.key] === 'function'){
				console.log(`Key up: ${event.key}\n---`);
				this.keyUpFunctions[event.key](event);
			}
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
		removeBlock(nearBy) {
			if(!nearBy) nearBy = 0;
			let removed = this.note.blocks.splice(this.selectedIndex + nearBy,1);
			return removed[0];
		},
		focusTextarea(cursorPosition){
			console.log('cursorPosition',cursorPosition);
			this.$nextTick(function(){
				console.log('textarea depois',this.$refs.textarea);
				this.$refs.textarea.focus();
				this.$refs.textarea.selectionStart = cursorPosition;
				this.$refs.textarea.selectionEnd = cursorPosition;
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
		setTodo() {
			let text = this.currentBlock().text;

			if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
				text = "[[TODO]] " + text;
			} else if (text.match(/^\[\[TODO\]\]/)) {
				text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
			} else if (text.match(/^\[\[DONE\]\]/)) {
				text = text.replace(/^\[\[DONE\]\] */, "");
			}
			this.currentBlock().text = text;
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
