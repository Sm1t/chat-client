import Vue from 'vue'
import VueRouter from 'vue-router'
import Room from '../components/Room.vue'

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/:name',
            name: 'room',
            component: Room
        }
    ]
})