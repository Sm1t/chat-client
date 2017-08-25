<template>
  <div id="app">
    <Alert v-if="alertMsg" :msg="alertMsg" :type="alertType"/>
    <div class="container">
      <div v-if="user" class="wrap">
        <aside class="aside">
          <div class="user">
            <span class="user__name">{{ user.name }}&nbsp;</span>
            <a @click.prevent="createRoomPopup = true" class="link link--white">Create room</a>&nbsp;
            <a href="" @click="logout()" class="link link--white">Logout</a>
            <form @submit.prevent="putRoomMember($refs['join-room-name'].value)">
              <input type="text" placeholder="join to room" class="user__join-input" ref="join-room-name">
              <button class="user__join-btn">Join</button>
            </form>
          </div>
          <ul v-if="rooms.length" class="rooms">
            <li v-for="room in rooms" class="rooms__item">
              <span v-if="room.owner == user.name" @click="deleteRoom(room.name)" class="delete-room"></span>
              <span v-else @click="deleteRoomMember(room.name)" class="close close-room"></span>
              <router-link :to="`/${room.name}`" class="router-link">{{ room.name }}</router-link>
            </li>
          </ul>
        </aside>

        <main class="view">
          <div v-show="$route.path === '/'" class="welcome"><h2>Welcome</h2></div>
          <transition name="fade-in" mode="out-in">
            <router-view></router-view>
          </transition>
        </main>

        <transition name="fade-in">
          <div v-if="createRoomPopup" class="popup create-room">
            <span @click="createRoomPopup = false" class="close"></span>
            <form @submit.prevent="createRoom($refs['create-room-name'].value)">
              <input type="text" v-focus placeholder="room name" class="create-room__name" ref="create-room-name">
              <button type="submit" class="btn btn--mt-10">Create</button>
            </form>
          </div>
        </transition>
      </div>

      <div v-else class="popup">
          <component :is="currentView" @goSignUp="currentView = 'SignUp'"
                                       @goSignIn="currentView = 'SignIn'"
                                       @getRooms = "getRooms"
                                       @initSocket = "initSocket"></component>
      </div>
    </div>
  </div>
</template>

<script>

import axios from 'axios'
import io from 'socket.io-client'
import { get, erase } from 'browser-cookies'
import SignIn from './components/SignIn.vue'
import SignUp from './components/SignUp.vue'
import Alert from './components/Alert.vue'

