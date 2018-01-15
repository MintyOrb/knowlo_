<template :member='member' >
	<ul id="slide-out" class="side-nav">
    <li><a href="#" class="subheader" id="navName">Knowlo</a></li>
    <li><div class="divider"></div></li>
    <li v-if="!member.uid"><a @click="loginModal" class="waves-effect"><i class="fa fa-lg fa-sign-in"></i>Login | Sign Up</a></li>
    <li v-else ><a @click="signOut" class="waves-effect"><i class="fa fa-lg fa-sign-out"></i>Log Out</a></li>
    <li><div class="divider"></div></li>
    <li><a class="subheader"></a></li>
    <li v-if="member.uid"><router-link class="waves-effect" :to="'/m/'+member.uid"><i class="fa fa-lg fa-user"></i>Profile</router-link></li>
    <li><router-link class="waves-effect" to="/"><i class="fa fa-lg fa-compass"></i>Explore</router-link></li>
    <!-- <li><router-link class="waves-effect" to="/trending"><i class="material-icons">trending_up</i>Trending</router-link></li> -->
    <li><router-link class="waves-effect" to="/status"><i class="fa fa-lg fa-area-chart"></i>Status | Stats</router-link></li>
    <li><a class="subheader"></a></li>
		<li><div class="divider"></div></li>
    <li><router-link class="waves-effect" to="/about"><i class="fa fa-lg fa-info"></i>About</router-link></li>
    <li><router-link class="waves-effect" to="/principals"><i class="fa fa-lg fa-lightbulb-o"></i>Principals</router-link></li>
    <li><router-link class="waves-effect" to="/getInvolved"><i class="fa fa-lg fa-users"></i>Get Involved</router-link></li>
    <li><router-link class="waves-effect" to="/legal"><i class="fa fa-lg fa-gavel"></i>Legal</router-link></li>
    <li><a class="waves-effect" target="blank" href="http://github.com/bornytm/knowlo"><i class="fa fa-lg fa-github"></i>Code | Github</a></li>
	</ul>
</template>
<script>
import firebase from 'firebase'
import $ from 'jquery'
export default {
  name: 'sidemenu',
  props: ['member'],
  methods: {
    loginModal () {
      $('#login-modal').modal('open')
    },
    signOut () { // since this is a child component, probably should be emitting an event and using the signout method on main instead...
      firebase.auth().signOut().then(() => {
        // Sign-out successful...
      }, (error) => {
        console.log('an error...', error)
        // An error happened.
      })
    }
  },
  created () {
    this.$nextTick(() => {
      $('.navbar-collapse').sideNav({
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true // Choose whether you can drag to open on touch screens
      })
    })
  }
}
</script>

<style>
.side-nav{
  z-index: 1006;
}

</style>
