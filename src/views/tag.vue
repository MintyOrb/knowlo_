<template>
<div id='tagModal' class="modal fullPage">

  <!-- modal for adding to discussion -->
  <add-resource v-if='addResource === true' :type='addResourceType' v-on:close="addResource=false" v-on:added="newMeta">
  </add-resource>

  <div class="tagTitle">
    <span v-if="tag.tag.iconURL && tag.tag.iconURL.length > 0" class=''>
					<img class='circle' :src="tag.tag.iconURL">
			</span>
    <span>
				<span>{{tag.translation.name}}</span>
    </span>

    <!-- setdelete -->
    <!-- <span v-if='true' class='btn' v-on:click="deleteSet(tag.setID)">delete set</span> -->

    <span class="right modal-close"><i class="fa fa-2x fa-times"></i></span>
  </div>
  <!-- flick navigation for isotope containers -->
  <div class="tagMeta">
    <div class="metaNav tagNav">
      <q-tabs>
        <q-tab @click="selectSection(i)" v-for="step, i in tagSection" :key="i" slot="title" :label="step" />
      </q-tabs>
    </div>
    <!-- isotope contianers -->
    <flickity ref='flickBody' class="tagSections" :options="flickBody">

      <div class="stepContainer">
        <q-btn color='primary' round @click="addResourceType='icon'; addResource = true;">
          <q-icon name="add" />
        </q-btn>
        <div v-for="icon in icons" :key="icon['resource']['uid']">
          <resource :re="icon" :display="'list'" v-on:vote-cast='evalTopTag'>
          </resource>
        </div>
      </div>

      <div class="stepContainer definition">
        <q-btn color='primary' round @click="addResourceType='definition'; addResource = true;">
          <q-icon name="add" />
        </q-btn>
        <div v-for="def in definitions" :key="def['resource']['uid']">
          <resource :re="def" :display="'list'">
          </resource>
        </div>

      </div>

      <div class="stepContainer">
        <isotope ref='syno' :list="synonyms" :options='{}'>
          <tag v-for="tag in synonyms" :key="tag.tag.uid" :tag="tag" :display="'godMode'" v-on:include="addToQuery(tag)" v-on:exclude="removeSynonym(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
        </isotope>
        <!-- <search v-if='addSyn' :exclude="$route.params.uid" input-id="syn" v-on:select="addSynonym"></search> -->
        <!-- <search v-if='mergeSyn' :exclude="$route.params.uid" input-id="syn" v-on:select="mergeSynonym"></search> -->
      </div>
      <div class="stepContainer">
        <isotope ref='within' :list="within" :options='{}'>
          <tag :tag="tag" v-for="tag in within" :key="tag.tag.uid" :display="tagDisplay" v-on:include="addToQuery(tag)" v-on:exclude="removeWithin(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
          <!-- v-on:exclude="removeSynonym(tag.tag.uid)" -->
        </isotope>
        <search exclude="" input-id="within" v-on:select="addWithin"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='contains' :list="contains" :options='{}'>
          <tag :tag="tag" v-for="tag in contains" :display="tagDisplay" :key="tag.tag.uid" v-on:include="addToQuery(tag)" v-on:remove="removeContains(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
          <!-- v-on:exclude="removeSynonym(tag.tag.uid)" -->
        </isotope>
        <search exclude="" input-id="contains" v-on:select="addContains"></search>
      </div>
      <div class="stepContainer">
        <isotope ref='trans' :list="translations" :options='{}'>
          <tag :tag="tag" v-for="tag, i in translations" :key="i" :display="tagDisplay" v-on:include="addToQuery(tag)" v-on:exclude="addToQuery(tag)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)" hide="remove">
          </tag>
        </isotope>
      </div>
    </flickity>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import Materialize from 'materialize-css'
import isotope from 'vueisotope'
import addResource from '@/components/addResource'
import search from '@/components/search'
import resource from '@/components/resource'
import tag from '@/components/tag'
import Flickity from 'vue-flickity'
import { QTabs, QTab, QBtn, QIcon } from 'quasar'

