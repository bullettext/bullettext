<template>
	<div class="references" v-if="references">
		<h4>References:</h4>
		<div class="reference-item" v-for="(block,index) in references" :key="index">
			<router-link v-if="block.note" :to="'/'+block.note.slug">{{block.note.name}}</router-link>
			<p>{{block.text}}</p>
		</div>
	</div>
</template>
<script>
import { computed } from 'vue';
import store from '@/store';


export default {
	props: ["references"],
	setup(props) {

		const blockReferences = props.references;

		const references = computed(() => {
			if(!store.state.notes) return [];
			return blockReferences.map(block=>{
				block.note = store.state.notes.find(note=>note.id==block.note_id);
				return block;
			});
		});


		return { references };
	}
};
</script>
