/* eslint-disable no-console */
import { createRouter, createWebHistory } from 'vue-router'

import axios from 'axios';
import store from '@/store';

import Dashboard from './views/Dashboard.vue'
import Note from './views/Note.vue'
import Block from './views/Block.vue'

import Login from './views/Login.vue'
import Forgot from './views/Forgot.vue'
import NewPassword from './views/NewPassword.vue'


const router = createRouter({
	history:createWebHistory(process.env.BASE_URL),
	routes: [
		{ path: '/', name: 'dashboard', component: Dashboard, meta: {restricted:true}, },

		{ path: '/login', name: 'login', component: Login, props: true, meta: {restricted:false}, },
		{ path: '/forgot', name: 'forgot', component: Forgot, props: true, meta: {restricted:false}, },
		{ path: '/new-password', name: 'new-password', component: NewPassword, props: true, meta: {restricted:false}, },

		{ path: '/:slug', name: 'note', component: Note, props: true, meta: {restricted:true}, },
		{ path: '/:slug/:id', name: 'block', component: Block, props: true, meta: {restricted:true}, },

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
			store.dispatch('setUser',{})
		}).catch((error)=>{
			console.log('error',error);
		});

		return next('/login');
	}

	if(!store.getters.isAuthenticated && to.meta.restricted){
		store.dispatch('setIntendedUrl',to.path);
		return next('/login');
	}

	next();

});

export default router;
