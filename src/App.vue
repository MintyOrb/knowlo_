<template>
<div id="app">

  <!-- TODO: make component - top nav -->
  <div id="nav-slide" class="navbar-fixed">
    <nav class='blue'>
      <div class="nav-wrapper">
        <router-link to="/" class="brand-logo center thin">knowlo</router-link>
        <ul class="left ">
          <li><a data-activates="slide-out" class="navbar-collapse show-on-large"><i class="material-icons">menu</i></a></li>
        </ul>
        <ul class="right ">
          <li v-if="!member.uid" style="margin-right:13px">
            <a @click="loginModal" class="hide-on-med-and-down">Login | Sign Up</a>
            <a @click="loginModal" class="hide-on-med-and-up"><i class="material-icons fa fa-lg fa-sign-in"></i></a>
          </li>
          <li v-else v-cloak style="margin-right:13px">
            <!-- member icon here? -->
            <router-link :to="'/m/'+member.uid">{{member.first}}</router-link>
          </li>
          <!-- <li><a data-activates="query-slide" class="tagQuery-collapse show-on-large "><i class="material-icons">menu</i></a></li> -->
        </ul>
      </div>
    </nav>
  </div>


  <sidemenu :member="member"></sidemenu>


  <!-- TODO: make component  firebase login-->
  <div id="login-modal" class="modal">
    <div class="modal-content">
      <h4 class='login-head'>Login | Sign Up</h4>
      <div id="firebaseui-auth-container"></div>
    </div>
    <div class="modal-footer">
      <a class="modal-action modal-close waves-effect waves-blue btn-flat">Close</a>
    </div>
  </div>

  <!-- main view -->
  <transition name="fade" mode="out-in" appear id='q-app'>
    <router-view v-on:clear="tagQuery = []" :tag-query="tagQuery" :member="member" style="padding-top:50px" />
  </transition>

  <footer class="page-footer blue">
    <div class="container">
      <div class="row">
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container center">knowlo</div>
      <a style="margin-left:20px; margin-top:5px; position:absolute;" href="https://github.com/bornytm/knowlo"><img style="width:25px" src="statics/github.png"></a>
    </div>
  </footer>

</div>
</template>

