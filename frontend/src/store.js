import Vuex from 'vuex'
import axios from 'axios';
import router from '@/router';

export default Vuex.createStore({
	state: {
		user: {
			id:null,
			email:'',
			is_admin:false,
		},
		authInitialized:false,
		intendedUrl:'',
		notes:[],
		note:{},
		blocks:[],
		loading: 0,
		loadingMessage: '',
	},
	mutations: {
		startLoading(state) {
			state.loading += 1;
		},
		stopLoading(state) {
			if(state.loading>0) state.loading -= 1;
		},
		setLoadingMessage(state, payload) {
			state.loadingMessage = payload;
		},
		setIntendedUrl (state,payload) {
			state.intendedUrl = payload;
		},
		authInitialized (state) {
			state.authInitialized = true;
		},
		setUser (state,payload) {
				state.user = payload;
		},
		setNotes (state,payload) {
			state.notes = payload;
		},
	},
	actions: {
		startLoading({commit}){
			commit('startLoading')
		},
		stopLoading({commit}){
			commit('stopLoading')
			if(this.state.loading==0 && this.state.loadingMessage) {
				commit('setLoadingMessage','');
			}
		},
		setLoadingMessage({commit},{message}){
			commit('setLoadingMessage',message)
		},
		setUser ({commit},user) {
			commit('setUser',user)
		},
		setIntendedUrl ({commit},url) {
			commit('setIntendedUrl',url)
		},
		authInitialized ({commit},bool) {
			commit('authInitialized',bool)
		},
		getNotesIndex({commit}){
			console.log('getNotesIndex')
			this.dispatch('startLoading');
			axios({
				url: '/api/notes',
			}).then((res) => {
				commit('setNotes',res.data)
			}).finally(()=>{
				this.dispatch('stopLoading');
			});
		},
		getNote({state},slug){

			this.dispatch('startLoading');
			return axios({
					url: '/api/notes/'+slug,
			}).then(res=>{
					state.note = res.data;
					state.blocks = res.data.blocks;
					return res;

			}).catch(res=>{
					toastr('No permisson to view this project','Error','#cc0000');
					this.$router.replace('/');
			}).finally(()=>{
					this.dispatch('stopLoading');
			})


		},
		newNote({state},name){
			this.dispatch('startLoading');
			var data = {name:name};
			return axios({
				method:'post',
				url: '/api/notes',
				data:data,
			}).then((res) => {
				router.push({path:res.data.slug});
				this.dispatch('getNotesIndex');
				return res;
			}).finally(()=>{
				this.dispatch('stopLoading');
			});

		}

	},



	getters: {
		isAuthenticated:(state) => state.authInitialized && state.user &&  state.user.id,

		blocks:(state,getters) => {
				return getters.sort(state.blocks);
		},
		notes:(state) => {
			if(state.notes.length==0) return false;
			var dict = {};
			state.notes.forEach(note=>{
				dict[note.id] = note;
			});
			return dict;
		},
		block:(state) => {
				if(state.editingBlockId===null) return null;
				return state.blocks.find(i=>i.id==state.editingBlockId);
		}
	}
});
