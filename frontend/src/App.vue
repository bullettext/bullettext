<template>
	<div class="wrapper-app">
		<router-view :key="fullPath" />
		<loader/>
	</div>
</template>

<script>

import { onMounted, toRefs } from 'vue';
import Loader from './components/Loader.vue';
import store from '@/store';
import { useRoute } from 'vue-router';

export default {
	components: {
		Loader,
		// GlobalSearch
	},
	// inject: ['store'],
	setup(){
		const route = useRoute();
		onMounted(() => {
			// var today = new Date();
			// var dd = String(today.getDate()).padStart(2, '0');
			// var mm = String(today.getMonth() + 1).padStart(2, '0');
			// var yyyy = today.getFullYear();

			// today = `${yyyy}-${mm}-${dd}`;
			// if(this.$route.fullPath == '/') {
			// 	this.$router.push(`/${today}`);
			// }

		});
	const { loading } = toRefs(store.state);
		return {
			startLoading:store.startLoading,
			loading,
			fullPath: route.fullPath
			//state:store.state,
		}
	}
}
</script>
