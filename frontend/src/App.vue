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