<script>
import Vue from 'vue'
import $ from 'jquery'
import Materialize from 'materialize-css'
import Headroom from 'headroom.js'
import Cookies from 'js-cookie'
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import sidemenu from '@/components/sideMenu'
export default {
  name: 'app',
  components: { sidemenu },
  data () {
    return {
      member: {
        uid: null
      }, // id and info for member if logged in, uid null if not
      tagQuery: [] // array of tag objects to be queried
    }
  },
  methods: {
    close () {
      $('.tagQuery-collapse').sideNav('hide')
    },
    loginModal () {
      $('#login-modal').modal('open')
    },
    touchMember () {
      // ensure member is in DB (add if first time signing in)
      this.$http.post('/api/auth/member').then(response => {
        if (!response.body) {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    }
  },
  mounted () {
    // needed to recover from occasional mystery DOM exception on resource/tag suggestion change
    // Vue.config.errorHandler = (err) => { // TODO figure out what is causing this...vueisotope?
    //   Materialize.toast('whoops...hit a snag. Reload the page if things seem off...', 3000)
    //   console.log(err)
    //   // window.setTimeout( ()=> {
    //   //   this.$router.go(this.$route)
    //   // }, 2000)
    // }
    // get tag query
    if (Cookies.get('tagQuery')) {
      this.tagQuery = Cookies.getJSON('tagQuery')
    }

    // TODO: use this...
    // var lang = window.navigator.userLanguage || window.navigator.language
    // lang = lang.substr(0, 2) // get two letter language code

    $('#login-modal').modal() // init login modal

    // init headroom (hide/show navbar on scroll down/up)
    var elem = document.querySelector('#nav-slide')
    new Headroom(elem, {
      'offset': 50,
      'tolerance': {
        down: 0,
        up: 10
      }
    }).init()

    // init firebase app
    var config = {
      apiKey: 'AIzaSyBEB96pSPjTN0F3CKaQUNoaSJiQHLc5pEM',
      authDomain: 'knowlo-952cc.firebaseapp.com',
      databaseURL: 'https://knowlo-952cc.firebaseio.com',
      projectId: 'knowlo-952cc',
      storageBucket: 'knowlo-952cc.appspot.com',
      messagingSenderId: '361390483938'
    }
    firebase.initializeApp(config)

    var uiConfig = {
      callbacks: {
        signInSuccess: function (currentUser, credential, redirectUrl) {
          // close login modal if open...
          $('#login-modal').modal('close')
          return true
        }
      },
      signInSuccessUrl: '/#/',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      tosUrl: 'knowlo.io/#/legal', // Tags of service url.
      signInFlow: 'popup'
    }

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig)

    // The start method will wait until the DOM is loaded.
    firebase.auth().onAuthStateChanged((member) => {
      if (member) {
        this.member = member
        this.member.first = member.displayName.substr(0, member.displayName.indexOf(' ')) // get first name -  if there is no space at all, then the first line will return an empty string and the second line will return the entire string
        member.getIdToken().then((accesstag) => {
          Vue.http.headers.common['Authorization'] = 'Bearer ' + accesstag
          this.touchMember()
          // bus.$emit('login', member)
        })
      } else {
        this.member = {
          uid: null
        }
        Vue.http.headers.common['Authorization'] = ''
      }
    }, (error) => {
      console.log(error)
      Materialize.toast('Something went wrong...are you online?', 4000)
    })
  }
}
</script>
<style src="materialize-css/dist/css/materialize.css"></style>
<style src="flickity/dist/flickity.min.css"></style>
<style src="leaflet/dist/leaflet.css"></style>
<style src="firebaseui/dist/firebaseui.css"></style>
<style>
/* * {outline: 1px solid black;} */
.modal .modal-content {
  padding: 0px;
}
.margin20 {
	margin:20px;
}
.modal-overlay {
  height: 100vh;
  position: sticky;
}
.fullPage{
  z-index: 1001;
  top: 0!important;
  width: 100vw;
  height: 100%;
  max-height: none;
  display: block;
  overflow: scroll;
}
.exit {
  border-bottom-left-radius: 6px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
  padding-right: 8px;
  padding-top: 2px;
  color: black;
  background-color: white;
  padding-left: 7px;
  padding-bottom: 4px;
}
.exit:hover{
  cursor: pointer;
}
.memberTitle div {
  font-weight: 200;
  color:black;
  font-size: 30px;
  padding-top:20px;
}
.message {
  font-size: 30px;
  font-weight: 300;
  text-align: center;
  margin: 100px;
  background-color: #f7f7f7;
  border-radius: 10px;
  padding: 45px;
}
/* in member and nav */
.resourceSections{
  height: 100%!important;
  background-color: white;
}
.resourceStep {
  width: 25vw;
	height: 100%;
  overflow: scroll;
  padding-top: 10px;
}
.viewBtn {
  transition: color .3s;
}
.viewBtn:hover {
  cursor: pointer;
  color: gray;
}
.disabled {
  background-color: #eee!important;
  color: gray!important;
}
.disabled:hover {
  cursor: not-allowed!important;
  background-color: #eee!important;
}
/* dots are lines */
.flickity-page-dots .dot {
  height: 4px;
  width: 40px;
  margin: 0px;
  border-radius: 0;
}

.flickContainer{
	position: relative;
	border-right: 1px solid darkgray;
	border-left: 1px solid darkgray;
	width: 100%;
	margin:15px;
}
.flickItem{
	margin-left: 15px;
	margin-right: 15px;
	margin-top: 10px;
}
.flickity-page-dots {
  display: flex;
  align-content: center;
  justify-content: center;
  bottom: 0px;
}
.input-field{
  margin-top: 0;
  max-width: 100%;
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 15px;
}
input:not([type]), input[type=text]:not(.browser-default), input[type=password]:not(.browser-default), input[type=email]:not(.browser-default), input[type=url]:not(.browser-default), input[type=time]:not(.browser-default), input[type=date]:not(.browser-default), input[type=datetime]:not(.browser-default), input[type=datetime-local]:not(.browser-default), input[type=tel]:not(.browser-default), input[type=number]:not(.browser-default), input[type=search]:not(.browser-default), textarea.materialize-textarea {
  margin-bottom:0;
}

.login-head {
    text-align: center;
    margin: 20px!important;
    font-weight: 300;
}
.fade {
  color:#a8a8a8;
}
.noUi-target.noUi-horizontal .noUi-tooltip {
  background-color: #2196F3!important;
}
.noUi-connect{
  background-color: #2196F3!important;
}
.hidden{
  visibility: hidden;
}
/*hide scroll bars*/
::-webkit-scrollbar {
    display: none;
}
html {
  -ms-overflow-style: none;
}
.bold {
	font-weight: 700;
}
.dropdown-content li>a {
	color: #2196F3;
}
.dropdown-content li>span {
  color: #2196F3;
}
.dropdown-content {
  z-index: 2000;
}
[v-cloak] { display: none }
.headroom {
    will-change: transform;
    transition: transform 200ms linear;
}
.headroom--pinned {
    transform: translateY(0%);
    box-shadow: 0 5px 5px 0 rgba(0,0,0,0.2), 0 7px 11px 0 rgba(0,0,0,0.19);
}
.headroom--unpinned {
    transform: translateY(-100%);
}

#nav-slide{
  position: fixed;
  width: 100vw;
}
#nav-slide ul {
  margin-left: 13px;
}
#navName {
  color:#2196F3;
  font-size: 38px;
  font-weight: 200;
  text-align: center;
  margin:20px;
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    .metaNav {
      justify-content: flex-start!important;
    }
    .tagNav span {
      margin-bottom: 18px;
    }
    .definition{
      width:100vw!important;
    }
    .discussion{
      width:100vw!important;
    }
    .stepContainer{  width: 100vw;}
    .addContainer{
      padding-top: 200px;
      padding-bottom: 100px;
      padding-left: 50px;
      padding-right: 50px;
    }
    .resourceStep{ width:100vw!important;}
}

