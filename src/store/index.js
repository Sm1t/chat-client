import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: '',
    BASE_API_URL: 'http://localhost:3000',
    alertMsg: '',
    alertType: '',
    alertTimeoutId: ''
  },

  mutations: {
    SET_USER(state, obj) {
        state.user = obj;
    },

    ALERT(state, payload) {

      state.alertType = payload.type;
      state.alertMsg = '';

      clearTimeout(state.alertTimeoutId);

      setTimeout(function() {
				state.alertMsg = payload.msg;
      }, 0);
      
      state.alertTimeoutId = setTimeout(function() {
				state.alertMsg = '';
			}, 1500)
    }
  }
})