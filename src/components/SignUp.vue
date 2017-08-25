<template>
    <div class="reg">
        <h3 class="reg__title">Sign up</h3>
        <form @submit.prevent="signUp" class="reg__form">
            <input v-focus required type="text" placeholder="name" class="reg__name" ref="name">
            <input required type="password" placeholder="password" class="reg__password" ref="password">
            <button type="submit" class="btn reg__submit">Sign up</button>
            <a @click.prevent="$emit('goSignIn')" class="link">Sign in</a>
        </form>
    </div>
</template>

<script>

import axios from 'axios'
import { set } from 'browser-cookies'

export default {
    data() {
        return {
            alert: ''
        }
    },
    
    methods: {
        signUp() {
            const name = this.$refs['name'].value.trim(),
                  password = this.$refs['password'].value.trim();

            if (!name|| !password) {
                return this.$store.commit('ALERT', {msg: 'The name or password cannot consist only of spaces', type: 'error'})
            }

            axios.post(`${this.BASE_API_URL}/users`, {name: name, password: password}).then(res => {
                if (!res.data.token) {
                    return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
                }
                set('token', res.data.token);
                this.$store.commit('SET_USER', {name: res.data.name});
                this.emit('initSocket');
            })
        }
    },

    computed: {
        BASE_API_URL() {
            return this.$store.state.BASE_API_URL;
        }
    },

    watch: {
        alert: function() {
            window.alert(this.alert);
        }
    }
}

</script>


<style lang="sass">

@import '../sass/_vars.sass'

.reg
  &__title
    display: block
    text-align: center
    color: $white
    margin: 10px 0
  &__form
    text-align: center
  &__name, &__password
    display: block
    padding: 5px
    margin-top: 5px
  &__submit
    display: block
    width: 100%
    margin-top: 5px

</style>


