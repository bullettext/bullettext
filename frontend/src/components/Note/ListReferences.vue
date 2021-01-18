<template>
	<ul class="references" v-if="references">
		<li v-for="(block,index) in references" :key="index">
			<router-link :to="'/'+block.note.slug">{{block.note.name}}</router-link>
			<p>{{block.text}}</p>
		</li>
	</ul>

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
				block.note = store.state.notes[block.note_id];
				return block;
			});
		});


		return { references };
	}
};
</script>
