<template>
	<div>
		<nav v-if="isAuthenticated">
			<div class="logo">Bullet</div>
			<global-search />
		</nav>
		<aside v-if="isAuthenticated">
			<router-link to="/">Dashboard</router-link>
		</aside>
		<main>
			<router-view :key="$route.fullPath" />
		</main>
	</div>
</template>

<script>
import { onMounted } from 'vue';
import GlobalSearch from '@/components/GlobalSearch';
import store from '@/store';
export default {
	components: {
		GlobalSearch
	},
	setup(){
		onMounted(() => {
			store.getNotesIndex();
		})

		return {
			isAuthenticated:store.state.isAuthenticated
		}
	}
}

</script>
