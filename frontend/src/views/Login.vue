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
<script>
  import axios from 'axios';
import { reactive, onMounted, toRefs } from "vue";
  import { useRouter } from 'vue-router';
  import store from '@/store';

  export default {

		setup(){
			const router = useRouter();

			const state = reactive({
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
        });

      const onSubmitLogin = () =>{
        state.error = '';
        axios({
          method: 'post',
          url: '/api/login',
          data: state.login
        }).then((res)=>{
          store.setUser(res.data);
          let intendedUrl = store.state.intendedUrl;
          if(intendedUrl=='/login' || !intendedUrl) intendedUrl = '/';
          router.push({path:intendedUrl})

        }).catch((error)=>{
          state.error = error.response.data;
        });

      }

			const onSubmitRegister = () => {
				state.error = '';
				axios({
					method: 'post',
					url: '/api/register',
					data: state.register
				}).then((res)=>{
					store.setUser(res.data);

					let intendedUrl = store.state.intendedUrl;
					if(intendedUrl=='/login' || !intendedUrl) intendedUrl = '/';
					router.push({path:intendedUrl})

				}).catch((error)=>{
					state.error = error.response.data;
				});

			}

			onMounted(() => {
				console.log("login");
			});
			const { error, login, register } = toRefs(state);
			return {
        store,
				router,
				error,
				login,
				register,
				onSubmitLogin,
        onSubmitRegister,
			};
	}
}



</script>

