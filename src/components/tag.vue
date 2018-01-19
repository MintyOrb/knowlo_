<template>
  <div
  		:class="{
  			'list hoverable': display==='list'
  		}"
  	>

  		<div v-if="display==='thumb' ">
  			<span @mouseleave="leave()">
  				<div class="tagWidth">
  					<div class="menu" @mouseenter="delayHover()"  v-bind:class="{'active': hovering}">
  						<div class="">

  							<div @click="main" class="mbtn trigger" v-bind:class="{'scaleIcon': hovering}">
  								<span v-if="!tag.tag.iconURL" class="flexCenter border letter">{{tag.translation.name[0]}}</span>
  								<div v-else class="thumb card-image border">
  									<img :src="tag.tag.iconURL">
  								</div>
  							</div>

  							<div class="icons">
  								<div class="rotater">
  									<div @click.stop="pin" class="mbtn mbtn-icon flexCenter" :class="{showPin: status.pinnedIcon, hide: hide.indexOf('pin')>-1 }">
  										<i class="fa fa-thumb-tack" style="transform:rotate(-45deg)"></i>
  									</div>
  								</div>
  								<div  class="rotater">
  									<div @click="lens" class="mbtn mbtn-icon flexCenter" :class="{'showLens': status.lensIcon, hide: hide.indexOf('lens')>-1 }">
  										<i class="material-icons" style="margin-top:15px">more_horiz</i>
  									</div>
  								</div>
  								<div class="rotater">
  									<router-link :to="{ name: 'tag', params: { uid: tag.setID, name: tag.translation.name }}">
  										<div class="mbtn mbtn-icon flexCenter":class="{showInfo: status.infoIcon, hide: hide.indexOf('info')>-1 }">
  											<i class="fa fa-info" style="padding-right:10px;"></i>
  										</div>
  									</router-link>
  								</div>
  								<div class="rotater">
  									<div @click="remove" class="mbtn mbtn-icon flexCenter" :class="{'showRemove': status.removeIcon, hide: hide.indexOf('remove')>-1 }">
  										<i class="fa fa-times"></i>
  									</div>
  								</div>
  								<!-- <div class="rotater">
  									<div @click="exclude" class="mbtn mbtn-icon flexCenter" :class="{showMinus: status.excludeIcon, hide: hide.indexOf('exclude')>-1 }">
  										<i class="fa fa-minus"></i>
  									</div>
  								</div> -->
  								<div class="rotater">
  									<div @click="include" class="mbtn mbtn-icon flexCenter" :class="{showPlus: status.includeIcon, hide: hide.indexOf('include')>-1 }">
  										<i class="fa fa-plus"></i>
  									</div>
  								</div>
  								<div class="rotater">
  									<div @click="focus" class="mbtn mbtn-icon flexCenter"  :class="{showFocus: status.focusIcon, hide: hide.indexOf('focus')>-1 }">
  										<i class="fa fa-crosshairs"></i>
  									</div>
  								</div>

  							</div>
  						</div>
  					</div>
  					<div class="connections badge"v-if="tag.connections">
  						{{tag.connections}}
  					</div>
  					<div class="nameholder">
  						<div class="name">
  							{{tag.translation.name}}
  						</div>
  					</div>
  				</div>

  			</span>
  		</div>

  		<div v-if="display==='list' || display==='card'" class='cont'>
  				<span @click="main" class='taglist-title'>
  					<span class='taglist-title-left'>
  						<!-- <span class='score'>8</span>
  						<span class='vote'>
  							<i class="fa fa-caret-up"></i>
  							<i class="fa fa-caret-down"></i>
  						</span> -->

  						<span v-if="!tag.tag.iconURL" class="flexCenter border tagHW">{{tag.translation.name[0]}}</span>
  						<span v-else class=" listimg">
  							<img class='circle tagHW' :src="tag.tag.iconURL">
  						</span>
  						<span style='margin-left:10px;'>{{tag.translation.name}}</span>
  					</span>
  					<span>
  						<i @click.stop.prevent="" class="material-icons  more" :class="'dd'+tag.setID" :data-activates='tag.setID' >more_horiz</i>
  						<!-- <i @click.prevent="" class="material-icons  more" :class="'dd'+tag.setID" :data-activates='tag.setID' >keyboard_arrow_down</i> -->
  					</span>

  				</span>
          <ul :id='tag.setID' class='dropdown-content  tag-dropdown'>
            <li @click="focus"><a><i class="fa fa-crosshairs"></i>Focus</a></li>
            <li @click="include"><a><i class="fa fa-plus"></i>Add</a></li>
            <li @click="pin"><a><i class="fa fa-thumb-tack"></i>Pin</a></li>
            <!-- <li @click="lens"><a><i class="fa fa-crosshairs"></i>Cross Section</a></li> -->
            <li @click="remove"><a><i class="fa fa-times"></i>Remove</a></li>
            <li @click=""><router-link :to="{ name: 'tag', params: { uid: tag.setID, name: tag.translation.name }}"><i class="fa fa-info"></i>tag Page</router-link></li>
          </ul>
  				<!-- <div class='tag-definition'>
  					definition here
  				</div> -->

  		</div>

  		<div class='hoverable' v-if="display==='godMode'">
  			<span>{{tag.tag.uid}}</span>
  			<!-- <span>{{tag.setID}}</span> -->
  			<input type="text" v-model='tag.translation.name' v-on:blur="name(tag.translation.uid,tag.translation.name)" />
  			<!-- <span> ({{tag.translation.languageCode}})</span> -->

  			<input type='text' v-model='tag.order' v-on:blur="order(tag.tag.uid,tag.order)" />
  			<i  @click="exclude" class="fa fa-minus"></i>
  		</div>

  	</div>
