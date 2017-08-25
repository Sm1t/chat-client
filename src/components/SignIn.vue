<template>
    <div class="login">
        <h3 class="login__title">Sign in</h3>
        <form @submit.prevent="login" class="login__form">
            <input v-focus required type="text" placeholder="name" class="login__name" ref="name">
            <input required type="password" placeholder="password" class="login__password" ref="password">
            <button type="submit" class="btn login__submit">Sign in</button>
            <span>No account? </span><a @click.prevent="$emit('goSignUp')" class="link">Sign up</a>
        </form>
    </div>
</template>

<script>

import axios from 'axios'
import { set } from 'browser-cookies'

export default {
    data() {
        return {
            
        }
    },

    methods: {
        login(){
            const name = this.$refs['name'].value.trim(),
                  password = this.$refs['password'].value.trim();
            
            if (!name || !password) {
                return this.$store.commit('ALERT', {msg: 'The name or password cannot consist only of spaces', type: 'error'})
            }

            axios.post(`${this.BASE_API_URL}/users/auth`, {name: name, password: password}).then(res => {
                if (!res.data.token) {
                    return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
                }
                set('token', res.data.token);
                this.$store.commit('SET_USER', {name: res.data.name});
                this.$emit('getRooms');
                this.$emit('initSocket');
            })
        }
    },

    computed: {
        BASE_API_URL() {
            return this.$store.state.BASE_API_URL;
        }
    }
}

</script>


<style lang="sass">

@import '../sass/_vars.sass'

.login
    &__title
        display: block
        text-align: center
        color: $white
        margin: 10px 0
    &__form
        text-align: center
    &__name, &__password, &__submit
        display: block
        padding: 5px
        margin-top: 5px
    &__submit
        width: 100%
        color: $white
        background-color: $middle
        &:hover
            cursor: pointer
            background-color: $linkHover


</style>


