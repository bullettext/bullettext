<template>
	<div>
		menu...

	</div>
</template>
<script>

import { reactive } from 'vue';

const state = reactive({
	selectedIndex:0,
})

const keyDownFunctions = {
	ArrowDown: ()=>{
		state.selectedIndex++;
	},
	ArrowUp: ()=>{
		state.selectedIndex--;
	},
	Enter: (event)=>{
		console.log('enter');
		event.preventDefault();
		return false;

	},

	Escape: ()=>{
		console.log('esc');
		closeMenu();
	},
}

const closeMenu = ()=>{
	console.log('context',context);
	context.emit('close');
}


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

	setup(props,context){

		console.log('p',props);

		return {
			closeMenu
		}

	}
}
</script>