</template>
<script>
import Materialize from 'materialize-css'
import $ from 'jquery'

export default {
  name: 'tag',
  props: {
    tag: Object,
    display: String,
    hide: {
      type: String,
      default: ''
    },
    persistAction: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      hovering: false,
      status: {
        pinnedIcon: false,
        includeIcon: false,
        excludeIcon: false,
        removeIcon: false,
        focusIcon: false,
        infoIcon: false,
        lensIcon: false
      }
    }
  },
  methods: {
    name (uid, val) {
      this.$http.put('/api/auth/god/name/' + uid + '/' + val).then(response => {
        if (response.body) {
          Materialize.toast('changed name', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    order (tagID, order) {
      this.$http.put('/api/auth/god/order/' + tagID + '/' + order + '/' + this.$route.params.uid).then(response => {
        if (response.body) {
          Materialize.toast('changed order', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    tagAction (action) {
      // TODO replace individual functions...
    },
    main () {
      if (this.persistAction) {
        this.status.includeIcon = true
      }
      this.tag.status = this.status
      this.$emit('main', this.tag)
    },
    remove () {
      if (this.persistAction) {
        this.status.removeIcon = !this.status.removeIcon
      }
      this.tag.status = this.status
      this.$emit('remove', this.tag)
    },
    include () {
      this.status.includeIcon = !this.status.includeIcon
      this.tag.status = this.status
      this.$emit('include', this.tag)
    },
    exclude () {
      if (this.persistAction) {
        this.status.excludeIcon = !this.status.excludeIcon
      }
      this.$nextTick(() => {
        this.tag.status = this.status
        this.$emit('exclude', this.tag)
      })
    },
    focus () {
      this.status.focusIcon = !this.status.focusIcon
      this.status.includeIcon = !this.status.includeIcon
      this.tag.status = this.status
      this.$emit('focus', this.tag)
    },
    pin () {
      if (!this.status.pinnedIcon) {
        this.status.includeIcon = !this.status.includeIcon
      }
      this.status.pinnedIcon = !this.status.pinnedIcon
      this.tag.status = this.status
      this.$emit('pin', this.tag)
    },
    lens () {
      if (this.persistAction) {
        this.status.lensIcon = !this.status.lensIcon
      }
      this.tag.status = this.status
      this.$emit('lens', this.tag)
    },
    delayHover () {
      this.left = false
      window.setTimeout(() => {
        if (!this.left) {
          this.hovering = true
        }
      }, 150)
    },
    leave () {
      this.left = true
      this.hovering = false
    }
  },
  mounted () {
    if (this.tag.status) {
      this.status = this.tag.status
    }
    // setup info dropdown
    $('.dd' + this.tag.setID).dropdown({
      alignment: 'right',
      hover: true
    })
  }
}
</script>

<style>
/* tag radial button based on this pen: http://codepen.io/suez/pen/vAais/*/
.menu, .menu .btn .fa, .menu .btn.trigger {
  position: relative;
}
.menu {
  width: 60px;
  height: 60px;
	margin: 20px;
}
.menu .mbtn {
	  position: relative;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  opacity: 0;
	  z-index: -10;
	  cursor: pointer;
	  transition: opacity .2s, z-index 0.1s, transform .3s;
	  transform: translateX(0);
}
.menu .mbtn .fa {
	  font-size: 1.5em;
	  transition: color 0.3s;
		margin-top:18px
}
.menu .mbtn:hover .fa {
	  color: rgba(140, 139, 139, 0.68);
}
.border {
  border:1px solid black;
  border-radius: 50%;
}
.menu .mbtn.trigger {
		z-index: 10;
    padding: 10px;
		color:black;
	  opacity: 1;
		font-size: 40px;
		font-weight: 200;
	  cursor: pointer;
		text-transform: uppercase;
	  transition: transform 0.4s;
}
.menu .mbtn.trigger:hover {
	  transform: scale(.7)!important;
}
.scaleIcon {
  transform: scale(.6)!important;
}
.menu .rotater {
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  transform-origin: 50% 50%;
}
.menu.active .mbtn-icon {
	  opacity: 1;
}
.rotater:nth-child(1) {
	  transform: rotate(-30deg);
}
.showLens {
	transform: translateY(-2.9em) rotate(-30deg)!important;
	opacity: 1!important;
}
.menu.active .rotater:nth-child(1) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(30deg);
}
.showPin {
	transform: translateY(-2.9em) rotate(30deg)!important;
	opacity: 1!important;
}
.hide{
  display: hidden;
}
.rotater:nth-child(2) {
	  transform: rotate(30deg);
}
.menu.active .rotater:nth-child(2) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(-30deg);
}
.rotater:nth-child(3) {
	  transform: rotate(90deg);
}
.menu.active .rotater:nth-child(3) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(-90deg);
}
.rotater:nth-child(4) {
	  transform: rotate(150deg);
}
.menu.active .rotater:nth-child(4) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(-150deg);
}
.showMinus {
	transform: translateY(-2.9em) rotate(-150deg)!important;
	opacity: 1!important;
}
.showRemove {
	transform: translateY(-2.9em) rotate(-150deg)!important;
	opacity: 1!important;
}
/*minus drop */
/*translate(2.7em, -4.5em)  rotate(-150deg)*/
.rotater:nth-child(5) {
	  transform: rotate(210deg);
}
.menu.active .rotater:nth-child(5) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(-210deg);
}
.showPlus {
	transform: translateY(-2.9em) rotate(-210deg)!important;
	opacity: 1!important;
}
/*plus dropr*/
/*translate(-2.7em, -4.5em) rotate(-300deg)*/
.rotater:nth-child(6) {
	  transform: rotate(270deg);
}
.menu.active .rotater:nth-child(6) .mbtn-icon {
	  transform: translateY(-2.9em) rotate(-270deg);
}
.showFocus {
	transform: translateY(-2.9em) rotate(-270deg)!important;
	opacity: 1!important;
}

.nope {
		color: rgba(140, 139, 139, 0.68);
}
.name {
  text-align: center;
  font-weight: 300;
  display: table-cell;
  vertical-align: middle;
  width: 95px;
  word-break: break-word;
}
.nameholder{
  height: 43px;
  display: table;
  margin-top: -10px;
}
.expandedFlex {
	display: flex;
	align-items: center;
}
.tagWidth {
  width: 100px;
  margin-bottom: 10px;
}
/*increase hover target for info icon*/
.fa-info {
  width: 20px
}

.more {
  opacity: 0;
  margin: 8px;
  margin-left: 15px;
  transition: opacity .6s ease-in-out;
}
.tag-definition{
  display: block;
  padding: 10px;
  min-height: 80px;
}
.cont {
  width: 100%;
}
.cont:hover i {
  opacity: 1;
}
.tag-dropdown {
  font-weight: 300;
  width: 180px!important;
}
.tag-dropdown li a {
  color: black!important;
}

.taglist {
  font-size: 0.8em;
  vertical-align: middle;
  font-weight: 300;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: black;
}
.taglist a {
  color: black;
}
.tagHW {
  min-width: 35px;
  max-height: 35px;
  width:35px;
  height: 35px;
  font-size: 20px!important;
}
.taglist-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px;
}
.taglist-title-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.vote {
  display: flex;
  flex-direction: column;
  margin-right:8px;
}
.vote i{
  transition: transform .2s ease-in-out;
}
.vote i:hover{
  transform: scale(1.2);
}
.score {
  margin:8px;
}
.connections {
  height: 1.3em;
  width: 1.3em;
  position: absolute;
  top: 64px;
  right: 18px;
  z-index: 20;
  font-size: 12px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px;
}
.flexCenter{
	display: flex;
	align-content: center;
	justify-content: center;
}
.definition{
  width:50vw;
}
.tagMeta {
  height: 100vh;
  width: 100vw;
}
.tagTitle {
  background-color: #2196F3;
  padding: 25px;
}
.tagTitle span {
  font-weight: 200;
  color:white;
  font-size: 20px;
}
.letter {
  font-size: 25px;
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    .cont i {
      opacity: 1;
    }
  }
  /* Smartphones (landscape) ----------- */
  @media only screen
  and (min-width : 376px)
  and (max-width : 767px) {
    .cont-medium {
      width: 50vw;
    }
    .cont i {
      opacity: 1;
    }
  }
</style>
