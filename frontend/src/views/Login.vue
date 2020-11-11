<template>

  <div class="container">

    <h1 class="mt-5 mb-3 text-center">Bullet Text</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>



    <div class="row">
      <div class="col-lg-6">

        <div class="card">
          <div class="card-header">Login</div>
          <div class="card-body">
            <form @submit.prevent="onSubmitLogin">
              <div class="form-group">
                <input type="email" placeholder="E-mail" class="form-control" v-model="login.email" required>
              </div>
              <div class="form-group">
                <input type="password" placeholder="Password" class="form-control" v-model="login.password" required>
                <small class="form-text text-muted text-right"><router-link to="forgot">forgot password</router-link></small>
              </div>
              <button class="btn btn-primary" type="submit">Login</button>
            </form>
          </div>


        </div>


      </div>
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">Register</div>
          <div class="card-body">
            <form @submit.prevent="onSubmitRegister">
              <div class="form-group">
                <input type="text" placeholder="Name" v-model="register.name" class="form-control" required>
              </div>
              <div class="form-group">
                <input type="text" placeholder="E-mail" v-model="register.email" class="form-control" required>
              </div>
              <div class="form-group">
                <input type="password" placeholder="Password" v-model="register.password" class="form-control" required>
              </div>
              <button class="btn btn-primary" type="submit">Register</button>
            </form>
          </div>
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
      },
      register:{
        name:'',
        email:'',
        password:'',
      }
    }
  },

  methods:{

    onSubmitLogin(){
      this.error = '';
      axios({
        method: 'post',
        url: '/api/login',
        data: this.login
      }).then((res)=>{
        this.$store.dispatch('setUser',res.data)
        let intendedUrl = this.$store.state.intendedUrl;
        if(intendedUrl=='/login' || !intendedUrl) intendedUrl = '/';
        this.$router.push({path:intendedUrl})

      }).catch((error)=>{
        this.error = error.response.data;
      });

    },

    onSubmitRegister(){
      this.error = '';
      axios({
        method: 'post',
        url: '/api/register',
        data: this.register
      }).then((res)=>{
        this.$store.dispatch('setUser',res.data)

        let intendedUrl = this.$store.state.intendedUrl;
        if(intendedUrl=='/login' || !intendedUrl) intendedUrl = '/';
        this.$router.push({path:intendedUrl})

      }).catch((error)=>{
        this.error = error.response.data;
      });

    },

  },
  mounted(){
  }

}



</script>

