<template>
	<div>
		<!-- {{tecla}} -->
	</div>
</template>
<script>
export default {
	props: ["tecla"],
	watch: {
		tecla: function(newVal, oldVal) {
			console.log({newVal, oldVal});
			this.tecla = '';
		}
	}
}
</script>
