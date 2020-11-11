<template>

  <div class="container">

<h1 class="mt-5 mb-3 text-center">Bullet Text</h1>

<div v-if="error" class="alert alert-danger">{{ error }}</div>

<div class="w-50 mx-auto">
<div class="card">
  <div class="card-header">Set a new password</div>
  <div class="card-body">

        <form @submit.prevent="onSubmit">
            <div class="form-group">
              <label>E-mail</label>
              <input type="text" class="form-control" v-model="login.email" readonly>
             </div>
            <div class="form-group">
              <label>New password</label>
              <input type="password" class="form-control" v-model="login.password">
             </div>
            <!-- <p><label>token:</label><input type="text" v-model="login.token"></p> -->
        <button type="submit" class="btn btn-primary">Save</button>
        </form>

  </div>
  </div>
  </div>
  </div>


</template>
<style scoped>


</style>

<script>

import axios from 'axios';

export default {
  // props:['id','page_id'],
  data() {
    return {
      error:'',
      login:{
        email:'',
        password:'',
        token:'',
      },
    }
  },

  methods:{

    onSubmit(){
      this.error = '';
      axios({
        method: 'post',
        url: '/api/new-password',
        data: this.login
      }).then((res)=>{
          alert('New password successfully set');
          this.$router.push('login')
      }).catch((error)=>{
          this.error = error.response.data;
      });

    },

  },
  mounted(){
      var query = window.location.search.replace(/^\?/,'');
      var queryArr = query.split('&');
      var obj = {};
      for(var i in queryArr){
          var parts = queryArr[i].split('=');
          obj[parts[0]] = parts[1];
      }

      this.login.email = decodeURIComponent(obj.email)
      this.login.token = decodeURIComponent(obj.token)
  }

}



</script>

