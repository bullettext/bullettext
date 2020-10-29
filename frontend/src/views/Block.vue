<template>

<div>



  <div class="container">

      <div class="my-3">
        <h1>{{project.name}}</h1>
        <p class="text-muted"><a :href="url(project.slug)" target="_blank">{{url(project.slug)}}</a></p>


        <div class="row">
          <div class="col">
            <dl>
              <dt>Domain</dt>
              <dd>
                <span>{{ project.domain || '(not set)'}}</span>
                <button class="btn ml-1  btn-sm btn-light" @click="openModalDomain">Configure</button>
              </dd>
            </dl>
          </div>
          <div class="col" v-if="project.domain">
            <dl>
              <dt>State</dt>
              <dd>
                <span v-if="project.is_published">
                  <a @click.prevent="openModalUnpublish">
                    <i class="state-published"></i>
                    Published
                  </a>
                </span>
                <span v-if="!project.is_published">
                  <a @click.prevent="openModalPublish">
                    <i class="state-unpublished"></i>
                    Unpublished
                  </a>
                </span>
              </dd>
            </dl>
          </div>
        </div>

        <router-link class="btn btn-light btn-sm" :to="'/project/'+project.id+'/edit'">Edit project</router-link>
        <router-link class="btn btn-light btn-sm" :to="{name:'project-tables',params:{project_id:project.id}}">Admin</router-link>
        <router-link v-if="project.domain" class="btn btn-light btn-sm" :to="{name:'form-history',params:{project_id:project.id}}">Form history</router-link>

        <p v-if="project.tables && project.tables.length>0" class="text-muted"><a :href="urladmin()" target="_blank">Painel Admin</a></p>

      </div>

      <h3>Pages</h3>
      <table class="table">
        <tbody>
          <tr v-for="page in project.pages">
            <td>{{ page.name }}</td>
            <td class="text-nowrap">
              {{ page.slug }}
              <a class="ml-2" :href="url(project.slug,page.slug)" target="_blank">
                <svg class="icosvg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                </svg>
              </a>
            </td>
            <td class="text-right text-nowrap">
              <router-link class="btn btn-sm btn-primary mr-2" :to="'/project/'+project.id+'/'+page.id">
                <span class="is-desktop"><span v-if="!page.output">start building page</span><span v-else>edit page</span></span>
                <svg class="is-mobile icosvg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </router-link>
              <button class="btn btn-sm btn-link has-text-danger" @click="removePage(page)"><svg class="icosvg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg></button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn btn-primary" @click="newPage">New page</button>



      <button v-if="isAdmin" class="btn btn-warning" @click="openModalSaveTemplate">save as template</button>

   </div>





</div>

</template>
<script>

import axios from 'axios';


export default {
  name: 'project',
  components:{

  },
  // prop:['id'],
  props:['id'],
  data() {
    return {
        modalDomain:false,
        modalTemplate:false,
        modalPublish:false,
        modalUnpublish:false,

    }
  },
  computed:{
    project(){
      return this.$store.getters.project;
    },
    isAdmin(){
      return this.$store.getters.user.is_admin;
    },
  },
  methods:{
    openModalSaveTemplate(){
      this.modalTemplate = true;
    },
    openModalDomain(){
      this.modalDomain = true;
    },
    openModalUnpublish(){
      this.modalUnpublish = true;
      },
    openModalPublish(){
      this.modalPublish = true;
    },
    url(slug,page){
      var url = process.env.VUE_APP_PROTOCOL+'://'+slug+'.'+process.env.VUE_APP_BASEURL;
      if(page) url += '/'+page.replace(/\/$/,'')
      return url;
    },
    urladmin(){
      var domain = this.project.domain;
      if(domain){
        var url = 'https://'+domain;
      } else {
        var url = process.env.VUE_APP_PROTOCOL+'://'+this.project.slug+'.'+process.env.VUE_APP_BASEURL;
      }

      url += '/admin?token='+this.project.token;
      return url;
    },
    dataBr(data){
      var d = new Date(data);
      return ('0'+d.getDate()).substr(-2) + '/' +('0'+(d.getMonth()+1)).substr(-2)+'/'+d.getFullYear();
    },

    getProject(){
      this.$store.dispatch('startLoading');
      this.$store.dispatch('getProject',this.id).catch(res=>{
        toastr('No permisson to view this project','Error','#cc0000');
        this.$router.replace('/');
      }).finally(()=>{
        this.$store.dispatch('stopLoading');
      })
    },

    newPage(){
      let name = prompt('Page name');
      if(!name) return;

      axios({
        method: 'post',
        url: '/api/pages',
        data: {
          name:name,
          project_id:this.id,
        }
      }).then((res) => {
        this.$router.push('/project/'+this.id+'/'+res.data.id);
//      let project = res.data;
//      this.editProject(project.id);
      });

    },
    removePage(page){
      if(!confirm('Remove page?')) return;
      axios({
        method: 'delete',
        url: '/api/page/'+page.id,
      }).then((res) => {
        this.getProject();
        //router push /project/'+project.id+'/'+page.id
//        let project = res.data;
//        this.editProject(project.id);
      });

    },

  },
  mounted(){
  	console.log('id',this.id);
    this.getProject();
  }

}



</script>

<style scoped>






</style>
