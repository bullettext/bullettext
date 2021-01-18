import { reactive, ref, toRef, toRefs, computed } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const state = reactive({
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
	selectedIndex: -1,
	textareaDOM: null,
	isAuthenticated: computed(() => {
		return state.authInitialized && state.user &&  state.user.id;
	}),
	// notes: computed(() => {
	// 	if(state.notes.length==0) return false;
	// 	var dict = {};
	// 	state.notes.forEach(note=>{
	// 		dict[note.id] = note;
	// 	});
	// 	return dict;
	// })
});


const startLoading = () => {
  console.log('startLoading');
	state.loading += 1;
}
const stopLoading = () => {
	if(state.loading>0) state.loading -= 1;
	if(state.loading==0 && state.loadingMessage) {
		setLoadingMessage('');
	}
}
const setLoadingMessage = (message) => {
	state.loadingMessage = message;
}
const setUser = (user) => {
	state.user = user;
}
const setIntendedUrl = (url) => {
	state.intendedUrl = url;
}
const authInitialized = () => {
	state.authInitialized = true;
}
const getNotesIndex = () => {
	console.log('getNotesIndex')
	startLoading();
	axios({ url: '/api/notes' }).then((res) => {
    state.notes = res.data;
    console.log('state.notes',res.data)
	}).finally(()=>{
		stopLoading();
	});
}

const getNote = (slug) => {
	startLoading();
	return axios({ url: '/api/notes/'+slug }).then(res=>{
			//state.note = res.data;
			//state.blocks = res.data.blocks;
			return res;

	}).catch(res=>{
			// toastr('No permisson to view this project','Error','#cc0000');
			console.error('No permisson to view this project','Error','#cc0000');
			router.replace('/');
	}).finally(()=>{
    stopLoading();
	})
}

const newNote = (name) => {
	startLoading();
	var data = {name:name};
	return axios({
		method:'post',
		url: '/api/notes',
		data:data,
	}).then((res) => {
		router.push({path:res.data.slug});
		getNotesIndex();
		return res;
	}).finally(()=>{
		stopLoading();
	});
}

export default {
	state,
	getNote,
	startLoading,
	getNotesIndex,
  authInitialized,
  setUser,
  setIntendedUrl,
  //...toRefs(isAuthenticated),
};
