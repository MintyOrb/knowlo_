<template>
  <div @click="selected" class='resource'

		:class="{
    'list z-depth-1 hoverable': display === 'list',
    'card z-depth-1 hoverable': display === 'card'}"
		>
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
		</div>
		<router-link @click='selected' v-if="re.resource.text && re.resource.text.length > 0 && display =='thumb'" :to="{ name: 'resource', params: { uid: re.resource.uid }}">
			<div class="margin20 hoverable thumb">
				{{re.resource.text.substring(0,5)}}...
			</div>
		</router-link>

		<div v-if="re.resource.title && display =='card' || display =='list'"
			:class="{
      'truncate inline tmargin': display === 'list',
      'card-content': display === 'card'}"
			>
			<router-link @click='selected' :to="{ name: 'resource', params: { uid: re.resource.uid }}">
				<span :class="{'title': display === 'card'}">{{re.resource.title}}</span>
			</router-link>

			<div class='subtitle' v-if="re.resource.subtitle">
				{{re.resource.subtitle}}
			</div>
		</div>
		<div class="rText" v-if="re.resource.text && display !='thumb'">
			<router-link @click='selected' :to="{ name: 'resource', params: { uid: re.resource.uid }}">
				{{re.resource.text}}
			</router-link>
		</div>

		<div v-if="voting & display !='thumb'" class="margin20" >
			<div class="">
				<i  @click="ratingDisplay='global'" @mouseenter="ratingDisplay='global'" class="fa fa-lg fa-globe rating" :class="{'selected': ratingDisplay==='global'}"></i>
				<i  @click="ratingDisplay='member'" @mouseenter="ratingDisplay='member'" class="fa fa-lg fa-user rating" :class="{'selected': ratingDisplay==='member'}"></i>
			</div>
			<span>
				<span style="font-weight:300" >Quality</span><span v-if="displayQuality" style="font-weight:300" class='right'>{{displayQuality.toFixed(2).replace(/^0+/, '')}}</span>
				<div style="margin-top:5px;margin-bottom:5px" :id="'quality-slider-'+_uid"></div>
				<!-- <span style="font-weight:300" >4.1</span> -->
			</span>
			<span>
				<span style="font-weight:300" >Complexity</span><span v-if="displayComplexity" style="font-weight:300" class='right'>{{displayComplexity.toFixed(2).replace(/^0+/, '')}}</span>
				<div style="margin-top:5px;margin-bottom:5px" :id="'complexity-slider-'+_uid"></div>
			</span>
		</div>

		<div v-if="display === 'card' " class='card-action'>
 			<span class='left card-bottom'><i class="tiny material-icons">visibility</i>{{trimNumber(re.resource.viewCount,1) || 0}}</span>

 			<span class='right card-bottom'>{{re.votes}}
				<img style='width:15px; position:inherit; margin-bottom:-2px' src="data:image/png;base64,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"  />
			</span>
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
import noUiSlider from 'nouislider'
import Materialize from 'materialize-css'
import $ from 'jquery'

