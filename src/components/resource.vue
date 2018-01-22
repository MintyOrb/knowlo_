<template>
  <div class='resource'
  @mouseenter="hovering = true"
  @mouseleave="hovering = false"
		:class="{
    'list z-depth-1 hoverable': display === 'list',
    'card z-depth-1 hoverable': display === 'card'}"
		>
    <!-- <q-chip v-show="hovering" floating color="primary"></q-chip> -->
		<!-- <div style='height:20px;'@click.stop.prevent='' class='right boo' data-activates='reOptions' data-hover='true' data-alignment='right'><i class='material-icons'>more_horiz</i></div>
		<ul id='reOptions' class='dropdown-content'>
			<li>add tag</li>
			<li>expand</li>
			<li>shrink</li>
			<li>vote</li>
			<li>open</li>
			<li>change</li>
			<li>...</li>
		</ul> -->
    <div v-if="display === 'list' " class='voteView'>
 			<span >{{trimNumber(re.resource.viewCount,1) || 0}} <i class="tiny material-icons">visibility</i></span>
 			<span >{{re.votes}}
				<img style='width:15px; position:inherit; margin-bottom:-2px' src="data:image/png;base64,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"  />
			</span>
 		</div>
		<div v-if="re.resource.mThumb"
			:class="{
      'thumb waves-effect waves-block waves-light z-depth-1 hoverable': display==='thumb' || display =='list' || display === 'godMode',
      'card-image': display==='card',
      'margin20': display==='thumb' || display==='list' ,
      'inline mb': display==='list'}"
			>
			<router-link @click='selected' :to="{ name: 'resource', params: { uid: re.resource.uid }}">
				<img :src="re.resource.mThumb" />
			</router-link>
      <q-input v-if="editing" v-model="re.resource.mThumb" float-label="Thumbnail URL" type='url'/>
      <q-input v-if="editing" v-model="re.resource.url" float-label="URL" type='url' />
		</div>
		<router-link @click='selected' v-if="re.resource.text && re.resource.text.length > 0 && display =='thumb'" :to="{ name: 'resource', params: { uid: re.resource.uid }}">
			<div class="margin20 hoverable thumb">
				<span >{{re.resource.text.substring(0,5)}}...</span>
			</div>
		</router-link>

		<div v-if="editing || (re.resource.title && display =='card' || display =='list')"
			:class="{
      'truncate inline tmargin titleText': display === 'list',
      'card-content': display === 'card'}"
			>
			<router-link v-show='!editing' @click='selected' :to="{ name: 'resource', params: { uid: re.resource.uid }}">
				<span :class="{'title': display === 'card'}">{{re.resource.title}}</span>
			</router-link>
      <q-input v-if="editing" v-model="re.resource.title" float-label="Title" type='textarea'/>

			<div class='subtitle' v-if="re.resource.subtitle">
				<span v-show="!editing">{{re.resource.subtitle}}</span>
        <q-input v-if="editing" v-model="re.resource.subtitle" float-label="Subtitle" />
			</div>
		</div>
		<div class="rText" v-if="!editing && (re.resource.text && display !='thumb')"
    :class="{
    'titleText truncate': display === 'list' && $route.name != 'tag'}"
    >
			<router-link @click='selected' :to="{ name: 'resource', params: { uid: re.resource.uid }}">
				{{re.resource.text.substring(0,300)}}
			</router-link>
		</div>
    <q-input v-if='editing' v-model="re.resource.text" float-label="Body Text" type='textarea'/>


    <q-collapsible v-if="display !== 'thumb' && !editing"
      @open="sizeChange"
      @close="sizeChange"
      :sublabel="voteLabel()"
      @click.stop.prevent=""
      :class="{
      'voteHalf': display === 'list'}"
    >
      <div class="">
				<i  @click="ratingDisplay='global'" @mouseenter="ratingDisplay='global'" class="fa fa-lg fa-globe rating" :class="{'selected': ratingDisplay==='global'}"></i>
				<i  @click="ratingDisplay='member'" @mouseenter="ratingDisplay='member'" class="fa fa-lg fa-user rating" :class="{'selected': ratingDisplay==='member'}"></i>
			</div>
      <q-slider @change="qualityChange" color="orange"  v-model="displayQuality" :min="0" :max="1" :step="0.001" label :label-value="displayQuality | strr"/>
      <q-slider @change="complexityChange" color="blue" v-model="displayComplexity" :min="0" :max="1" :step="0.001" label :label-value="displayComplexity | strr"/>
    </q-collapsible>

		<div v-if="display === 'card' && !editing" class='card-action'>
 			<span class='left card-bottom'><i class="tiny material-icons">visibility</i>{{trimNumber(re.resource.viewCount,1) || 0}}</span>

 			<span class='right card-bottom'>{{re.votes}}
				<img style='width:15px; position:inherit; margin-bottom:-2px' src="data:image/png;base64,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"  />
			</span>
 		</div>

    <div v-if='editing' class="card-action">
      <a>save</a> <a @click="editing = false">cancel</a>
    </div>

		<div v-if='display === "godMode"'>
			<input v-model='re.resource.uid'></input>

			<input type="text" v-if='re.resource.title' v-model='re.resource.title' v-on:blur="" />
			<!-- <span> ({{tag.translation.languageCode}})</span> -->
			<input type='text' v-if='re.resource.text' v-model='re.resource.text' v-on:blur="" />
			<span class='btn blue'@click='deleteResource(re.resource.uid)'>delete resource</span>
		</div>
 	</div>
