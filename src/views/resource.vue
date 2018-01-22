<template :member="member" >
<div style="opacity:0" :id="'resourceModal'+resource.uid" class="modal fullPage resourceModal">
  <span class="exit hide-on-med-and-down modal-close"><i class="fa fa-3x fa-times"></i></span>

  <!-- modal for adding to discussion -->
  <add-resource v-if='addResource===true' :type="addResourceType" v-on:close="addResource=false" v-on:added="addCreatedDiscussion">
  </add-resource>


  <!-- the resource -->
  <div class="resource-container">

    <!-- image -->
    <div v-if='resource.displayType=="image"'>
      <div id="image-map"></div>
    </div>

    <!--  youtube/vimeo -->
    <div v-if='resource.displayType=="embed"' class="vid-container-container">
      <div class="video-container ">
        <iframe :src="'http://youtube.com/embed/'+resource.ytID"></iframe>
      </div>
    </div>

    <!-- website -->
    <div v-if='resource.displayType=="webpage"' class="web-container">
      <iframe :src="resource.url"></iframe>
    </div>

    <!-- video -->
    <div v-if='resource.displayType=="video"' class="vid-container-container">
      <div class="video-container ">
        <iframe :src="resource.url"></iframe>
      </div>
    </div>

    <!-- imgur image/gallery -->
    <!-- <blockquote class="imgur-embed-pub" lang="en" data-id="a/Y26eX"><a href="//imgur.com/Y26eX">Eyes</a></blockquote>
			<script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script> -->


    <!-- text -->
    <div v-if='resource.displayType=="text"' class="text-container">
      <span class="center">{{resource.text}}</span>
    </div>

    <!-- set icon -->
    <div v-if='resource.displayType=="icon"' class="text-container">
      <img class='circle' style='height:60px;width:60px' :src="resource.mThumb">
    </div>

  </div>

  <div class="resourceMeta">
    <!-- <div class="metaNav"> -->
    <div class="metaNav" >
      <!-- <i @click="toggleFullScreen()" class="material-icons left">fullscreen</i> -->
      <q-tabs>
        <q-tab @click="selectSection(i)" v-for="step, i in resourceSection" :key="i" slot="title" :label="step" />
      </q-tabs>
    </div>
    <!-- </div> -->
    <flickity ref='flickBody' :options="flickBody" class="resourceSections">
      <!-- discussion -->
      <div class="resourceStep discussion">
        <div class="center margin20">
          <span class="left" style="margin-right:15px"><i class="material-icons ">remove_red_eye</i></span>
          <span class="viewBtn" @click="changeDisplay('list')"><i class="material-icons">view_list</i></span>
          <span class="viewBtn" @click="changeDisplay('card')"><i class="material-icons">dashboard</i></span>
          <span class='right'>
						 <a class="dropdown-button viewBtn" data-activates='disOrder' data-hover="true" data-alignment='right'><i class="material-icons ">sort</i></a>
						 <ul id='disOrder' class='dropdown-content sort'>
							<li class=''><a>quality</a></li>
 							<li class=''><a>complexity</a></li>
 							<li class='disabled'><a>date added</a></li>
 							<!-- <li class='disabled'><a>time to view</a></li> -->
 							<li class='disabled'><a># of votes</a></li>
 							<li class='disabled'><a># of views</a></li>
 							<li class='disabled'><a># responses</a></li>
						 </ul>
					 </span>
          <br/>
        </div>
        <div class='disSwitch center'>
          <div class="switch">
            <label>
							 <input type="checkbox" value="insight" v-model="discussionFilter">
							 <span class="lever"></span>
							 Insight
						 </label>
          </div>
          <div class="switch">
            <label>
							 <input type="checkbox" value="question" v-model="discussionFilter">
							 <span class="lever"></span>
							 Question
						 </label>
          </div>
          <div class="switch">
            <label>
							 <input type="checkbox" value="criticism" v-model="discussionFilter">
							 <span class="lever"></span>
							 Criticism
						 </label>
          </div>
          <div class="switch">
            <label>
							 <input type="checkbox" value="quote" v-model="discussionFilter">
							 <span class="lever"></span>
							 Quote
						 </label>
          </div>
        </div>
        <div class='message well' v-if="discussion.length===0">
          <div style='margin-bottom:40px;'>
            Nothing yet! Be the first to add your thoughts...
          </div>
          <q-btn color='primary' round @click="addResourceType='discussion'; addResource = true;">
            <q-icon name="add" />
          </q-btn>
        </div>
        <isotope v-else ref="discussionBin" :list="discussion" :options='discussionIsotope()' id="container">
          <resource :key="re.resource.uid" v-for="re in discussion" :re="re" :class="{'fullWidth': discussionDisplay=='list'}" :display="discussionDisplay">
          </resource>
        </isotope>

      </div>
      <!-- Description -->
      <div class="resourceStep cont-medium">
        <div v-if="resource.source">
          <h5>Source</h5>
          <a :href='resource.source' target="_blank">{{resource.source}}</a>
        </div>
        <div v-if="resource.description">
          <h5>Description</h5>
          {{resource.description}}
        </div>
      </div>
      <!-- tags -->
      <div class="resourceStep cont-medium">
        <isotope ref='rTagBin' :list="tags" :options='{}'>
          <tag v-for="tag in tags"
          :key="tag.tag.uid"
          :tag="tag"
          display="list"
          v-on:include="addToQuery(tag)"
          v-on:remove="removeTag(tag.setID)"
          v-on:focus="addToQuery(tag)"
          v-on:pin="addToQuery(tag)">
          </tag>
        </isotope>
        <search exclude="" input-id="resourceTest" v-on:select="addTag"></search>
      </div>
      <!-- related -->
      <div class="resourceStep discussion">
        <div class='center'>
          <span class="viewBtn" @click.stop.prevent="relatedDisplay='list'"><i class="material-icons">view_list</i></span>
          <span class="viewBtn" @click.stop.prevent="relatedDisplay='card'"><i class="material-icons">dashboard</i></span>
          <span class="viewBtn" @click.stop.prevent="relatedDisplay='thumb'"><i class="material-icons">dialpad</i></span>
        </div>
        <isotope ref='relatedBin' :list="related" :options='{}'>
          <resource
          v-for="re in related"
          v-on:selected="toTop"
          v-on:changedDisplay="layout"
          :re="re"
          :key="re.resource.uid"
          :display="relatedDisplay"
          >
          </resource>
        </isotope>
      </div>
    </flickity>
    <div class="addBtn">
      <a @click="addResourceType='discussion'; addResource = true;" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
    </div>
  </div>