export default {
  name: 'resource',
  props: {
    re: Object,
    voting: {
      type: Boolean,
      default: true
    },
    display: String
  },
  data: () => {
    return {
      displayQuality: null,
      displayComplexity: null,
      ratingDisplay: 'global'
    }
  },
  methods: {
    selected () {
      this.$emit('selected')
    },
    vote () {
      this.$http.put('/api/resource/' + this.re.resource.uid + '/vote', {vote: this.re.memberVote}).then(response => {
        if (response.body) {
          Materialize.toast('voted!', 2000)
          this.re.globalVote = response.body.globalVote
          this.re.votes = response.body.votes
          this.$emit('vote-cast')
          this.setRatingSliders('member')
          this.ratingDisplay = 'member'
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        if (response.status === 401) {
          Materialize.toast('You must be logged in to vote!', 4000)
          $('#login-modal').modal('open')
          this.setRatingSliders('global')
        } else {
          Materialize.toast('Something went wrong...are you online?', 4000)
        }
      })
    },
    deleteResource (uid) {
      this.$http.delete('/api/resource/' + uid + '/full').then(response => {
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
      } else if (this.voting && typeof (num) !== 'number') {
        console.log('not number... ', typeof (num))
        console.log(num)
      }
    },
    initSlider () {
      if (this.voting) {
        console.log('voting is true')
        var quality = document.getElementById('quality-slider-' + this._uid)
        noUiSlider.create(quality, {
          start: 0.5,
          connect: [true, false],
          behavior: 'tap-drag-hover',
          range: {
            'min': 0,
            'max': 1
          }
        })
        quality.noUiSlider.on('change', (a, b, value) => { // listen for vote
          if (this.re.memberVote && this.re.memberVote.quality !== value[0]) {
            this.re.memberVote.quality = value[0]
            this.vote()
          } else if (!this.re.memberVote) { // prevents vote trigger on resource init
            this.re.memberVote = {}
            this.vote()
          }
        })

        var complexity = document.getElementById('complexity-slider-' + this._uid)
        noUiSlider.create(complexity, {
          start: 0.5,
          connect: [true, false],
          behavior: 'tap-drag-hover',
          range: {
            'min': 0,
            'max': 1
          }
        })
        complexity.noUiSlider.on('change', (a, b, value) => {
          if (this.re.memberVote && this.re.memberVote.complexity !== value[0]) {
            this.re.memberVote.complexity = value[0]
            this.vote()
          } else if (!this.re.memberVote) {
            this.re.memberVote = {}
            this.vote()
          }
        })
      }
    },
    setRatingSliders (disp) {
      if (disp === 'global' && this.re.globalVote && this.voting && this.re.globalVote.quality) {
        this.$nextTick(x => {
          var quality = document.getElementById('quality-slider-' + this._uid)
          quality.noUiSlider.set(this.re.globalVote.quality)
          var complexity = document.getElementById('complexity-slider-' + this._uid)
          complexity.noUiSlider.set(this.re.globalVote.complexity)
        })
        this.displayQuality = this.re.globalVote.quality
        this.displayComplexity = this.re.globalVote.complexity
      } else if (this.re.memberVote) {
        this.$nextTick(x => {
          if (document.getElementById('quality-slider-' + this._uid)) { // TODO: figure out why element is sometimes not found when switching display types? Race condition?
            var quality = document.getElementById('quality-slider-' + this._uid)
            quality.noUiSlider.set(this.re.memberVote.quality)
            var complexity = document.getElementById('complexity-slider-' + this._uid)
            complexity.noUiSlider.set(this.re.memberVote.complexity)
          }
        })
        this.displayQuality = this.re.memberVote.quality
        this.displayComplexity = this.re.memberVote.complexity
      } else {
        this.ratingDisplay = 'global'
      }
    }
  },
  mounted () {
    this.initSlider()
    this.$on('dataupdated', x => {
      this.setRatingSliders('member')
    })
    this.setRatingSliders('global')
  },
  watch: {
    re (x, b) {
      console.log('data updated')
      this.$emit('dataupdated')
    },
    ratingDisplay (val) {
      this.setRatingSliders(val)
    }
  }
}
</script>

<style>
.resource a {color:black}
.list span {
  font-size: 15px;
}
.list {
    padding: 1% 1% 0% 2%;
    width: 94%;
    margin-left: 3%;
    min-height: 40px;
    font-size: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    max-width: 100vw;
}
.card {
    width: 20%;
    padding: 15px;
		box-shadow: none;
}
.card-bottom {
    margin: -11px;
}
.card-bottom i {
    vertical-align: middle;
    margin-bottom: 3px;
    padding-left: 3px;
    padding-right: 3px;
}
.card .card-content {
    padding-bottom: 3px;
    padding-top: 14px;
}
.card .card-action {
		border-top: none
}
.list .rText {
  font-size: 14px;
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
.card {
  margin: 5px;
  padding: 0px;
}
  /* iPads (portrait and landscape) ----------- */
@media only screen
and (min-width : 768px)
and (max-width : 1024px) {
  .card{
    width: calc(25% - 10px);
  }
}
/* Desktops and laptops ----------- */
@media only screen
and (min-width : 1224px) {
  .card{
    width: calc(20% - 10px);
  }
}
_:-moz-tree-row(hover), .card {
    width: calc(20% - 15px);
}
@media only screen
and (max-width : 375px) {
  .card{
    width: calc(100% - 10px);
  }
}
/* Smartphones (landscape) ----------- */
@media only screen
and (min-width : 376px)
and (max-width : 767px) {
  .card{
    width: calc(50% - 10px);
  }
}

</style>
