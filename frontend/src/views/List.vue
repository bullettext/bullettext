<template>
	<div class="dashboard">

		<div class="container">
			<h1>Notes</h1>

			<ul>
				<li v-for="note in notes" :key="note.id">
					<router-link :to="'/'+note.slug">{{note.name}}</router-link>
				</li>
			</ul>

		</div>

	</div>
</template>

<script>
import store from '@/store';
import { toRefs } from 'vue';
export default {
	setup() {
		const { notes } = toRefs(store.state);
		return {
			notes
		}
	}
}
</script>