.metaNav {
    position: sticky;
    top: 0;
    height: 40px;
    z-index: 1000;
    background-color: white;
    box-shadow: 0 5px 5px 0 rgba(0,0,0,0.2), 0 7px 11px 0 rgba(0,0,0,0.19);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: scroll;
    overflow-y: hidden;
  }
.metaNav span {
  font-weight: 300;
  padding-right: 15px;
  padding-left: 15px;
}
.metaNav span:hover {
  cursor: pointer;
}
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    #addResourceModal{
      border-radius: 0px!important;
    }
    .rchart {
      margin: auto;
      width: 90%;
    }
    .text-container{
      padding: 10px;
      font-size: 20px;
    }
    .modal {
        top: 0!important;
        max-height: 100%!important;
        width: 100%!important;
        height: 100%!important;
    }
    .message {
      font-size:20px;
      margin:20px;
      padding: 15px;
    }
    .vid-container-container {
      margin:auto;
      width:100vw;
    }
    .filter {
        margin: 0px;
    }
    .suggestionGroupStep{
      padding: 0;
      width: 90vw;
    }
    .cont i {
      opacity: 1;
    }
    .definition{
      width:100vw!important;
    }
    .discussion{
      width:100vw!important;
    }
    .addContainer{
      padding-top: 200px;
      padding-bottom: 100px;
      padding-left: 50px;
      padding-right: 50px;
    }
    .resourceStep{
      width:100vw!important;
      padding: 20px;
    }
}
.discussion{
  width:100vw!important;
}

element.style {
}
input:not([type]):focus:not([readonly]), input[type=text]:not(.browser-default):focus:not([readonly]), input[type=password]:not(.browser-default):focus:not([readonly]), input[type=email]:not(.browser-default):focus:not([readonly]), input[type=url]:not(.browser-default):focus:not([readonly]), input[type=time]:not(.browser-default):focus:not([readonly]), input[type=date]:not(.browser-default):focus:not([readonly]), input[type=datetime]:not(.browser-default):focus:not([readonly]), input[type=datetime-local]:not(.browser-default):focus:not([readonly]), input[type=tel]:not(.browser-default):focus:not([readonly]), input[type=number]:not(.browser-default):focus:not([readonly]), input[type=search]:not(.browser-default):focus:not([readonly]), textarea.materialize-textarea:focus:not([readonly]) {
    border-bottom: 1px solid #2196F3!important;
    box-shadow: 0 1px 0 0 #2196F3!important;
  }

element.style {
}
input:not([type]):focus:not([readonly]) + label, input[type=text]:not(.browser-default):focus:not([readonly]) + label, input[type=password]:not(.browser-default):focus:not([readonly]) + label, input[type=email]:not(.browser-default):focus:not([readonly]) + label, input[type=url]:not(.browser-default):focus:not([readonly]) + label, input[type=time]:not(.browser-default):focus:not([readonly]) + label, input[type=date]:not(.browser-default):focus:not([readonly]) + label, input[type=datetime]:not(.browser-default):focus:not([readonly]) + label, input[type=datetime-local]:not(.browser-default):focus:not([readonly]) + label, input[type=tel]:not(.browser-default):focus:not([readonly]) + label, input[type=number]:not(.browser-default):focus:not([readonly]) + label, input[type=search]:not(.browser-default):focus:not([readonly]) + label, textarea.materialize-textarea:focus:not([readonly]) + label {
    color:  #2196F3!important;
  }
.material-icons {
  font-size: 25px;
}
#login-modal div {
  box-shadow: none;
}
.thumb {
    min-width: 40px;
    width: 40px;
    height: 40px;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
}
.thumb img {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 100%;
  width: auto;
  -webkit-transform: translate(-50%,-50%);
      -ms-transform: translate(-50%,-50%);
          transform: translate(-50%,-50%);
}
.row {
  margin: auto!important;
}
</style>
