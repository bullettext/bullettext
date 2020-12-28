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
	created() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		var yyyy = today.getFullYear();

		today = `${yyyy}-${mm}-${dd}`;
		if(this.$route.fullPath == '/') {
			this.$router.push(`/${today}`);
		}
	},

}



</script>
