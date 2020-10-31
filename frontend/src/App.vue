<template>
<div class="wrapper-app">
	<aside>
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
