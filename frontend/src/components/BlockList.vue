<template>
	<ul :data-level="level">
		<li v-for="block in levelBlocks" :key="block.id">
			<div class="block-content">
				<textarea
					:key="block.id"
					v-if="editingBlockId !== null && editingBlockId == block.id"
					v-model="block.text"
					@input="setLayerHeight"
					@focus="setLayerHeight"
					@keydown.enter="handleEnter($event, block)"
				></textarea>
				<p @click="editBlock(block.id)" v-html="marked(block.text)"></p>
			</div>
			<block-list
				:blocks="blocks"
				:level="level + 1"
				:parent_id="block.id"
				:note_id="note_id"
			/>
		</li>
	</ul>
</template>
<script>
import axios from "axios";

export default {
	name: "BlockList",
	components: {},
	props: ["blocks", "level", "parent_id", "note_id"],
	data() {
		return {};
	},
	computed: {
		editingBlockId() {
			return this.$store.state.editingBlockId;
		},
		levelBlocks() {
			return this.blocks.filter(block => block.parent_id == this.parent_id);
		}
	},
	methods: {
		handleEnter(e) {
			console.log("enter");
			if (e.ctrlKey) {
				var block = this.$store.getters.block;
				if (!block.text.match(/^\[\[(TODO|DONE)\]\]/)) {
					block.text = "[[TODO]] " + block.text;
				} else if (block.text.match(/^\[\[TODO\]\]/)) {
					block.text = block.text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
				} else if (block.text.match(/^\[\[DONE\]\]/)) {
					block.text = block.text.replace(/^\[\[DONE\]\] */, "");
				}
				e.preventDefault();
				return;
			}

			if (!e.shiftKey) {
				this.$store.dispatch("saveAndNew");
				e.preventDefault();
			}
		},

		editBlock(block_id) {
			console.log("starteditblock");
			this.$store.dispatch("editBlock", block_id);
			//this.$nextTick(function(){
			//    document.querySelector('textarea').focus()
			//})
		},
	},
	mounted() {}
};
</script>

<style></style>
