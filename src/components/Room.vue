<template>
    <div :id="$route.params.name" class="room">
        <h2 class="room__title">{{ $route.params.name }}</h2>
        <div class="room__content">
            <ul v-if="messages[0]" class="messages__list" id="messages-list" ref="messages-list">
                <li v-for="message in messages" class="messages__item">
                    {{ message.owner }}: {{ message.text }}
                </li>
            </ul>
            <h2 v-if="empty">There are no messages</h2>
            <form @submit.prevent="putMessage($refs['message-text'].value)" class="message__form">
                <textarea @keydown.enter.prevent="putMessage($refs['message-text'].value)" class="message__text" ref="message-text"></textarea><!--
             --><button type="submit" class="message__send">Send</button>
            </form>
        </div>
    </div>
</template>


<script>

import io from 'socket.io-client'
import axios from 'axios'
import { get } from 'browser-cookies'

export default {
    data() {
        return {
            messages: [],
            socket: '',
            empty: false
        }
    },

    created() {
        axios.get(`${this.BASE_API_URL}/rooms/${this.$route.params.name}`).then(res => {
            if (!res.data) this.$router.push('/');
        })
    },

    mounted() {
        this.getMessages(this.$route.params.name);
        this.initSocket();
    },

    methods: {
        initSocket() {
            this.socket = io(`${this.BASE_API_URL}`);
            this.socket.emit('change-room', this.$route.params.name);
            this.socket.on('message', (msg) => {
                this.messages.push({text: msg.text, owner: msg.owner});
                if (this.empty) this.empty = false;
                this.setScroll();
            })
        },

        getMessages(roomName) {
            axios.get(`${this.BASE_API_URL}/rooms/${roomName}/messages`).then(res => {
                if (!res.data[0]) this.empty = true;
                this.messages = res.data;
                this.setScroll();
            })
        },

        putMessage(text) {
            if (!text) return;
            
            this.messages.push({text: text, owner: this.user.name});
            this.$refs['message-text'].value = '';
            this.setScroll();

            axios.post(`${this.BASE_API_URL}/rooms/${this.$route.params.name}/messages`, {text: text}, {
                headers: {
                    Authorization: get('token')
                }
            }).then(res => {
                if (!res.data.success) {
                    return this.$store.commit('ALERT', {msg: res.data.msg, type: 'error'});
                }
                this.socket.emit('message', res.data.message);
            })

            if (this.empty) this.empty = false;
        },

        setScroll() {
            const vm = this;
            setTimeout(function() {
                const ul = vm.$refs['messages-list'];
                if (ul) {
                    ul.scrollTop = ul.scrollHeight - ul.offsetHeight;
                }
            }, 0)
        }
    },

    computed: {
        BASE_API_URL() {
            return this.$store.state.BASE_API_URL;
        },

        user() {
            return this.$store.state.user;
        }
    },

    beforeRouteUpdate (to, from, next) {
        this.empty = false;
        this.getMessages(to.params.name);
        this.socket.emit('change-room', to.params.name);
        next();
    }
}

</script>


<style lang="sass">

@import "../sass/_vars.sass"

.room
    display: flex
    flex-direction: column
    justify-content: space-between
    height: 100%
    &__title
        text-align: center
        line-height: 40px
        color: $white
    &__content
        display: flex
        flex-direction: column
        justify-content: flex-end

.message
    &__form
        display: flex
        justify-content: center
        align-items: stretch
        flex-shrink: 0
        height: 40px
    &__text
        resize: none
        border: none
        outline: none
        width: 70%
    &__send
        width: 30%
        color: $white
        background-color: $middle
        &:hover
            cursor: pointer
            background-color: $linkHover

.messages
    &__list
        overflow-y: auto
        max-height: calc(100vh - 80px)
    &__item
        padding: 2px 5px



</style>
