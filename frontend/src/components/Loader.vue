<template>

	<div v-show="isLoading" class="ajax-loader">
		<div class="loader-circle">
			<div class="loader-line-mask">
				<div class="loader-line"></div>
			</div>
			<div class="loader-img"></div>
		</div>
		<p v-if="loadingMessage">{{loadingMessage}}</p>
	</div>
</template>

<style>


.ajax-loader {
  position: fixed;
  background: rgba(255,255,255,.7);
  top:0;
  left:0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color:#fff;
}

.ajax-loader .loader-circle {
  position:relative;
  width:120px;
  height:120px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.1);
}

.ajax-loader .loader-line-mask {
  position: absolute;
  top:0;
  left:0;
  width:60px;
  height:120px;
  overflow: hidden;
  transform-origin:60px 60px;
  -webkit-mask-image: -webkit-linear-gradient(top, rgba(0,0,0,1), rgba(0,0,0,0));
  animation: rotate 1.2s infinite linear;
}
.ajax-loader .loader-line {
  width:120px;
  height:120px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 3px #000;
}
.ajax-loader .loader-img {
  position: relative;
  top: 30px;
  left: 30px;
  display: block;
  width:60px;
  height:60px;
  /* background:url(../../public/logo.png) no-repeat center; */
  background-size:contain;
}
.ajax-loader p{
  font-weight: bold;
  color:#000;
  margin-top:20px;
}
@keyframes rotate {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}



	</style>


<script>

	export default {
		computed:{

			isLoading(){
				return this.$store.state.loading
			},
			loadingMessage(){
				return this.$store.state.loadingMessage
			}

		}
	}

</script>
