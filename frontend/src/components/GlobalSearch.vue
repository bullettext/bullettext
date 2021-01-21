<template>


<div
	class="global-search"
>
	<form @submit.prevent>
		<input
			type="text"
			v-model="searchterm"
			@input="input"
			@keyup.arrow-down="arrowDown"
			@keyup.arrow-up="arrowUp"
			@keyup.enter="enter"
			@focus="openSearchMenu"
			@blur="closeSearchMenu"
		>
	</form>
	<div class="menu-search" v-show="menuOpen">
		<ul>
			<li v-for="(note,index) in results" :class="{selected:index===selectedItem}"><a class="reference" :href="note.slug" v-html="hl(note.name)"></a></li>
			<li class="newNote" v-show="searchterm" :class="{selected:results.length===selectedItem}"><a @click="newNote()">new note "{{searchterm}}"</a></li>
		</ul>
	</div>
</div>

</template>

<style>


</style>


<script>

	export default {
		data(){
			return {
				searchterm:'',
				menuOpen:false,
				selectedItem:0,
			}
		},

		computed:{
			results(){
				if(!this.menuOpen) return [];
				var term = this.searchterm.toLowerCase().trim();
				return this.$store.state.notes.filter(note=>{
					return note.name.toLowerCase().includes(term);
				});
			}
		},
		methods:{
			enter(){
				//find what is the element
				if(this.selectedItem===null) return;
				var item = this.results[this.selectedItem];
				if(item) {
					this.$router.push(item.slug);
					return;
				}
				this.newNote();
			},
			input(){
				this.selectedItem = 0;
			},
			hl(name){
				if(!this.searchterm) return name;
				return name.replace(new RegExp('('+this.searchterm+')','i'),'<strong>$1</strong>');
			},
			arrowDown(){
				if(this.selectedItem===null){
					this.selectedItem = 0;
					return;
				}
				this.selectedItem++;
				if(this.selectedItem>this.results.length) this.selectedItem = 0;
			},
			arrowUp(){
				if(this.selectedItem===null){
					this.selectedItem = this.results.length;
					return;
				}
				this.selectedItem--;
				if(this.selectedItem<0) this.selectedItem = this.results.length;
			},
			openSearchMenu(){
				this.menuOpen = true;
			},
			closeSearchMenu(){
				setTimeout(()=>{
					this.menuOpen = false;
				},100);
			},
			newNote(){
				this.$store.dispatch('newNote',this.searchterm);
			}

		}
	}

</script>