export default {
  name: 'app',
  components:{
    SignIn,
    SignUp,
    Alert
  },
  data () {
    return {
      rooms: [],
      currentView: '',
      createRoomPopup: ''
    }
  },

  mounted() {
    this.checkAuth();
    this.setCurrentView();
    if (get('token')) {
      this.getRooms();
      this.initSocket();
    }
  },

  methods: {

    setCurrentView(){
      if (!this.user) {
        this.currentView = 'SignIn'
      }
    },

    initSocket() {
      this.socket = io(`${this.BASE_API_URL}`);
      this.socket.on('room-deleted', room => {
        const index = this.rooms.findIndex(elem => {
          return elem.name == room.name;
        });
        
        if (index >= 0) {
          this.rooms.splice(index, 1);
          this.deleteRoomMember(room.name);
          window.alert(`The owner of room '${room.name}' deleted her`)
        }
      })
    },

    getRooms() {
      const token = get('token');

      axios.get(`${this.BASE_API_URL}/users/rooms`, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        this.rooms = res.data;
      })
    },

    checkAuth() {
      const token = get('token');
      if (!token) return;
      this.$store.commit('SET_USER', {});
      axios.get(`${this.BASE_API_URL}/users`, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        if (res.data.name) {
          return this.$store.commit('SET_USER', {name: res.data.name})
        }
      })
    },

    logout() {
      this.currentView = 'SignIn'
      erase('token');
      this.$store.commit('SET_USER', '');
      this.$router.push('/')
    },

    // chat methods
    createRoom(name) {
      const roomName = name.trim(),
            token = get('token');

      if (!roomName) {
        return this.$store.commit('ALERT', {msg: 'The name cannot consist only of spaces', type: 'error'})
      }

      axios.post(`${this.BASE_API_URL}/rooms`, {name: name}, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        if (!res.data.success) {
          return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
        } 
        this.rooms.push(res.data.room);
        this.createRoomPopup = false;
        this.$store.commit('ALERT', {msg: res.data.msg, type: 'success'});
      })
    },

    deleteRoom(name){
      const token = get('token');

      axios.delete(`${this.BASE_API_URL}/rooms/${name}`, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        if (!res.data.success) {
          return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
        }
        this.getRooms();
        this.$store.commit('ALERT', {msg: res.data.msg, type: 'success'});
        if (this.$route.params.name === name) {
          this.$router.push('/');
        }
        this.socket.emit('room-deleted', {name: name, owner: this.user.name})
      })
    },

    putRoomMember(roomName) {
      const token = get('token');

      axios.post(`${this.BASE_API_URL}/users/rooms`, {name: roomName}, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        if (!res.data.success) {
          return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
        }
        this.getRooms();
        this.$store.commit('ALERT', {msg: res.data.msg, type: 'success'});
        this.$refs['join-room-name'].value = '';
      })
    },

    deleteRoomMember(roomName) {
      const token = get('token');

      axios.delete(`${this.BASE_API_URL}/users/rooms/${roomName}`, {
        headers: {
          Authorization: token
        }
      }).then(res => {
        if (!res.data.success) {
          return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
        }
        this.getRooms();
        this.$store.commit('ALERT', {msg: res.data.msg, type: 'success'});
        this.$router.push('/');
      })
    }
  },

  computed:{
    user() {
      return this.$store.state.user;
    },

    BASE_API_URL() {
      return this.$store.state.BASE_API_URL;
    },

    alertMsg() {
      return this.$store.state.alertMsg;
    },

    alertType() {
      return this.$store.state.alertType;
    }
  }
}
</script>

<style lang="sass">

@import 'sass/main.sass'

#app
  background-color: $light

.container
    max-width: 640px
    margin: 0 auto
  
.wrap
  display: flex
  justify-content: center
  align-items: center
  position: relative

.aside
  width: 30%
  height: 100vh
  background-color: $middle

.welcome
  height: 100vh
  display: flex
  justify-content: center
  align-items: center
  color: $white
  font-size: 32px

.rooms__item
  position: relative

.close-room
  transform: scale(.7)
  margin-top: 3px

.delete-room
  width: 17px
  height: 17px
  position: absolute
  top: 11px
  right: 11px
  background-image: url('http://icon-icons.com/icons2/692/PNG/512/seo-social-web-network-internet_262_icon-icons.com_61518.png')
  background-size: cover
  background-position: center
  &:hover
    cursor: pointer

.router-link
  display: block
  padding: 10px
  border-bottom: 1px solid $light
  color: $white
  &:hover
      background-color: $linkHover
      cursor: pointer

.user
  padding: 10px 0
  border-bottom: 1px solid $light
  text-align: center
  color: #fff
  &__join-input
    width: 60%
    margin-top: 10px
    padding: 2px 5px
  &__join-btn
    width: 30%
    background-color: $linkHover
    color: $white
    padding: 2px 0
    &:hover
      background-color: $light
      cursor: pointer

.view
  width: 70%
  height: 100vh
  background-color: $gray

.popup
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: $light
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column

.user__name
  display: block

.create-room
  background-color: rgba(0,0,0,.5)
  &__name
    padding: 5px

.close
  position: absolute
  right: 5px
  top: 5px
  width: 25px
  height: 25px
  &:hover
    cursor: pointer
  &::before
    content: ''
    display: block
    width: 30px
    height: 2px
    background-color: $white
    transform: rotate(45deg)
    transform-origin: top left
  &::after
    content: ''
    display: block
    width: 30px
    height: 2px
    background-color: $white
    transform: rotate(-45deg) translate(-10px, 2px)


/* Vue animations */

.fade-in-enter, .fade-in-leave-to
  opacity: 0

.fade-in-enter-active, .fade-in-leave-active
  transition: .2s all

</style>