</div>
</template>

<script>
import Materialize from 'materialize-css'
import $ from 'jquery'
import addResource from '@/components/addResource'
import tag from '@/components/tag'
import resource from '@/components/resource'
import search from '@/components/search'
import isotope from 'vueisotope'
import Flickity from 'vue-flickity'
import L from 'leaflet'
import {BackToTop, scroll, AppFullscreen, QTabs, QTab, QBtn, QIcon} from 'quasar'
const { setScrollPosition } = scroll

export default {
  props: ['member'],
  name: 'resourcev',
  components: { isotope, search, tag, resource, Flickity, addResource, QTabs, QTab, QBtn, QIcon },
  directives: {BackToTop},
  data: function () {
    return {
      resource: {
        uid: undefined
      },
      flickBody: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        selectedAttraction: 0.2,
        friction: 0.8,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      },
      tags: [], // current resources tags
      discussion: [], // resources within discussion
      related: [], // resources related to current resource
      relatedDisplay: 'card', // display type for related resources
      discussionDisplay: 'card', // default display for discussion
      resourceSection: ['Discussion', 'Detail', 'Tags', 'Related'],
      addResource: false,
      addResourceType: '',
      modalOpen: false,
      discussionFilter: ['insight', 'question', 'criticism', 'quote'], // which types of discussions should be displayed
      tempIntervalID: '', // ID for layout() set interval (fix layout if images are loaded)
      filterIDs: { // setIDS for filtering by switch
        'insight': 'rJxPWooTO-',
        'question': 'B1pnQsYW-',
        'quote': 'BkF3xoFW-',
        'criticism': 'rJxYeYW43b'
      }
    }
  },
  methods: {
    toggleFullScreen () {
      AppFullscreen.toggle()
    },
    toTop () {
      setScrollPosition(document.getElementsByClassName('fullPage')[0], 0, 200)
    },
    close: function () {
      $('#resourceModal' + this.resource.uid).modal('close')
    },
    selectSection (index) {
      this.$refs.flickBody.select(index)
    },
    changeDisplay: function (disp) {
      this.discussionDisplay = disp
      // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
      this.$nextTick(function () {
        window.setTimeout(() => {
          this.layout()
        }, 375)
      })
    },
    fetchResource: function () {
      this.$http.get('/api/resource/' + this.$route.params.uid + '/full', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.resource) {
          this.resource = response.body.resource
          this.tags = response.body.tags
          this.determineResourceDisplay()
        } else {
          Materialize.toast('Resource not found.', 4000)
        }
        this.init()
      }, response => {
        this.init()
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    determineResourceDisplay: function () {
      if (this.resource.url) {
        if (this.resource.url.match(/[^/]+(jpg|png|gif|jpeg)$/)) {
          this.resource.displayType = 'image'
        } else if (this.resource.url.match(/[^/]+(gifv|webm|mp4)$/)) {
          this.resource.displayType = 'video'
        } else if (this.resource.url.indexOf('youtube') > -1) {
          this.resource.ytID = new URL(this.resource.url).searchParams.get('v')
          this.resource.displayType = 'embed'
        }
      } else if (this.resource.hasOwnProperty('null')) { // not sure why it has the null prop to begin with...
        this.resource.displayType = 'icon'
      } else {
        this.resource.displayType = 'text'
      }
    },
    init: function () {
      this.fetchDiscussion()
      this.fetchRelated() // TODO: only fetch when on related panel
      this.$nextTick(function () {
        if (!this.modalOpen) {
          this.modalOpen = true
          $('#resourceModal' + this.resource.uid).modal({
            opacity: 0.5, // Opacity of modal background
            inDuration: 300, // Transition in duration
            outDuration: 200, // Transition out duration
            startingTop: '4%', // Starting top style attribute
            endingTop: '10%', // Ending top style attribute
            ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $('body').css('overflow', 'hidden')
            },
            complete: () => {
              this.$router.push('/')
            }
          }).modal('open')
        }
        if (this.resource.displayType === 'image') {
          this.initImage()
        }
      })
    },
    fetchDiscussion: function () {
      this.discussion = []
      this.$http.get('/api/resource/' + this.$route.params.uid + '/discussion', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.discussion = response.body
        }
      }, response => {
        // Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addCreatedDiscussion: function (dis) {
      this.discussion.push(dis)
    },
    layout: function () {
      if (this.discussion.length > 0) {
        this.$refs.discussionBin.layout('masonry')
      }
      this.$refs.relatedBin.layout('masonry')
      this.$refs.rTagBin.layout('masonry')
    },
    fetchRelated: function () {
      this.$nextTick(() => {
        this.$http.get('/api/resource/' + this.$route.params.uid + '/related', {
          params: {
            languageCode: 'en'
          }
        }).then(response => {
          this.related = response.body
          window.setTimeout(() => {
            this.layout()
          }, 250)
        }, response => {
          // Materialize.toast('Something went wrong...are you online?', 4000)
        })
      })
    },
    addTag: function (set) {
      this.$http.put('/api/auth/resource/' + this.resource.uid + '/set/' + set.setID).then(response => {
        if (response.body) {
          Materialize.toast('tag added', 4000)
          this.tags.push(set)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeTag: function (setUID) {
      this.$http.delete('/api/auth/resource/' + this.resource.uid + '/set/' + setUID).then(response => {
        if (response.body) {
          Materialize.toast('tag removed.', 4000)
          this.tags.splice(this.tags.findIndex((set) => set.setID === setUID), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addToQuery: function (item) {
      this.$emit('add', item)
      this.close()
    },
    discussionIsotope: function () {
      return {
        getFilterData: {
          'type': el => {
            var setIDs = [] // ids of filter sets
            // with name of sets, get ids from object with names and ides
            for (var nameIndex in this.discussionFilter) {
              if (this.filterIDs[this.discussionFilter[nameIndex]]) {
                setIDs.push(this.filterIDs[this.discussionFilter[nameIndex]])
              }
            }
            return el.setIDs.some(x => {
              return setIDs.includes(x)
            })
          }
        }
      }
    },
    initImage: function () {
      var map = window.map
      // from http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html
      if (map) { // remove previous map, if any (necessary for transistion from one image resource to another)
        map.remove()
      }
      window.map = L.map('image-map', {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 2,
        crs: L.CRS.Simple
      })
      map = window.map

      // dimensions of the image
      var w = 2000
      var h = 1500
      var url = this.resource.url
      var img = new Image()
      img.onload = function () {
        if (typeof map !== 'undefined') {
          map.removeLayer(preLoad)
          var southWest = map.unproject([0, this.height], map.getMaxZoom() - 1)
          var northEast = map.unproject([this.width, 0], map.getMaxZoom() - 1)
          var bounds = new L.LatLngBounds(southWest, northEast)
          // add the image overlay,
          // so that it covers the entire map
          L.imageOverlay(url, bounds).addTo(map)
          map.setMaxBounds(bounds)
        }
      }
      img.src = url
      // calculate the edges of the image, in coordinate space
      var southWest = map.unproject([0, h], map.getMaxZoom() - 1)
      var northEast = map.unproject([w, 0], map.getMaxZoom() - 1)
      var bounds = new L.LatLngBounds(southWest, northEast)
      // add the image overlay,
      // so that it covers the entire map
      var preLoad = L.imageOverlay(url, bounds).addTo(map)

      // tell leaflet that the map is exactly as big as the image
      map.setMaxBounds(bounds)
    },
    markViewed: function () {
      this.$http.put('/api/auth/resource/' + this.$route.params.uid + '/viewed').then(response => {

      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    }
  },
  mounted: function () {
    this.fetchResource()
    if (this.member.uid) {
      window.setTimeout(() => {
        this.markViewed()
      }, 5000) // 5 seconds is pretty arbitrary...
    }
    // workaround as long as imagesLoaded() non-functional
    this.tempIntervalID = setInterval(x => {
      this.layout()
    }, 3000)

    $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'right', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    })
  },
  beforeRouteLeave: function (to, from, next) {
    $('body').css('overflow', 'auto')
    if ($('.modal-overlay')) {
      $('.modal-overlay').remove()
    }
    clearInterval(this.tempIntervalID)
    next()
  },
  watch: {
    '$route.params.uid': function () {
      this.fetchResource()
    },
    discussionFilter: function (a, b) {
      if (this.$refs.discussionBin) { // don't try to filter when there are no comments
        this.$refs.discussionBin.filter('type')
      }
    },
    relatedDisplay: function (a, b) {
      if (a !== b) {
        setTimeout(() => {
          this.layout()
        }, 300)
      }
    },
    'member': function (member) {
      if (member.uid) {
        this.$nextTick(() => {
          this.markViewed()
        })
      }
    }
  }
}
</script>

<style>
.resource-container {
  height: auto;
  width: 100vw;
  margin: auto;
}
.vid-container-container {
  margin:auto;
  width:80vw;
}

.resourceMeta {
  height: 100%;
  position: relative;
  width: 100vw;
}
.web-container iframe, .video-container object, .video-container embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
}
.video-container {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 30px;
    height: 0;
    overflow: hidden;
}
.video-container iframe, .video-container object, .video-container embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.resourceSections{
  height: 100%;
}
.resourceStep {
  width: 25vw;
	height: 100%;
  overflow-x: scroll;
  padding-top: 10px;
  word-wrap: break-word;
}
.resourceStep h5 {
  border-bottom: 1px solid lightgray;
  padding-bottom: 5px;
}
.disSwitch div {
  display: inline;
  margin-left: 10px;
  margin-right: 10px;
  width: 100px;
}
.disSwitch {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
}
.switch label input[type=checkbox]:checked+.lever {
    background-color: #8cc3ee!important;
}
.switch label input[type=checkbox]:checked+.lever:after {
    background-color: #2196F3!important;
}
.fullWidth{
  width: calc(100% - 60px);
}
.addBtn {
  position: absolute;
  z-index: 998;
  bottom: -5px;
  right: 10%;
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
  .vid-container-container {
    margin:auto;
    width:100vw;
  }
  .text-container{
    padding: 10px;
    font-size: 20px;
  }
}
/* Smartphones (landscape) ----------- */
@media only screen
and (min-width : 376px)
and (max-width : 767px) {
  .cont-medium {
    width: 50vw;
  }
}
.text-container{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 40px;
  font-weight: 200;
  color: white;
  padding: 30px;
}

#image-map {
  width: 100vw;
  height: 80vh;
}
.resource-container {
  background-color: black;
  width: 100vw;
  z-index: 999;
}
iframe{
  border-width: 0;
}
.flickity-viewport {
  height: 100%;
}
</style>
