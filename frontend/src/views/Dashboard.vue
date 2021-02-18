<template>
	<div>
		<aside>
			<div class="logo">Bullet</div>
			<global-search />
			<router-link to="/">Dashboard</router-link>
			<ul>
				<li v-for="note in favoriteNotes">
					<router-link :to="'/'+note.slug">{{note.name}} </router-link>
				</li>
			</ul>

		</aside>
		<main>
			<router-view :key="$route.fullPath" />
		</main>
	</div>
</template>

<script>
import { onMounted, computed } from 'vue';
import GlobalSearch from '@/components/GlobalSearch';
import store from '@/store';
export default {
	components: {
		GlobalSearch
	},
	setup(){
		onMounted(() => {
			store.getNotesIndex();
			console.log('store.state.notes',store.state.notes);
		})

		const favoriteNotes = computed(()=>{
			// return []
			return store.state.notes.filter(note=>note.is_favorite);
		});

		return {
			favoriteNotes
		}
	}
}

</script>
