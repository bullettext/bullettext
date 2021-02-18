<template>

	<span :style="icoStyle">
		<svg viewBox="0 0 24 24" v-if="ico=='undo'">
			<path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
		</svg>
		<svg viewBox="0 0 24 24" v-if="ico=='redo'">
			<path fill="currentColor" d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
		</svg>
		<svg viewBox="0 0 24 24" v-if="ico=='loading'">
			<path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
		</svg>
		<svg viewBox="0 0 24 24" v-if="ico=='star-empty'">
			<path fill="currentColor" d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" />
		</svg>
		<svg viewBox="0 0 24 24" v-if="ico=='star'">
			<path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
		</svg>
	</span>
</template>

<script>
	export default {
		props:['ico','size'],
		computed:{
			icoStyle(){
				return {
					display:'inline-block',
					width:this.size+'px',
					height:this.size+'px',
				}
			}
		}
	}
</script>

<style scoped>
svg { display:block; height:100%; width:100%; }

.spin svg{ display:block; width:100%; height:100%; animation: rotating 0.5s linear infinite;}

@keyframes rotating {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

</style>
