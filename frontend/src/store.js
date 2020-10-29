import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import router from '@/router';

Vue.use(Vuex)

export default new Vuex.Store({
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
    oldText:'',
    editingBlockId:null,
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
    setEditingBlockId (state,payload) {
        state.editingBlockId = payload;
    },
    setOldText (state,payload) {
        state.oldText = payload;
    }
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
    editBlock({commit,state},block_id){
        if(state.editingBlockId!==null){
            this.dispatch('saveBlock')
        }

        commit('setEditingBlockId',block_id);
        if(block_id===null) return;
        var block = this.getters.block;
        commit('setOldText',block.text);
        setTimeout(()=>{
            document.querySelector('textarea').focus()
        },1);

    },
    postCreate({state},{data,fn}){
        axios({
            method:'post',
            url:'/api/blocks',
            data:data,
        }).then(res=>{
            if(fn) fn(res);
        }).catch(res=>{
            console.error('save error');
            console.error(res);
        });
    },
    postUpdate({state},{id,data,fn}){
        console.log('postupdate',id,data,fn);
        axios({
            method:'post',
            url:'/api/blocks/'+id,
            data:data,
        }).then(res=>{
            if(fn) fn(res);
        }).catch(res=>{
            console.error('save error');
            console.error(res);
        });
    },
    postBatch({state},{data,fn}){
        console.log('postbatch')
        axios({
            method:'post',
            url:'/api/blocks/batch',
            data:data,
        }).then(res=>{
            if(fn) fn(res);
        }).catch(res=>{
            console.error('save error');
            console.error(res);
        });
    },
    saveBlock({state}){
        console.log('saveBlock')
        var block = this.getters.block;
        if(!block) return;
        var value = document.querySelector('textarea').value;
        if(block.id && state.oldText==value) {
            console.log('same text, skip saving');
            return;
        }
        var data = {
          text:value,
          order:block.order,
          parent_id:block.parent_id,
          note_id:block.note_id
        }
        if(block.id){
            this.dispatch('postUpdate',{id:block.id,data:data,fn:(res)=>{
                block.id = res.data.id;
            }});
        } else {
            this.dispatch('postCreate',{data:data,fn:(res)=>{
                block.id = res.data.id;
            }});
        }
        block.id = 'saving';
    },
    saveAndNew({state}){
        console.log('saveAndNew');
        var block = this.getters.block;
        this.dispatch('saveBlock');
        this.dispatch('newBlock',{
            order:block.order,
            parent_id:block.parent_id,
        });
    },

    newBlock({state},{order,parent_id}){
        console.log('new');
        state.blocks.push({
            text:'',
            note_id:state.note.id,
            id:'',
            order:order||1,
            parent_id:parent_id || null,
        });
        this.dispatch('editBlock','');
    },

    moveUp({state}){
        var block = this.getters.block;
        if(!block) return;
        var siblings = this.getters.children(block.parent_id);
        var index = siblings.indexOf(block);
        var prev = siblings[index-1];
        if(!prev) return;
        var originalOrder = block.order;
        block.order = prev.order;
        prev.order = originalOrder;
        var data = [{id:prev.id,order:prev.order}]
        if(block.id) data.push({id:block.id,order:block.order})
        this.dispatch('postBatch',{data});
        setTimeout(()=>{
            document.querySelector('textarea').focus()
        },1);
    },
    editPrev({state}){
        var block = this.getters.block;
        if(!block) return;
        var siblings = this.getters.children(block.parent_id);
        var index = siblings.indexOf(block);
        var prev = siblings[index-1];
        if(!prev) return;
        this.dispatch('editBlock',prev.id);

    },
    moveDown({state}){
        var block = this.getters.block;
        if(!block) return;
        var siblings = this.getters.children(block.parent_id);
        var index = siblings.indexOf(block);
        var next = siblings[index+1];
        if(!next) return;
        var originalOrder = block.order;
        block.order = next.order;
        next.order = originalOrder;
        var data = [{id:next.id,order:next.order}]
        if(block.id) data.push({id:block.id,order:block.order})
        this.dispatch('postBatch',{data});
        setTimeout(()=>{
            document.querySelector('textarea').focus()
        },1);
    },
    editNext({state}){
        var block = this.getters.block;
        if(!block) return;
        var siblings = this.getters.children(block.parent_id);
        var index = siblings.indexOf(block);
        var next = siblings[index+1];
        if(!next) return;
        this.dispatch('editBlock',next.id);
    },
    indent({state}){
        var block = this.getters.block;
        if(!block) return;
        var siblings = this.getters.children(block.parent_id);
        var index = siblings.indexOf(block);
        var prev = siblings[index-1];
        if(!prev) return;
        var parent_id = prev.id;
        var newSiblings = this.getters.children(parent_id);
        var order = 1;
        if(newSiblings.length){
            order = newSiblings[newSiblings.length-1].order+1
        }
        block.parent_id = parent_id;
        block.order = order;
        setTimeout(()=>{
            document.querySelector('textarea').focus()
        },1);
        if(!block.id) return; //new block
        this.dispatch('postUpdate',{
            id:block.id,
            data:{
                parent_id:block.parent_id,
                order:block.order,
            }
        });
    },
    unindent({state}){
        var block = this.getters.block;
        if(!block) return;
        if(block.parent_id==null) return;
        var parent_id = block.parent_id;
        var parent = state.blocks.find(i=>i.id==parent_id);

        block.parent_id = parent.parent_id;
        block.order = parent.order+1;
        setTimeout(()=>{
            document.querySelector('textarea').focus()
        },1);
        if(!block.id) return; //new block
        this.dispatch('postUpdate',{
            id:block.id,
            data:{
                parent_id:block.parent_id,
                order:block.order,
            }
        });
    },
    cancelEditing({state}){
        this.dispatch('editBlock',null);
    },
    deleteBlock({state}){
        console.log('delete block')

        var block = this.getters.block;
        if(block.id){

            axios({
                method:'delete',
                url:'/api/blocks/'+block.id
            }).then(res=>{

            }).catch(res=>{
                console.error('save error');
                console.error(res);
            });
        }
        this.dispatch('removeBlock',block);
    },
    removeBlock({state},block){
        console.log('removeBlock')

        var siblings = this.getters.children(block.parent_id);
        var prev = siblings[siblings.indexOf(block)-1];
        var prev_id = prev?prev.id:null;

        state.blocks.splice(state.blocks.indexOf(block),1);

        this.dispatch('editBlock',prev_id);
    }


  },

  getters: {
    isAuthenticated:(state) => state.authInitialized && state.user &&  state.user.id,
    editingBlock_id:(state) => state.editingBlockId,
    children:(state,getters)=> (parent_id)=>{
        return getters.sort(state.blocks.filter(b=>b.parent_id==parent_id));
    },
    sort:() => (blocks)=>{
        return blocks.sort((a,b)=>{
            //if(a.parent_id!=b.parent_id){
            //    return 1;
            //}
            if(a.order!=b.order){
                return a.order>b.order?1:-1
            }
            if(!a.id) return 1;
            return a.id>b.id?1:-1
        });
    },
    blocks:(state,getters) => {
        return getters.sort(state.blocks);
    },
    block:(state) => {
        if(state.editingBlockId===null) return null;
        return state.blocks.find(i=>i.id==state.editingBlockId);
    }
  }
})
