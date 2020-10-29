<template>
	<div>
		<div class="container" :data-note="note.id">
			<div class="my-3">
				<h1>{{ note.name }}</h1>
			</div>
			<div class="blocks">
				<div class="vanilla"><ul></ul></div>
			</div>
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
		note() {
			return this.$store.state.note;
		},
	},
	methods: {
		addHistory(){ window.addHistory() },
		revertHistory(){ window.revertHistory() },
	},
	created() {
		this.$store.dispatch("getNote", this.slug).then(res => {
			this.note_id = res.data.id;
			hydrate(res.data.id, res.data.blocks);
			if(res.data.blocks.length==0){
				window.newBlock(res.data.id);
			}
		});
	},
};
</script>

<style scoped></style>
