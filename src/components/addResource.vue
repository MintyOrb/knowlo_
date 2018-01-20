<template :tag-query='tagQuery' :member='member'>
  <div id='addResourceModal' class='modal modal-fixed-footer'>
    <div class="addMeta modal-content">
      <flickity v-if="loaded" :options='flickNav' class="addNav">
        <div>
          <span>{{type}}</span>
        </div>
        <div v-if="type==='discussion' || type==='resource' " class="navItems">
          <span>Tag</span>
        </div>
      </flickity>


      <!-- isotope contianers -->
      <flickity v-if="loaded" :options='flickBody' class="addSections">
        <div class="addContainer">
          <form :class="{bigtop:type==='resource'}">

            <div class="row" v-if="type==='resource'">
              <div class="input-field col s12">
                <input v-model="resource.core.url" id="url" type="url" class="validate">
                <label for="url">URL</label>
              </div>
            </div>

            <div class="row" v-if="type==='icon'">
              <div class="input-field col s12">
                <input v-model="resource.core.mThumb" id="url" type="url" class="validate">
                <label for="url">URL</label>
              </div>
            </div>

      <div v-if="type==='resource'" class="row">
      <div class="input-field col s12">
      <input v-model="resource.detail.title" id="title" type="text" class="validate">
      <label for="title">Title</label>
      </div>
      </div>

      <div v-if="type==='resource'" class="row">
      <div class="input-field col s12">
      <input v-model="resource.detail.subtitle" id="subtitle" type="text" class="validate">
      <label for="subtitle">Subtitle</label>
      </div>
      </div>

      <div v-if="type==='discussion' || type==='definition'|| type==='resource'" class="row">
      <div class="input-field col s12">
      <textarea v-model="resource.detail.text" id="text" class="materialize-textarea"></textarea>
      <label for="value">Text</label>
      </div>
      </div>

      <div v-if="type==='resource'" class="row">
      <div class="input-field col s12">
      <textarea v-model="resource.detail.source" id="source" class="materialize-textarea"></textarea>
      <label for="source">Source</label>
      </div>
      </div>

      <div v-if="type==='resource'" class="row">
      <div class="input-field col s12">
      <textarea v-model="resource.detail.description" id="description" class="materialize-textarea"></textarea>
      <label for="description">Description</label>
      </div>
      </div>

      </form>
      <div class='btn blue' @click.once="upsertResource()">
      add {{type}}
      </div>

      </div>

      <div v-if="type==='discussion' || type==='resource'" class="addContainer">
        <search exclude="" input-id="tagNewResources" v-on:select="addTag"></search>
        <div v-if='type==="discussion"'>
          <div class='disSwitch center'>
   					 <div class="switch">
   						 <label>
   							 Insight
   							 <input type="checkbox" value="insight" v-model="discussionFilter">
   							 <span class="lever"></span>
   						 </label>
   					 </div>
   					 <div class="switch">
   						 <label>
   							 Question
   							 <input type="checkbox" value="question" v-model="discussionFilter">
   							 <span class="lever"></span>
   						 </label>
   					 </div>
   					 <div class="switch">
   						 <label>
   							 Criticism
   							 <input type="checkbox" value="criticism" v-model="discussionFilter">
   							 <span class="lever"></span>
   						 </label>
   					 </div>
             <div class="switch">
   						 <label>
   							 Quote
   							 <input type="checkbox" value="quote" v-model="discussionFilter">
   							 <span class="lever"></span>
   						 </label>
   					 </div>
   				 </div>
        </div>
        <isotope ref='tagged' :list="tags" :options='{}'>
          <div v-for="tag in tags" :key="tag.setID">
            <tag :tag="tag"
            :display="'thumb'"
            :key="tag.setID"
            hide="lens include focus info pin"
            v-on:remove="removeTag(tag.setID)">
            </tag>
          </div>
        </isotope>
      </div>
      <!--  here the user provides the url of the resource , or, eventually the file to be uploaded or the text -->
      </flickity>
    </div>
    <div class="modal-footer">
      <a @click="closeModal" class="waves-effect waves-blue btn-flat ">close</a>
    <!-- <a @click.once="upsertResource()" :class="{disabled: }" class="modal-action modal-close waves-effect waves-blue btn-flat">save</a> -->
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import Materialize from 'materialize-css'
import Flickity from 'vue-flickity'
import isotope from 'vueisotope'
import search from '@/components/search'
import tag from '@/components/tag'

