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
						<textarea v-if="selectedIndex === index" v-model="block.text" ref="textarea" @keydown="onKeydown($event)"></textarea>
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
		};
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

		}
	},
	methods: {
		styleBlock(level) {
			return 	{
				marginLeft: `${20*level}px`
			};
		},
		onKeydown(e){
			if(e.key=='ArrowUp'){
				e.preventDefault();
				if(e.shiftKey && e.altKey){
					//mover bloco pra cima
					let removed = this.note.blocks.splice(this.selectedIndex,1);
					this.note.blocks.splice(this.selectedIndex-1,0,removed[0]);
				}
				var cursorPosition = this.$refs.textarea.selectionStart;
				this.selectedIndex--;
				this.focusTextarea(cursorPosition);
			}
			if(e.key=='ArrowDown'){
				e.preventDefault();
				if(e.shiftKey && e.altKey){
					let removed = this.note.blocks.splice(this.selectedIndex,1);
					this.note.blocks.splice(this.selectedIndex+1,0,removed[0]);
				}
				var cursorPosition = this.$refs.textarea.selectionStart;
				this.selectedIndex++;
				this.focusTextarea(cursorPosition);
			}
		},
		focusTextarea(cursorPosition){
			console.log('cursorPosition',cursorPosition);
			this.$nextTick(function(){
				console.log('textarea depois',this.$refs.textarea);
				this.$refs.textarea.focus();
				this.$refs.textarea.selectionStart = cursorPosition;
				this.$refs.textarea.selectionEnd = cursorPosition;
			});
		},
		selectBlock(index,e){
			this.selectedIndex = index;

			var cursorPosition = window.getSelection().getRangeAt(0).endOffset;
			this.focusTextarea(cursorPosition);

		},
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
