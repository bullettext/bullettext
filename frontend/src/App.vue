<template>
<div class="wrapper-app">
	<aside v-if="isAuthenticated">

		<div class="global-search">
			<form @submit.prevent>
				<input type="text" @focus="openSearchMenu" @blur="closeSearchMenu">
			</form>
		</div>

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

export default {
	name: 'app',
	components: {
		Loader
	},
	data() {
		return {
			searchterm:'',
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
		searchInput(){
			console.log('searchinput');
		},
		openSearchMenu(){
			window.openSearchMenu();
		},
		closeSearchMenu(){
			window.closeSearchMenu();
		},
		doSearch(){
			console.log('doSearch')
		}

	},

}



</script>
