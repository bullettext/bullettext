<template>
	<div>
		<input type="text" v-model="search" ref="searchDOM"
			@keyup.arrow-down="arrowDown"
			@keyup.arrow-up="arrowUp"
			@keyup.enter="enter"
			@keyup.esc="closeMenu"
		/>
		<div class="item"	@click="enter" :class="{'selected': index == selectedIndex}" v-for="(item, index) in listMenu" :key="index">
			{{item.text}}
		</div>
	</div>
</template>
<script>

import { reactive, toRefs, nextTick, onMounted, computed } from 'vue';

const state = reactive({
	selectedIndex:0,
	searchTerm: '',
	searchDOM: null,
	listMenu: computed(() => {
		return defaultListMenu;
	})
});


const defaultListMenu = [
	{ text: 'Todo', function: 'insertTodo' },
	{ text: 'Current Date', function: 'insertCurrentDate' },
	{ text: 'Current Time', function: 'insertCurrentTime' },
	{ text: 'Date Picker', function: 'datepiker' },
	{ text: 'Make a Reference', function: 'createMenuReference' },
	{ text: 'Bold', function: 'setBold' },
	{ text: 'Italic', function: 'setItalic' },
	// { text: 'Strikeout', function: 'setStrikeout' },
];

const arrowDown = ()=>{
	state.selectedIndex++;
};
const arrowUp = ()=>{
	state.selectedIndex--;
};



export default {
	props: {
		pos:{
			type:Number,
			required:true,
		},
		text:{
			type:String,
		}
	},
	onKeydown(command,event){
		if(typeof keyDownFunctions[command] === 'function'){
			return keyDownFunctions[command](event);
		}
		return true;
	},

	setup(props, {emit}){
		const enter = (event)=>{
			closeMenu();
			emit('action',state.listMenu[state.selectedIndex].function);
			event.preventDefault();
			return false;
		};

		const closeMenu = ()=>{
			emit('close');
		}

		onMounted(() => {
			state.selectedIndex = 0;
			nextTick(function() {
				state.searchDOM.focus();
			});
		});
		const { searchTerm, searchDOM, selectedIndex, listMenu } = toRefs(state);
		return {
			closeMenu,
			searchTerm,
			searchDOM,
			selectedIndex,
			arrowDown,
			arrowUp,
			enter,
			listMenu
		}

	}
}
</script>