</template>

<script>
import Materialize from 'materialize-css'
import $ from 'jquery'
import { QSlider, QCollapsible, QChip, QInput } from 'quasar'

export default {
  name: 'resource',
  components: { QSlider, QCollapsible, QChip, QInput },
  props: {
    re: Object,
    display: String
  },
  data: () => {
    return {
      editing: false,
      hovering: false,
      displayQuality: 0,
      displayComplexity: 0,
      ratingDisplay: ''
    }
  },
  methods: {
    sizeChange () {
      setTimeout(() => { // wait for change
        this.$emit('changedDisplay')
      }, 300)
    },
    voteLabel () {
      // can be html...
      return '<span><span class="left" style="color:orange">Q: ' + this.displayQuality.toString().substring(0, 4) + '</span> <span style="float:right; color:blue" class="">C: ' + this.displayComplexity.toString().substring(0, 4) + '</span></span>'
    },
    qualityChange (val) {
      console.log('qual chng ', val)
      if (!this.re.memberVote) {
        this.re.memberVote = {}
      }
      if (val !== this.re.memberVote.quality) {
        this.re.memberVote.quality = val
        this.vote()
      }
    },
    complexityChange (val) {
      if (!this.re.memberVote) {
        this.re.memberVote = {}
      }
      if (!this.re.memberVote || val !== this.re.memberVote.complexity) {
        this.re.memberVote.complexity = val
        this.vote()
      }
      console.log('complexity chng ', val)
    },
    selected () {
      this.$emit('selected')
    },
    vote () {
      this.$http.put('/api/auth/resource/' + this.re.resource.uid + '/vote', {vote: this.re.memberVote}).then(response => {
        if (response.body) {
          Materialize.toast('voted!', 2000)
          this.re.globalVote = response.body.globalVote
          this.re.votes = response.body.votes
          this.$emit('vote-cast')
          this.ratingDisplay = 'member'
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        if (response.status === 401) {
          Materialize.toast('You must be logged in to vote!', 4000)
          $('#login-modal').modal('open')
          this.ratingDisplay = 'global'
        } else {
          Materialize.toast('Something went wrong...are you online?', 4000)
        }
      })
    },
    deleteResource (uid) {
      this.$http.delete('/api/auth/resource/' + uid + '/full').then(response => {
        if (response.body) {
          Materialize.toast('deleted resource', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    trimNumber (num, digits) { // from http://stackoverflow.com/a/9462382/2061741 - displays number of views
      if (num && digits && typeof (num) === 'number') {
        var si = [{ value: 1E18, symbol: 'E' }, { value: 1E15, symbol: 'P' }, { value: 1E12, symbol: 'T' }, { value: 1E9, symbol: 'G' }, { value: 1E6, symbol: 'M' }, { value: 1E3, symbol: 'k' }]
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/
        var i
        for (i = 0; i < si.length; i++) {
          if (num >= si[i].value) {
            return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
          }
        }
        return num.toFixed(digits).replace(rx, '$1')
      }
    }
  },
  mounted () {
    this.ratingDisplay = 'global'
  },
  watch: {
    ratingDisplay (val) {
      if (val === 'global') {
        this.re.globalVote && this.re.globalVote.quality !== null ? this.displayQuality = this.re.globalVote.quality : this.displayQuality = 0
        this.re.globalVote && this.re.globalVote.complexity !== null ? this.displayComplexity = this.re.globalVote.complexity : this.displayComplexity = 0
      } else {
        this.re.memberVote && this.re.memberVote.quality !== null ? this.displayQuality = this.re.memberVote.quality : this.displayQuality = 0
        this.re.memberVote && this.re.memberVote.complexity !== null ? this.displayComplexity = this.re.memberVote.complexity : this.displayComplexity = 0
      }
    }
  },
  filters: {
    strr (val) {
      if (val === null) return 'n/a'
      return val.toString().substring(0, 4)
    },
    numm (val) {
      if (val === null) return 0
      return val
    }
  }
}
</script>

<style>
.voteView {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.resource a {color:black}
.list span {
  font-size: 15px;
}
.list {
    padding: .5% 1% 1% 2%;
    width: 94%;
    margin-left: 3%;
    min-height: 40px;
    font-size: 20px;
    display: flex;
    justify-content: flex-start;
    flex-flow: row wrap;
    align-items: center;
    max-width: 100vw;
}
.card {
		box-shadow: none!important;
    margin: 5px!important;
    padding: 0px!important;
}
.card .card-image {
  max-height: 400px!important;
  overflow: hidden!important;
}
.card-bottom {
    margin: -11px!important;
}
.card-bottom i {
    vertical-align: middle!important;
    margin-bottom: 3px!important;
    padding-left: 3px!important;
    padding-right: 3px!important;
}
.card .card-content {
    padding-bottom: 3px!important;
    padding-top: 14px!important;
}
.card .card-action {
		border-top: none!important;
}
.list .rText {
  font-size: 18px;
}
.title {
    font-size: 18px;
    font-weight: bold;
    line-height: .1;
}
.mb{
  margin-bottom: 12px;
}
.subtitle {
  font-size:14px;
}
.rText{
  font-size: 20px;
  font-weight: 300;
  padding:20px;
}
.rating{
  opacity: .4;
  transition: opacity .5s;
}
.rating:hover{
  opacity: 1;
}
.rating.selected {
  opacity: 1;
}
.voteHalf {
  width: 50%;
  margin-left: auto;
}
.titleText {
  max-width: calc(50% - 110px)
}
  /* iPads (portrait and landscape) ----------- */
@media only screen
and (min-width : 768px)
and (max-width : 1024px) {
  .card{
    width: calc(25% - 10px)!important;
  }
  .list {
    margin-left: 0;
    width: 100%;
  }
}
/* Desktops and laptops ----------- */
@media only screen
and (min-width : 1224px) {
  .card{
    width: calc(20% - 10px)!important;
  }
}
_:-moz-tree-row(hover), .card {
    width: calc(20% - 15px)!important;
}
@media only screen
and (max-width : 375px) {
  .card{
    width: calc(100% - 10px)!important;
  }
  .voteHalf {
    width: 100%;
    display: block;
    float: right;
  }
  .list {
    margin-left: 0;
    width: 100%;
  }
  .titleText {
    max-width: calc(100% - 110px);
  }
}
/* Smartphones (landscape) ----------- */
@media only screen
and (min-width : 376px)
and (max-width : 767px) {
  .card{
    width: calc(50% - 10px)!important;
  }
  .voteHalf {
    width: 100%;
    display: block;
  }
  .list {
    margin-left: 0;
    width: 100%;
  }
  .titleText {
    max-width: calc(100% - 110px);
  }
}

</style>
