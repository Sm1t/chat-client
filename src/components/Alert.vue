<template>
    <transition name="fade-in">
        <span class="alert" :style="{animationName: type}">{{ msg }}</span>
    </transition>
</template>


<script>

export default {
    props: ['msg', 'type']
}

</script>


<style lang="sass">

$darkBlue: #102030
$lightBlue: #bac9e2
$lightRed: #ff7070
$lightGreen: #70ff70

.alert
	position: absolute
	top: 20px
	left: 50%
	transform: translate(-50%)
	min-width: 200px
	padding: 15px
	text-align: center
	font-size: 20px
	color: $darkBlue
	background-color: $lightBlue
	border: 1px solid $darkBlue
	border-radius: 10px
	animation-duration: 1.5s

.alert
    z-index: 100

@keyframes error
	0%
		background-color: $lightRed
	100%
		background-color: $lightBlue

@keyframes success
	0%
		background-color: $lightGreen
	100%
		background-color: $lightBlue


</style>