export default {
  name: 'tagv',
  props: ['tagQuery', 'member'],
  components: { isotope, addResource, search, tag, resource, Flickity, QTabs, QTab, QBtn, QIcon },
  data: function () {
    return {
      tag: {
        name: 'default',
        translation: {
          name: ''
        },
        tag: {
          iconURL: ''
        }
      },
      tagDisplay: 'list',
      modalOpen: false,
      addResource: false,
      addResourceType: '',
      definitions: [],
      translations: [],
      synonyms: [],
      addSyn: false,
      mergeSyn: false,
      groups: [],
      within: [],
      contains: [],
      icons: [],
      flickBody: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      },
      tagSection: ['Icon', 'Definition', 'Synonyms', 'Within', 'Contains', 'Translations'] // stats? vote? member's relation? definition?
    }
  },
  methods: {
    layout () {
      this.$refs.syno.layout('masonry')
      this.$refs.within.layout('masonry')
      this.$refs.contains.layout('masonry')
      this.$refs.trans.layout('masonry')
    },
    init () {
      this.$http.get('/api/set/' + this.$route.params.uid, {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.tag) {
          response.body.tag.name = response.body.translation.name
          response.body.tag.status = {}
          this.tag = response.body
          this.tag.setID = response.body.tag.uid
          this.fetchSynonyms()
          this.fetchWithin()
          this.fetchContains()
          this.fetchTranslations()
          this.fetchMeta('definition')
          this.fetchMeta('icon')
        } else {
          Materialize.toast('Resource not found.', 4000)
        }
        if (!this.modalOpen) {
          this.openModal()
        }
        this.layout()
      }, response => {
        if (!this.modalOpen) {
          this.openModal()
        }
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    selectSection (index) {
      this.$refs.flickBody.select(index)
    },
    openModal: function () {
      this.modalOpen = true
      this.$nextTick(function () {
        $('#tagModal').modal({
          dismissible: true, // Modal can be dismissed by clicking outside of the modal
          opacity: 0.5, // Opacity of modal background
          inDuration: 300, // Transition in duration
          outDuration: 200, // Transition out duration
          startingTop: '4%', // Starting top style attribute
          endingTop: '10%', // Ending top style attribute
          ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $('body').css('overflow', 'hidden')
          },
          complete: () => {
            $('body').css('overflow', 'auto')
            this.$router.push('/')
          }
        }).modal('open')
      })
    },
    evalTopTag: function () {
      const top = this.icons.reduce(function (prev, current) {
        return (prev.globalVote.quality > current.globalVote.quality) ? prev : current
      })
      if (top.resource.mThumb !== this.tag.tag.iconURL && top.globalVote.quality !== null) {
        // triggering new top icon from the front end is probably stupid.
        this.tag.tag.iconURL = top.resource.mThumb
        this.$http.put('/api/auth/set/' + this.tag.setID + '/' + top.resource.uid + '/newTopIcon').then(response => {
          Materialize.toast('New top icon!', 4000)
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      }
    },
    newMeta: function (a, b) {
      if (this.addResourceType === 'definition') {
        this.definitions.push(a)
      } else if (this.addResourceType === 'icon') {
        this.icons.push(a)
      }
    },
    fetchMeta: function (type) {
      if (this.member.uid !== null) {
        this.$http.get('/api/auth/set/' + this.$route.params.uid + '/meta/', {
          params: {
            languageCode: 'en',
            type: type
          }
        }).then(response => {
          if (type === 'definition') {
            this.definitions = response.body
          } else if (type === 'icon') {
            this.icons = response.body
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      } else {
        this.$http.get('/api/set/' + this.$route.params.uid + '/meta/', {
          params: {
            languageCode: 'en',
            type: type
          }
        }).then(response => {
          if (type === 'definition') {
            this.definitions = response.body
          } else if (type === 'icon') {
            this.icons = response.body
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        })
      }
    },
    fetchTranslations: function () {
      this.$http.get('/api/set/' + this.$route.params.uid + '/translation/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.translations = response.body
        } else {
          Materialize.toast('Translations not found.', 4000)
          this.translations = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchSynonyms: function () {
      this.$http.get('/api/set/' + this.$route.params.uid + '/synonym/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.synonyms = response.body
        } else {
          // Materialize.toast('Synonyms not found.', 4000)
          this.synonyms = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    mergeSynonym: function (synonym) { // TODO: this merges sets...need a separate method for adding tag to set
      this.$http.put('/api/auth/set/' + this.tag.setID + '/synonym/' + synonym.setID).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.synonyms.push(synonym)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeSynonym: function (synUID) {
      this.$http.delete('/api/auth/set/' + this.tag.setID + '/synonym/' + synUID).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.synonyms.splice(this.synonyms.findIndex((tag) => tag.tag.uid === synUID), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchWithin: function () {
      this.$http.get('/api/set/' + this.tag.setID + '/within/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.within = response.body
        } else {
          this.within = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addWithin: function (within) {
      this.$http.put('/api/auth/set/' + this.tag.setID + '/within/' + within.tag.uid).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.within.push(within)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeWithin: function (uid) {
      this.$http.delete('/api/auth/set/' + this.tag.setID + '/within/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.within.splice(this.within.findIndex((tag) => tag.tag.uid === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchContains: function () {
      this.$http.get('/api/set/' + this.tag.setID + '/contains/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.contains = response.body
        } else {
          // Materialize.toast('Contains no tags.', 4000)
          this.contains = []
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addContains: function (contains) {
      this.$http.put('/api/auth/set/' + this.tag.setID + '/contains/' + contains.tag.uid).then(response => {
        if (response.body) {
          Materialize.toast('Added!', 4000)
          this.contains.push(contains)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    removeContains: function (uid) {
      this.$http.delete('/api/auth/set/' + this.tag.setID + '/contains/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Removed!', 4000)
          this.contains.splice(this.contains.findIndex((tag) => tag.tag.uid === uid), 1)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    deleteSet (uid) {
      this.$http.delete('/api/api/set/' + uid).then(response => {
        if (response.body) {
          Materialize.toast('Set deleted.', 4000)
        } else {
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addToQuery: function (item) {
      this.$emit('add', item)
      $('#tagModal').modal('close')
    }
  },
  mounted () {
    this.init()
    setTimeout(() => {
      this.layout()
    }, 1500)
    // TODO: set flickity tab in URL
    // this.$refs.body.next()
    // this.$refs.nav.next()
    // this.$refs.flickity('selectCell', 1, true, true) //  value, isWrapped, isInstant
  },
  beforeRouteLeave (to, from, next) {
    $('body').css('overflow', 'auto')
    if ($('.modal-overlay')) {
      $('.modal-overlay').remove()
    }
    window.setTimeout(() => {
      next()
    }, 375)
  },
  watch: {
    '$route.params.uid': function (id) {
      this.init()
    },
    member: function () { // re-fetch on member login/logout
      this.$nextTick(x => {
        this.fetchMeta('definition')
        this.fetchMeta('icon')
      })
    }
  }
}
</script>

<style>
.tagTitle {
  background-color: #2196F3;
  padding: 25px;
}
.tagTitle span {
  font-weight: 200;
  color:white;
  font-size: 20px;
}
.tagTitle img {
  height: 40px;
  width: 40px;
  overflow: hidden;
}
.definition{
  width:50vw;
}
.tagMeta {
  background-color: white;
}
.stepContainer {
	height: 100vh;
  width: 60vw;
  overflow: scroll;
  padding-top: 30px;
  padding-bottom: 400px;
}
/* Smartphones (portrait and landscape) ----------- */
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
  .stepContainer {
    width: 100vw;
  }
}
/* Smartphones (landscape) ----------- */
@media only screen
and (min-width : 376px)
and (max-width : 767px) {
  .stepContainer {
    width: 80vw;
  }
}
</style>
