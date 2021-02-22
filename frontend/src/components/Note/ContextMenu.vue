<template>
	<div>
		<input type="text" v-model="searchTerm" ref="searchDOM"
			@keyup.arrow-down="arrowDown"
			@keyup.arrow-up="arrowUp"
			@keyup.enter="selectItem"
			@keyup.esc="esc"
		/>
		<div
			class="item"
			:class="{'selected': index == selectedIndex}"
			v-html="text(item.text)"
			@click="selectItem"
			v-for="(item, index) in listMenu"
			:key="index"
		/>
	</div>
</template>
<script>

import store from '@/store';
import { reactive, toRefs, nextTick, onMounted, computed } from 'vue';

const defaultListMenu = [
	{ text: 'Todo', function: 'insertTodo' },
	{ text: 'Current Date', function: 'insertCurrentDate' },
	{ text: 'Current Time', function: 'insertCurrentTime' },
	{ text: 'Date Picker', function: 'datepiker' },
	{ text: 'Make a Reference', function: 'createMenuReference' },
	{ text: 'Bold', function: 'setBold' },
	{ text: 'Italic', function: 'setItalic' },
];

export default {
	props: {
		isReference: { type: Boolean },
	},

	setup(props, {emit}){
		const state = reactive({
			selectedIndex:0,
			searchTerm: '',
			searchDOM: null,
			listMenu: computed(() => {
				let list = [];
				if(props.isReference) {
					store.state.notes.forEach((note) => {
						list.push({
							text: note.name
						});
					});
				} else {
					list = defaultListMenu;
				}
				let term = state.searchTerm.replace(/[[/]/,'').toLowerCase().trim();

				if(term == "") return list.slice(0,10);
				return list.filter(item=>{
					return item.text.toLowerCase().includes(term);
				}).slice(0,10);
			})
		});

		const arrowDown = ()=>{
			state.selectedIndex++;
		};
		const arrowUp = ()=>{
			state.selectedIndex--;
		};

		const text = (text) => {
			if(!state.searchTerm) return text;
			const term = state.searchTerm.replace(/[[/]/,'');
			return text.replace(new RegExp('/?('+term+')','i'),'<strong>$1</strong>');
		}

		const selectItem = (event)=>{
			closeMenu();
			if(props.isReference) {
				let func =  {action: 'reference', params: {text: state.searchTerm}}
				if(state.listMenu.length > 0) {
					func.params.text = state.listMenu[state.selectedIndex].text;
				}
				emit('action', func);
			} else {
				emit('action', {action: state.listMenu[state.selectedIndex].function });
			}
			event.preventDefault();
			return false;
		};

		const esc = () => {
			let text = ( props.isReference ? '[' : '/') + searchTerm.value;
			emit('action', {action: 'write', params: {text}});
			closeMenu();
		}

		const closeMenu = ()=>{
			emit('close');
		}

		onMounted(() => {
			state.selectedIndex = 0;
			state.searchTerm = "";
			nextTick(function() {
				state.searchDOM.focus();
			});
		});
		const { searchTerm, searchDOM, selectedIndex, listMenu } = toRefs(state);
		return {
			esc,
			isReference: props.isReference,
			closeMenu,
			searchTerm,
			searchDOM,
			selectedIndex,
			arrowDown,
			arrowUp,
			selectItem,
			listMenu,
			text
		}

	}
}
</script>
