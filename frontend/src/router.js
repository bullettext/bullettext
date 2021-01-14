/* eslint-disable no-console */
import { createRouter, createWebHistory } from 'vue-router'

import axios from 'axios';
import store from '@/store';

import Dashboard from './views/Dashboard.vue'
import List from './views/List.vue'
import Note from './views/Note.vue'
import Login from './views/Login.vue'
import Forgot from './views/Forgot.vue'
import NewPassword from './views/NewPassword.vue'


const router = createRouter({
	history:createWebHistory(process.env.BASE_URL),
	routes: [
		{ path: '/login', name: 'login', component: Login, props: true, meta: {restricted:false}, },
		{ path: '/forgot', name: 'forgot', component: Forgot, props: true, meta: {restricted:false}, },
		{ path: '/new-password', name: 'new-password', component: NewPassword, props: true, meta: {restricted:false}, },

		{ path: '/', name: 'dashboard', component: Dashboard, meta: {restricted:true}, children: [
			{ path: '/', name: 'list', component: List, meta: {restricted:true}},
			{ path: '/:slug', name: 'note', component: Note, props: true, meta: {restricted:true}, },
		]},


	]
})


router.beforeEach((to, from, next) => {
/*  window.scrollTo(0,0); */

	console.log('route beforeeach to: ',to.path);

	//if(edited && $('[data-note]')){
	//	saveAll();
	//}

	if(to.path=='/logout'){

		axios({
			method: 'get',
			url: '/api/logout',
		}).then((res)=>{
			store.setUser({});
		}).catch((error)=>{
			console.log('error',error);
		});

		return next('/login');
	}

	console.log('store.isAuthenticated',store.state.isAuthenticated);

	if(!store.state.isAuthenticated && to.meta.restricted){
		console.log('next login');
		store.setIntendedUrl(to.path);
		return next('/login');
	}

	next();

});

export default router;
