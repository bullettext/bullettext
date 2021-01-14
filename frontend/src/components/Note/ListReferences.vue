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
import { useStore } from 'vuex';
export default {
	props: ["references"],
	setup(props) {
		const store = useStore();
		const blockReferences = props.references;

		const references = computed(() => {
			if(!store.getters.notes) return [];
			return blockReferences.map(block=>{
				block.note = store.getters.notes[block.note_id];
				return block;
			});
		});


		return { references };
	}
};
</script>
