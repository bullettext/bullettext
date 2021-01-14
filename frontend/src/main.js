import Vue, { createApp } from 'vue';
import App from './App.vue'
import axios from 'axios';
//import helpers from './helpers.js';
//import textareaHelpers from './textareaHelpers.js';
//import keyboardHelpers from './keyboardHelpers.js';
//import './menuHelpers.js';
import styles from './assets/style.css';
import router from '@/router';
import store from '@/store';


window.Vue = Vue;

axios({
	method: 'get',
	url: '/api/user',
}).then((res)=>{
	store.setUser(res.data);
}).catch(()=>{
}).finally(()=> {
	store.authInitialized();
	const app = createApp(App);
	app.use(router);
	app.mount('#app');
});