export default {
  name: 'addResource',
  components: { Flickity, search, isotope, tag },
  props: {
    member: Object,
    type: {
      type: String,
      default: 'resource'
    }
  },
  data () {
    return {
      loaded: false, // need to wait for model to open before initting flickity
      synSetMeta: false, // tag resource to set
      resouceMeta: false, // tag resource to resource
      flickRegistry: [],
      flickNav: {
        pageDots: true,
        prevNextButtons: false,
        accessibility: false // to prevent jumping when focused
      },
      flickBody: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      },
      discussionFilter: [],
      dIDs: { // setIDS for adding by switch
        'insight': 'rJxPWooTO-',
        'question': 'B1pnQsYW-',
        'quote': 'BkF3xoFW-',
        'criticism': 'rJxYeYW43b'
      },
      tags: [],
      resource: {
        core: {
          // 'uid': '', // set on server
          // 'viewCount':0, // set on server
          // 'viewTime': '', // seconds?
          // 'dateAdded': '', // set on server
          // 'thumb': '', // set on server
          'url': '', // just return english if not in language specified?
          'source': '',
          'mThumb': ''
        },
        detail: {
          'title': '',
          'subtitle': '',
          'text': '',
          'description': '',
          'url': ''
        }
      }
    }
  },
  methods: {
    open () {
      let comp = this
      $('#addResourceModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: 0.5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        ready (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          $('.fullPage').css('overflow', 'hidden')
          comp.loaded = true
        },
        complete: () => {
          $('.fullPage').css('overflow', 'auto')

          this.$emit('close')
        }
      }).modal('open')
    },
    closeModal () {
      $('#addResourceModal').modal('close')
    },
    tagToResource () { // connect to the currently viewed resource
      if (this.resource.core.uid.length > 0) {
        this.$http.put('/api/auth/resource/' + this.$route.params.uid + '/discussion/' + this.resource.core.uid).then(response => {
          if (response.body) {
            console.log('tagged to resource')
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online and logged in?', 4000)
        })
      } else {
        Materialize.toast('Add a resource before taggging!', 4000)
      }
    },
    tagToSet () { // connect to the currently viewed synSet
      if (this.resource.core.uid.length > 0) {
        this.$http.put('/api/auth/set/' + this.$route.params.uid + '/meta/' + this.resource.core.uid, {type: this.type}).then(response => {
          if (response.body) {
            console.log('tagged to set')
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online and logged in?', 4000)
        })
      } else {
        Materialize.toast('Add a resource before taggging!', 4000)
      }
    },
    addTag (tag) { // add tag(s) to the newly created resource
      console.log('in add tag ', tag)
      if (this.resource.core.uid.length > 0) {
        this.$http.put('/api/auth/resource/' + this.resource.core.uid + '/set/' + tag.setID).then(response => {
          if (response.body) {
            console.log(response.body)
            this.tags.push(response.body)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online and logged in?', 4000)
        })
      } else {
        Materialize.toast('Add a resource before tagging!', 4000)
      }
    },
    removeTag (uid) {
      // TODO: revert discussion filter switch if discussion set removed by exclude
      this.$http.delete('/api/auth/resource/' + this.resource.core.uid + '/set/' + uid).then(response => {
        if (response.body) {
          this.tags.splice(this.tags.findIndex((tag) => tag.setID === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online and logged in?', 4000)
      })
    },
    getSuggestedTags () { // find tags in text and tag to resource
      var textBlob = ''
      textBlob = textBlob.concat( // single string to consider
        ' ' + this.resource.detail.title,
        ' ' + this.resource.detail.subtitle,
        ' ' + this.resource.detail.text,
        ' ' + this.resource.detail.description
      )
      // find and tag to resource
      this.$http.put('/api/auth/resource/' + this.resource.core.uid + '/tagSuggest', {text: textBlob}).then(response => {
        if (response.body) {
          this.tags = response.body
          // for each this.tags.push(tag) push to tags?
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online and logged in?', 4000)
      })
    },
    close () {
      console.log('close here after esc')
    },
    checkURL () {
      // parse youtube/vimeo/other....set display type?....settime to view...
    },
    upsertResource () {
      this.$http.post('/api/auth/resource', {resource: this.resource}).then(response => {
        if (response.body) {
          this.resource.core = response.body

          var holder = { // need to format like resource to push to display
            memberVote: {
              qualtiy: null,
              complexity: null
            },
            globalVote: {
              qualtiy: null,
              complexity: null
            },
            votes: 0
          }

          if (this.resourceMeta) {
            this.tagToResource()
          } else if (this.synSetMeta) {
            this.tagToSet()
            $('#addResourceModal').modal('close')
          }

          holder.resource = this.resource.core
          for (var pindex in this.resource.detail) {
            holder.resource[pindex] = this.resource.detail[pindex]
          }
          this.$emit('added', holder)
          if (!this.synSetMeta) {
            this.getSuggestedTags()
            // $('.addSections').flickity('selectCell', 1, true, false) //  value, isWrapped, isInstant
          }
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    }
  },
  mounted () {
    if (this.$route.name === 'resource') { // take in as param?
      this.resourceMeta = true
      $('#addResourceModal').css('position', 'sticky')
    } else if (this.$route.name === 'tag') {
      this.synSetMeta = true
    } // else connect to neither (standalone resource)
    this.open()
    $('.modal-overlay').eq(1).appendTo('.resourceModal') // workaround for stacking context
    $('.modal-overlay').eq(1).appendTo('#tagModal') // workaround for stacking context
  },
  beforeRouteLeave (to, from, next) {
    if ($('#addResourceModal')) {
      window.setTimeout(() => {
        next()
      }, 375)
      document.removeEventListener('keydown', function () {})
    }
  },
  watch: {
    discussionFilter (now, before) {
      for (var nIndex in now) { // there's probably a clever way of combining these things more elegantly...
        if (!before.includes(now[nIndex])) {
          this.addTag({ setID: this.dIDs[now[nIndex]] })
        }
      }
      for (var bIndex in before) {
        if (!now.includes(before[bIndex])) {
          this.removeTag(this.dIDs[before[bIndex]])
        }
      }
    }
  }
}
</script>

<style>
.addSections {
  height: 100%;
}
.addNav{
  position: fixed;
  top: 0;
  width: 100%;
  padding: 10px;
  z-index: 1002;
  background: #fafafa;
  font-size: 30px;
}
.addContainer {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: scroll;
  top: 50px;
  padding-top: 20px;
  padding-bottom: 100px;
  padding-left: 10px;
  padding-right: 10px;
}

.bigtop {
  margin-top: 50vh
}
#addResourceModal{
  border-radius: 6px;
  /*position: absolute!important;*/
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    #addResourceModal{
      border-radius: 0px!important;
    }
  }
  .navItems {
    margin-left: 20px;
    margin-right: 20px;
  }
</style>
