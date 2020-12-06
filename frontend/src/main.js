import Vue, { createApp } from 'vue';
import App from './App.vue'
import axios from 'axios';
import helpers from './helpers.js';
import textareaHelpers from './textareaHelpers.js';
import keyboardHelpers from './keyboardHelpers.js';
import './menuHelpers.js';
import styles from './assets/style.css';
import router from '@/router';
import store from '@/store';


window.Vue = Vue;

axios({
	method: 'get',
	url: '/api/user',
}).then((res)=>{
	store.dispatch('setUser',res.data)
	store.dispatch('authInitialized')
}).catch(()=>{
	store.dispatch('authInitialized')
}).finally(()=> {
	window.vm = createApp(App).use(router).use(store).mount('#app')
 });

