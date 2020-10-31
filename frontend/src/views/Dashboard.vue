<template>

	<div class="dashboard">

		<!-- <app-header /> -->

		<div class="container">
			<div class="d-flex align-items-center justify-content-between my-3">
				<h1>Notes</h1>
			</div>
			<form @submit.prevent="newNote">
				new note: <input v-model="note.name" required>
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
import axios from 'axios';

export default {
	name: 'dashboard',
	data() {
		return {
			note:{
					name:''
			}
		}
	},
	computed:{
		notes(){
			return this.$store.state.notes
		}
	},
	methods:{

		newNote(){
			if(!this.note.name) return false;
			this.$store.dispatch('startLoading');
			var data = this.note;
			axios({
				method:'post',
				url: '/api/notes',
				data:data,
			}).then((res) => {
				this.$router.push({path:res.data.slug});
				this.$store.dispatch('getNotesIndex');
			}).finally(()=>{
				this.$store.dispatch('stopLoading');
			});

		}



	},

	mounted(){
		this.$store.dispatch('getNotesIndex');
	},

}

</script>
