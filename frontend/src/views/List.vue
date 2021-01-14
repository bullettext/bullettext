<template>
		<div class="dashboard">

		<!-- <app-header /> -->

		<div class="container">
			<div class="d-flex align-items-center justify-content-between my-3">
				<h1>Notes</h1>
			</div>
			<form @submit.prevent="newNote">
				new note: <input v-model="noteName" required>
			</form>
			<ul class="notes">
				<li v-for="note in notes" :key="note.id">
					<router-link :to="'/'+note.slug">{{note.slug}}</router-link>
				</li>
			</ul>

		</div>

	</div>
</template>
<script>
import store from '@/store';
import { ref, toRefs } from 'vue';
export default {
	setup() {
		const noteName = ref('');
		const newNote = () => {
			if(!noteName.value) return false;
			store.newNote(noteName.value);
		}
		const { notes } = toRefs(store.state);
		return {
			newNote,
			noteName,
			notes
		}
	}
}
</script>
