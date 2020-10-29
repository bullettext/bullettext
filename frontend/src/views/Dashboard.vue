<template>

  <div class="dashboard">

    <!-- <app-header /> -->

    <div class="container">
      <div class="d-flex align-items-center justify-content-between my-3">
        <h1>Notes</h1>
      </div>
      <form @submit.prevent="newNote">
          new note<input v-model="note.name" required>
        </form>
      <div class="notes">
        <div class="item" v-for="note in notes" :key="note.id">
            <router-link :to="'/'+note.slug">{{note.slug}}</router-link>
        </div>
      </div>

    </div>

  </div>

</template>




<script>
import axios from 'axios';


// import appHeader from '../components/appHeader.vue'

export default {
  name: 'dashboard',
  components:{
    // appHeader,
  },
  data() {
    return {
      notes:[],
      note:{
          name:''
      }
    }
  },
  methods:{

    getNotes(){
      this.$store.dispatch('startLoading');
      axios({
        url: '/api/notes',
      }).then((res) => {
        this.notes = res.data;
      }).finally(()=>{
        this.$store.dispatch('stopLoading');
      });
    },

    newNote(){
        if(!this.note.name) return false;
        this.$store.dispatch('startLoading');
        var data = this.note;
      axios({
          method:'post',
        url: '/api/notes',
        data:data,
      }).then((res) => {
          this.$router.push({path:res.data.slug});
      }).finally(()=>{
        this.$store.dispatch('stopLoading');
      });

    }



  },
  created(){
    this.getNotes();

  }

}



</script>
<style scoped>
    .notes {  }
    .item { padding:10px ;  }
</style>
