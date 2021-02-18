<template>


	<div class="global-search" :class="{active:menuOpen}">
		<input
			type="text"
			v-model="searchterm"
			@input="input"
			@keyup.arrow-down="arrowDown"
			@keyup.arrow-up="arrowUp"
			@keyup.enter="enter"
			@keyup.esc="searchterm = ''"
			placeholder="Search or new"
		>
		<div class="menu-search" v-show="menuOpen">
			<ul>
				<li v-for="(note,index) in results" :class="{selected:index===selectedItem}"><a class="reference" :href="note.slug" @click.prevent="goto(note.slug)" v-html="hl(note.name)"></a></li>
				<li class="newNote" v-show="searchterm" :class="{selected:results.length===selectedItem}"><a @click="newNote()">new note "{{searchterm}}"</a></li>
			</ul>
		</div>
	</div>

</template>

<script>

import { reactive, toRefs, computed } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router';


export default {

	setup(props,context){

		const router = useRouter();

		const state = reactive({
			searchterm:'',
			selectedItem:0,
		});

		const results = computed(()=>{
			if(!menuOpen) return [];
			var term = state.searchterm.toLowerCase().trim();
			return store.state.notes.filter(note=>{
				return note.name.toLowerCase().includes(term);
			}).slice(0,10); //maximum 10 results
		})

		const menuOpen = computed(()=>{
			return state.searchterm!=='';
		});

		const enter = ()=>{
			//find what is the element
			if(!menuOpen) return;
			if(state.selectedItem===null) return;
			var item = results.value[state.selectedItem];

			if(item) {
				router.push(item.slug);
				state.searchterm = ''
				return;
			}
			newNote();
			state.searchterm = ''
		}
		const input = ()=>{
			state.selectedItem = 0;
		}
		const hl = (name)=>{
			if(!state.searchterm) return name;
			return name.replace(new RegExp('('+state.searchterm+')','i'),'<strong>$1</strong>');
		}
		const arrowDown = ()=>{
			if(state.selectedItem===null){
				state.selectedItem = 0;
				return;
			}
			state.selectedItem++;
			if(state.selectedItem>results.value.length) state.selectedItem = 0;
		}
		const arrowUp = ()=>{
			if(state.selectedItem===null){
				state.selectedItem = results.value.length;
				return;
			}
			state.selectedItem--;
			if(state.selectedItem<0) state.selectedItem = results.value.length;
		}

		const newNote = ()=>{
			store.newNote(state.searchterm);
			state.searchterm = ''
		}

		const goto = (noteSlug)=>{
			router.push(noteSlug);
			state.searchterm = ''
		}

		let {searchterm, selectedItem} = toRefs(state);

		return {
			searchterm,
			menuOpen,
			selectedItem,
			results,
			enter,
			input,
			hl,
			arrowDown,
			arrowUp,
			newNote,
			goto,
		}

	}
}

</script>
