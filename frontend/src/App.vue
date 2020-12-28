<template>
<div class="wrapper-app">
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
	<loader/>
</div>
</template>

<script>


import Loader from './components/Loader.vue';
import GlobalSearch from './components/GlobalSearch.vue';

export default {
	name: 'app',
	components: {
		Loader,
		GlobalSearch
	},
	data() {
		return {

		}
	},
	computed:{
		isAuthenticated:function(){
			return this.$store.getters.isAuthenticated
		},
		editingBlockId(){
			return this.$store.state.editingBlockId;
		},
	},
	methods:{

	},

}



</script>
