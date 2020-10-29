import Vue from 'vue'
import App from './App.vue'
import axios from 'axios';
import helpers from './helpers.js';
import textareaHelpers from './textareaHelpers.js';
import keyboardHelpers from './keyboardHelpers.js';
import styles from './assets/style.css';
import router from '@/router';
import store from '@/store';


window.Vue = Vue;
Vue.config.productionTip = false

axios({
	method: 'get',
	url: '/api/user',
}).then((res)=>{
	store.dispatch('setUser',res.data)
	store.dispatch('authInitialized')
}).catch(()=>{
	store.dispatch('authInitialized')
}).finally(()=> {
	window.vm = new Vue({
		router,
		store,
		render: h => h(App),
	}).$mount('#app')
 });

