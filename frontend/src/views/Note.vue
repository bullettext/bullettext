<template>
	<div>
		<div class="container" v-if="note_id" :data-note="note_id">
			<button onclick="saveAll()">save</button>
			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			<div class="blocks">
				<div class="vanilla"><ul></ul></div>
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
import BlockList from "@/components/BlockList";

export default {
	name: "note",
	components: {
		BlockList
	},

	props: ["slug"],
	data() {
		return {
			note_id:null,
		};
	},
	computed: {
		notes() {
			return this.$store.getters.notes;
		},
		note() {
			return this.$store.state.note;
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

		addHistory(){ window.addHistory() },
		revertHistory(){ window.revertHistory() },
	},
	mounted() {

		if(!this.notes){
			this.$store.dispatch('getNotesIndex');
		}

		this.$store.dispatch("getNote", this.slug).then(res => {
			this.note_id = res.data.id;
			this.$nextTick(()=>{
				hydrate(res.data.id, res.data.blocks);
				if(res.data.blocks.length==0){
					window.newBlock(res.data.id);
				} else {
					var firstBlock = document.querySelector('.blocks [data-block]');
					if(firstBlock) editBlock(firstBlock);
				}
			})
		});
	},
};
</script>

<style scoped></style>
