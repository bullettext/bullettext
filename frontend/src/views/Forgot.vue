<template>

  <div class="container">

<h1 class="mt-5 mb-3 text-center">Bullet Text</h1>

<div v-if="error" class="alert alert-danger">{{ error }}</div>

<div class="w-50 mx-auto">
<div class="card">
  <div class="card-header">Password recovery</div>
  <div class="card-body">

        <form @submit.prevent="onSubmit">
            <div class="form-group">
              <label>E-mail</label>
              <input type="text" class="form-control" v-model="login.email" required>
            </div>
          <button type="submit" class="btn btn-primary">Recover</button>
        </form>


  </div>
  </div>
  <p class="text-center mt-3">
        <router-link to="login">Back to login</router-link>
        </p>

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
      },
    }
  },

  methods:{

    onSubmit(){
      this.error = '';
      axios({
        method: 'post',
        url: '/api/forgot',
        data: this.login
      }).then((res)=>{
          alert('mensagem enviada');
      }).catch((error)=>{
          this.error = error.response.data;
      });

    },
  },
  mounted(){
  }

}



</script>

