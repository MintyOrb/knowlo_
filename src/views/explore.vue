<template>
<div style='min-height:100vh;'>
  <!-- view for tag and resource page -->
  <router-view :member='member' :tag-Query='tagQuery' v-on:add='addToQuery'></router-view>

  <!-- <router-link :to="{ name: 'addResource'}">
  				add resource
  		  </router-link> -->

  <ul class='exploreBins' data-collapsible="accordion">

    <li data-pane="search" id='search'>
      <div class="collapsible-header searchHead">

        <search exclude="" input-id="mainSearch" holder-text="Search" v-on:select="addToQuery"></search>

        <transition-group name='fade'>
          <span v-for="tag in tagQuery" @click.stop.prevent='removeTag(tag.setID)' :key="tag.setID">
  							<img v-if="tag.tag.iconURL" class='circle hoverable' style='height:40px;width:40px;margin-right:10px;padding:3px;' :src="tag.tag.iconURL" />
  							<span v-else class='circle hoverable' style='text-align:center;padding:10px;width:40px;width:40px;position:absolute;font-size;2em' >{{tag.translation.name[0]}}</span>
          </span>
        </transition-group>

        <span class='right'>
  						{{tagQuery.length}} tag<span v-if="tagQuery.length !==1">s</span> in search
        <span v-if="tagQuery.length > 0" class="clear btn white waves-light" @click.stop.prevent="$emit('clear')">
  							clear
  						</span>
        </span>
      </div>
      <div class='container collapsible-body'>
        <!-- tag query  -->
        <div class=''>
          <isotope v-if="selectedPane === 'search'" style="min-height:150px" ref="tagQuery" :list="tagQuery" :options='{}' >
            <tag v-for="tag in tagQuery" :key="tag.setID" :tag="tag" display="thumb" v-on:include="removeTag(tag.setID)" v-on:remove="removeTag(tag.setID)" v-on:focus="focus" v-on:lens="fetchContains" v-on:main="removeTag(tag.setID)">
            </tag>
          </isotope>
          <div v-if="tagQuery.length > 0" class="clear btn white waves-light" @click="$emit('clear')">
            clear
          </div>
        </div>
      </div>
    </li>
    <li data-pane="tags">
      <div class="collapsible-header"><i class="fa fa-filter"></i>Tag Directory</div>
      <div class="collapsible-body">
        <form id='tagSuggestionOptions'>
          <span>
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='size' id="size" />
                <label for="size">Size</label>
              </span>
              <span>
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='time' id="time" />
                <label for="time">Time</label>
              </span>
          <span>
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='disciplines' id="disciplines"  />
                <label for="disciplines">Disciplines</label>
              </span>
          <span>
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='groups' id="groups" />
                <label for="groups">Groups</label>
              </span>
          <span>
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='none' id="none" />
                <label for="none">Top</label>
              </span>
          <span v-if="member.first">
                <input v-model="suggestionDisplay" class="with-gap" name="group1" type="radio" value='member' id="member" />
                <label for="member">{{member.first}}</label>
              </span>
        </form>
        <div>
          <!--  suggested -->
          <div >
            <!-- suggestions grouped -->
            <div v-if="suggestionDisplay !=='none'">
              <transition-group name="fade" >
                <flickity v-if='show' id='suggestionNav' ref='tag' key="tag" class=" suggestionNav " :options="suggestionNav" :class="{ shadowUnder : 'groups disciplines'.indexOf(suggestionDisplay) > -1}">
                  <!-- flickity navigation for isotope containers -->
                  <tag
                  v-for="group, i in tagSuggestions"
                  v-on:main='selectSuggestionGroup(i)'
                  :key="group.group[0].setID"
                  :tag="group.group[0]"
                  :display="'thumb'"
                  :persist-action="false"
                  hide="remove lens"
                  v-on:include="addToQuery(group.group[0])"
                  v-on:exclude="addToQuery(group.group[0])"
                  v-on:focus="addToQuery(group.group[0])"
                  v-on:pin="addToQuery(group.group[0])">
                  </tag>
                </flickity>
                <!-- isotope contianers -->
                <flickity  v-if='show' id='suggestionSteps' ref='steps' key="steps" :options="suggestionSteps" class=" suggestionSteps">
                  <div v-for="step in tagSuggestions" class="suggestionGroupStep">
                    <isotope :ref='"suggestionBin" + step.group[0].setID' :list="step.contains" :options='{}'>
                      <tag v-for="tag in step.contains" :key="tag.setID" :tag="tag" :display="'list'" v-on:main="addToQuery(tag)" v-on:include="addToQuery(tag)" v-on:exclude="addToQuery(tag)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)">
                      </tag>
                    </isotope>
                  </div>
                </flickity>
              </transition-group>
            </div>
            <!-- suggestions un-grouped filck -->
            <!-- <div v-if="'size disciplines time'.indexOf(suggestionDisplay) > -1">
                    <div id='suggestionNav' class=" suggestionNav ">
                      <tag
                        v-for="tag in tagSuggestions"
                        :key="tag.setID"
                        :tag="tag"
                        :display="'thumb'"
                        hide="remove lens"
                        v-on:main="addToQuery(tag)"
                        v-on:include="addToQuery(tag)"
                        v-on:exclude="addToQuery(tag)"
                        v-on:focus="addToQuery(tag)"
                        v-on:pin="addToQuery(tag)"
                      >
                    </tag>
                    </div>
                  </div> -->
            <!-- suggestions un-grouped iso -->
            <div v-if="' none '.indexOf(suggestionDisplay) > -1">
              <isotope ref="together" :list="tagSuggestions" :options='{}' >
                <tag v-for="tag in tagSuggestions" :key="tag.setID" :tag="tag" :display="'thumb'" v-on:main="addToQuery(tag)" v-on:include="addToQuery(tag)" v-on:exclude="addToQuery(tag)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)">
                </tag>
              </isotope>
            </div>
          </div>
        </div>
        <!-- suggested -->
      </div>
    </li>
    <li data-pane="resources">
      <div class="collapsible-header searchHead" :class="{'shadowUnder': selectedPane === 'resources'}">
        <span>
  						<i class="material-icons">image</i><span class="hide-on-med-and-down">Resources</span>
        </span>
        <span v-if="selectedPane !=='resources'" class="right badge">
  						<span >{{resourcesRelated}} resource<span v-if="resourcesRelated !=1">s</span> matched</span>
        </span>
        <span v-else>
				<span @click.stop.prevent="flipViewed" class="left viewBtn" :class="{'fade': !showViewed}" style="margin-right:15px"><i class="material-icons ">remove_red_eye</i></span>
        <span class="viewBtn" @click.stop.prevent="changeDisplay('list')"><i class="material-icons">view_list</i></span>
        <span class="viewBtn" @click.stop.prevent="changeDisplay('card')"><i class="material-icons">dashboard</i></span>
        <span class="viewBtn" @click.stop.prevent="changeDisplay('thumb')"><i class="material-icons">dialpad</i></span>
        <span class='right'>
					<a @click.stop="" class="dropdown-button viewBtn orderby" >
            <span class="dropdown-button" data-activates='order' data-hover="true" data-alignment='right'>{{orderby}}</span>
            <i @click="descending = !descending; setOrderAndDescending(orderby); fetchResources()" class="material-icons " :class="{'flipVert': !descending }">sort</i>
          </a>
        <ul id='order' class='dropdown-content sort'>
          <li @click.stop="setOrderAndDescending('quality')"><a>quality</a></li>
          <li @click.stop="setOrderAndDescending('complexity')"><a>complexity</a></li>
          <li @click.stop="setOrderAndDescending('added')"><a>date added</a></li>
          <li class='disabled'><a>time to view</a></li>
          <li @click.stop="setOrderAndDescending('votes')"><a># of votes</a></li>
          <li @click.stop="setOrderAndDescending('views')"><a># of views</a></li>
          <li class='disabled'><a># responses</a></li>
        </ul>
        </span>
        </span>
      </div>
      <div class="collapsible-body" style="border-bottom:none;">
        <br/>
        <tag-suggestions v-if="selectedPane ==='resources'" :tagQuery="tagQuery" v-on:add="addToQuery"></tag-suggestions>
        <div class="right quantity">
          <div>Showing {{resources.length}} of {{resourcesRelated}}</div>
          <div v-if='member.uid'><span v-if="showViewed">Including</span><span v-else>Excluding</span> {{resourcesViewed}} viewed</div>

        </div>
        <!-- <transition name="fade">
							<div>
								<tag v-for="tag in base"
									:tag="tag"
									:display="'thumb'"
									>
								</tag>
							</div>
						</transition> -->

        <div v-if="crossSection">
          <div id='crossSectionNav' class=" crossSectionNav ">
            <!-- flick navigation for isotope containers -->
            <div v-for="step in crossSection">
              <tag :tag="step" :display="'thumb'">
              </tag>
            </div>
          </div>
        </div>

        <div class="resourceCont">
          <transition name="fade">
            <!-- results by cross section -->
            <div v-if="crossSection">
              <!-- isotope contianers -->
              <div id='crossSectionSteps' class=" crossSectionSteps">
                <div v-for="step in crossSection" class="">
                  <isotope :ref='"resourceBin" + step.setID' :list="resources" :options='{}'>
                    <resource :key="re.resource.uid" v-for="re in resources" v-if="re.tagIDs.includes(step.setID)" :re="re" :display="resourceDisplay">
                    </resource>
                  </isotope>
                </div>
              </div>
            </div>
          </transition>

          <!-- results all together -->
          <transition name="fade">
            <div v-if="!crossSection" v-infinite-scroll="infinite" infinite-scroll-disabled="busy" infinite-scroll-distance="10" infinite-scroll-throttle-delay="1000" infinite-scroll-immediate-check="false">
              <isotope ref="resourceBin" :list="resources" :options='{}'>
                <resource v-for="re in resources"
                :key="re.resource.uid"
                :re="re"
                :display="resourceDisplay"
                :class="{'listFullWidth': resourceDisplay=='list'}">
                </resource>
              </isotope>
              <Spinner v-show='loadingResources'></Spinner>
            </div>
          </transition>

          <div class="message" v-show="resources.length === 0 || endOfResources">
            <p v-if="resources.length === 0">
              No results! Add a resource or shuffle?
            </p>
            <p v-if="endOfResources">
              No more results! Add a resource or shuffle?
            </p>
            <div>
              <router-link :to="{ name: 'addResource'}" class="hoverable btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i>
              </router-link>
              <span @click="random" class='btn-floating hoverable btn-large waves-effect waves-light red'><i class="fa fa-random fa-2x "></i></span>
            </div>
          </div>

          <q-btn
            v-back-to-top.animate="{offset: 500, duration: 200}"
            round
            color="primary"
            class="fixed-bottom-right animate-pop"
            style="margin: 0 15px 15px 0"
          >
            <q-icon name="keyboard_arrow_up" />
          </q-btn>
        </div>
      </div>
    </li>
  </ul>
</div>
</template>

<script>
import $ from 'jquery'
import Cookies from 'js-cookie'
import Materialize from 'materialize-css'
import tag from '@/components/tag'
import resource from '@/components/resource'
import search from '@/components/search'
import tagSuggestions from '@/components/tagSuggestions'
import infiniteScroll from 'vue-infinite-scroll'
import Spinner from 'vue-simple-spinner'
import isotope from 'vueisotope'
import Flickity from 'vue-flickity'
import {QBtn, QIcon, BackToTop, Toast} from 'quasar'

export default {
  name: 'explore',
  components: { tag, Toast, resource, search, Spinner, isotope, Flickity, QBtn, QIcon, tagSuggestions },
  directives: {infiniteScroll, BackToTop},
  props: ['tagQuery', 'member'],
  data () {
    return {
      db: null, // search results to display - array of material objects
      loginCheck: false, // true after login status is checked
      crossSection: null, // object containing the name of the cross section and tags in lens group - object containing array of tag objects and string name
      tagSuggestions: [], // holds suggestion groups and tags within
      suggestionDisplay: '', // the name of the currently selected display for tag suggestions
      suggestions: [], // suggested tags - array of tag objects
      show: true,
      resources: [], // db when no lens, replace with db even though less items? - array of tag objects
      showViewed: false, // whether or not viewed resources should be returned.
      resourcesRelated: null, // total number of resources related
      resourcesViewed: null, // number of related resources logged in member has viwed
      resourceDisplay: null, // display option for materials in search result - string name of displaytype (thumb, list, card)
      searchStr: null, // current member entered search text - string
      selectedPane: 'resources', // current selected selectedPane (search, tags, or resources)
      endOfResources: false, // status for reached end of infinite scroll
      loadingResources: false, // status for fetching resources
      orderby: 'quality', // order for returned resources (quality, complexity, number of views, etc.)
      descending: true, // should resources be returned in ascending or descending order
      crossSectionNav: {
        pageDots: false,
        prevNextButtons: false,
        accessibility: false // to prevent jumping when focused
      },
      crossSectionSteps: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 40 // play around with this more?
      },
      suggestionNav: {
        pageDots: false,
        prevNextButtons: true,
        accessibility: false
      },
      suggestionSteps: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 40
      }
    }
  },
  methods: {
    clearTagQuery () {
      this.tagQuery = []
    },
    flicker () { // this looks very stupid. For forcing flickity component in tag directory to reinitalize
      this.show = false
      this.$nextTick(() => {
        setTimeout(() => {
          this.show = true
          setTimeout(() => {
            this.$refs.tag.selectCell(Math.round(this.tagSuggestions.length / 2), false, false) // why is this not working?
          }, 50)
        }, 50)
      })
    },
    selectSuggestionGroup (index) {
      this.$refs.tag.selectCell(index)
      this.$refs.steps.selectCell(index)
    },
    setOrderAndDescending (by) {
      this.orderby = by
      Cookies.set('orderby', by)
      Cookies.set('descending', this.descending)

      Toast.create({
        html: '<span class="thin">Order by ' + this.orderby + ', ' + (this.descending ? 'high to low' : 'low to high</span>'),
        timeout: 1500,
        color: 'white',
        bgColor: 'black'
      })
      this.fetchResources()
    },
    infinite () {
      if (!this.endOfResources) {
        this.fetchResources(true)
      }
    },
    random () {
      this.$http.get('/api/resource/random').then(response => {
        this.$router.push({
          name: 'resource',
          params: {
            uid: response.body.uid
          }
        })
      })
    },
    includeSearch (set) {
      if (!this.tagQuery.includes(set.setID)) {
        this.tagQuery.push(set)
      }
      this.removeFrom(set, this.suggestions)
    },
    focus (set) {
      set.status.focusIcon = false
      var tIndex = this.tagQuery.length
      while (tIndex--) {
        if (!this.tagQuery[tIndex].status.pinnedIcon && this.tagQuery[tIndex].setID !== set.setID) this.tagQuery.splice(tIndex, 1)
      }
    },
    removeFrom (item, theArray) {
      for (var i = theArray.length - 1; i >= 0; i--) {
        if (theArray[i].setID === item.setID) theArray.splice(i, 1)
      }
    },
    removeTag (id) {
      for (var i = this.tagQuery.length - 1; i >= 0; i--) {
        if (this.tagQuery[i].setID === id) this.tagQuery.splice(i, 1)
      }
    },
    flipViewed () {
      if (this.member.uid) {
        this.showViewed = !this.showViewed
        this.$nextTick(() => {
          this.fetchResources()
        })

        Cookies.set('showViewed', this.showViewed)
        if (this.showViewed) {
          Materialize.toast('Include viewed resources', 2000)
        } else {
          Materialize.toast('Hide viewed resources', 2000)
        }
      } else {
        Materialize.toast('Must be logged in to hide viewed resources!', 2000)
        $('#login-modal').modal('open')
      }
    },
    addToQuery (tag) {
      tag.connections = 0
      if (tag.persistAction) { // this is handled really poorly...neeed to rethink tag comp. Also, this doesn't work for pin
        tag.status.includeIcon = true
      }
      if (tag.status.focusIcon) {
        this.focus(tag)
      }
      if (this.tagQuery.every(x => x.setID !== tag.setID)) { // don't add if already in query
        this.tagQuery.push(tag)
      } else {
        Materialize.toast('Already in query!', 1500)
      }
    },
    changeDisplay (disp) {
      this.resourceDisplay = disp
      Cookies.set('resourceDisplay', disp)
      // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
      this.$nextTick(function () {
        window.setTimeout(() => {
          this.layout()
        }, 375)
      })
    },
    changeLens (lens) {
      if (lens === null) {
        Cookies.set('lens', null)
      } else {
        Cookies.set('lens', lens.name)
      }
      if (lens === null || this.crossSection === null || this.crossSection.name !== lens.name) {
        this.crossSection = lens
        this.$nextTick(function () {
          this.layout()
        })
      }
    },
    shuffle (key) {
      this.$refs.resourceBin.shuffle()
      this.$refs.key.shuffle()
      this.$refs.tagQuery.shuffle()
    },
    layout () {
      if (this.tagSuggestions.length > 0 && this.suggestionDisplay === 'groups' && this.selectedPane === 'tags') {
        for (var tagIndex in this.tagSuggestions) { // layout all isotope containers in tag tagSuggestions
          if (this.$refs['suggestionBin' + this.tagSuggestions[tagIndex].group[0].setID] && this.$refs['suggestionBin' + this.tagSuggestions[tagIndex].group[0].setID][0]) {
            this.$refs['suggestionBin' + this.tagSuggestions[tagIndex].group[0].setID][0].layout('masonry')
          }
        }
      }
      for (tagIndex in this.crossSection) { // layout all isotope containers in cross section
        this.$refs['resourceBin' + this.crossSection[tagIndex].setID][0].layout('masonry')
      }
      if (this.$refs.tagQuery && this.selectedPane === 'search') {
        this.$refs.tagQuery.layout('masonry')
      }
      if (this.selectedPane === 'resources' && this.$refs.resourceBin && (!this.crossSection || this.crossSection.length === 0)) {
        this.$refs.resourceBin.layout()
      }
    },
    getTags () {
      if ('size disciplines time'.indexOf(this.suggestionDisplay) > -1) { // this is dumb and should be untangled.
        this.getBatchTags()
      } else {
        var include = []
        // var exclude = []
        for (var tagIndex = 0; tagIndex < this.tagQuery.length; tagIndex++) {
          include.push(this.tagQuery[tagIndex].setID)
        }
        // this.tagSuggestions = []
        this.$http.get('/api/set/', {
          params: {
            languageCode: 'en',
            include: include,
            exclude: [''],
            type: this.suggestionDisplay
          }
        }).then(response => {
          this.tagSuggestions = response.body

          if (this.tagSuggestions.length === 0) {
            this.suggestionDisplay = 'disciplines'
            Materialize.toast('Add tags to search first!', 2000)
          }
          this.flicker()
          this.$nextTick(() => {
            this.layout()
            // this.flicker()
          })
        })
      }
    },
    getBatchTags () {
      var scaleIDs = {
        'size': 'BJgVf2ZQYW',
        'disciplines': 'Bylx_hVBa-',
        'time': 'BJNgnDdk-'
      }
      var id = scaleIDs[this.suggestionDisplay]
      this.tagSuggestions = []
      this.$http.get('/api/set/' + id + '/crossSection', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        for (var x in response.body) {
          if (response.body[x].contains[0].tag === null) {
            response.body[x].contains = []
          }
          if (response.body[x].group[0].translation === null) {
            response.body[x].group[0].translation = ''
            console.log('I need to be dealt with - improve query.')
            // no translation because contains no tags
          }
        }
        this.tagSuggestions = response.body

        if (this.tagSuggestions.length === 0) {
          this.suggestionDisplay = 'size'
        }
        this.flicker()
        this.$nextTick(() => {
          this.layout()
        })
      })
    },
    fetchContains (set) { // used in fetching resource lens...
      this.$http.get('/api/set/' + set.setID + '/contains/', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        if (response.body.length > 0) {
          this.changeLens(response.body)
        } else {
          Materialize.toast('Contains no tags.', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchResources (infinite) {
      if (!this.loadingResources && !(infinite && this.resources.length === 0)) { // don't fetch if initial resrouces hadn't had time to load to avoid ending up with top resources twice
        this.loadingResources = true
        this.endOfResources = false
        var include = []
        var exclude = []
        var limit = 30 // default for large devices
        if (screen.width <= 480) { // less for mobile
          limit = 10
        }
        var skip = 0
        if (infinite) { // only skip if infinite scrolling
          skip = this.resources.length
        }
        for (var tagIndex = 0; tagIndex < this.tagQuery.length; tagIndex++) {
          if (this.tagQuery[tagIndex]['status'].includeIcon) {
            include.push(this.tagQuery[tagIndex]['setID'])
          } else {
            exclude.push(this.tagQuery[tagIndex]['setID'])
          }
        }
        if (this.member.uid !== null) { // member specific query if logged in
          this.$http.get('/api/auth/resource', {
            params: {
              languageCode: 'en',
              include: include,
              exclude: exclude,
              showViewed: this.showViewed,
              skip: skip,
              limit: limit,
              orderby: this.orderby,
              descending: this.descending
            }
          }).then(response => {
            if (response.body.length === 0) {
              this.endOfResources = true
              if (!infinite) {
                Materialize.toast('No resources found...', 2000)
              }
            } else if (infinite) {
              this.resources.push.apply(this.resources, response.body)
            } else {
              this.resources = response.body
            }
            this.loadingResources = false
          }, failed => {
            Materialize.toast('Something went wrong...', 2000)
            this.loadingResources = false
          })
        } else { // general query if not logged inconsole.log('getting general')
          this.$http.get('/api/resource', {
            params: {
              languageCode: 'en',
              include: include,
              exclude: exclude,
              skip: skip,
              limit: limit,
              orderby: this.orderby,
              descending: this.descending
            }
          }).then(response => {
            if (response.body.length === 0) {
              this.endOfResources = true
              if (!infinite) {
                Materialize.toast('No resources found...', 2000)
              }
            } else if (infinite) {
              this.resources.push.apply(this.resources, response.body)
            } else {
              this.resources = response.body
            }
            this.loadingResources = false
          }, failed => {
            console.log(failed)
            Materialize.toast('Something went wrong...', 2000)
            this.loadingResources = false
          })
        }
      }
    },
    fetchResourceQuantity () {
      var include = []
      var exclude = []
      for (var tagIndex = 0; tagIndex < this.tagQuery.length; tagIndex++) {
        if (this.tagQuery[tagIndex]['status'].includeIcon) {
          include.push(this.tagQuery[tagIndex]['setID'])
        } else {
          exclude.push(this.tagQuery[tagIndex]['setID'])
        }
      }
      if (this.member.uid !== null) { // member specific query if logged in
        this.$http.get('/api/auth/resource/count', {
          params: {
            languageCode: 'en',
            include: include
          }
        }).then(response => {
          this.resourcesRelated = response.body.relatedResources
          this.resourcesViewed = response.body.viewedResources
        })
      } else { // general query if not logged in
        this.$http.get('/api/resource/count', {
          params: {
            languageCode: 'en',
            include: include,
            exclude: exclude
          }
        }).then(response => {
          this.resourcesRelated = response.body.relatedResources
        })
      }
    }
  },
  mounted () {
    // alpha warning
    if (!Cookies.get('alpha-warning-seen')) {
      Cookies.set('alpha-warning-seen', true, {
        expires: 7
      })
      Materialize.toast('Hi! Knowlo is in alpha right now...everthing is subject to change and break.', 10000)
      this.$router.push('/about')
    } else {
      Cookies.set('alpha-warning-seen', true, {
        expires: 7
      }) // reset expiry
    }

    if (!this.resourcesRelated) {
      this.fetchResourceQuantity()
    }

    // get previously selected resource display Style
    if (!Cookies.get('resourceDisplay')) {
      this.resourceDisplay = 'card'
    } else {
      this.resourceDisplay = Cookies.get('resourceDisplay')
    }

    // get previously selected orderby
    if (!Cookies.get('orderby')) {
      this.orderby = 'quality'
    } else {
      this.orderby = Cookies.get('orderby')
    }

    // get previously selected desc/asc setting
    if (!Cookies.get('descending')) {
      this.descending = true
    } else {
      this.descending = (Cookies.get('descending') === 'true')
    }

    // get previously show viewed setting
    if (!Cookies.get('showViewed')) {
      this.showViewed = false
    } else {
      this.showViewed = (Cookies.get('showViewed') === 'true')
    }

    // get previously selected suggestionDisplay
    if (!Cookies.get('suggestionDisplay')) {
      this.suggestionDisplay = 'size'
    } else {
      this.suggestionDisplay = Cookies.get('suggestionDisplay')
    }

    // init paned sections
    $('.exploreBins').collapsible({
      onOpen: (el) => {
        this.selectedPane = el[0].dataset.pane
        if (el[0].dataset.pane === 'resources') {
          this.$nextTick(() => {
            $('.dropdown-button').dropdown() // init order-by dropdown
          })
        }
      }, // Callback for Collapsible open
      onClose: (el) => { // keep at least one pane open - default to resources
        if (el[0] && el[0].dataset.pane === this.selectedPane) {
          if (this.selectedPane !== 'resources') {
            this.selectedPane = 'resources'
            $('.exploreBins').collapsible('open', 2)
          } else {
            this.selectedPane = 'tags'
            $('.exploreBins').collapsible('open', 1)
          }
        }
      } // Callback for Collapsible close
    })
    $('.exploreBins').collapsible('open', 2)

    // init order by dropdown
    $('.orderby').dropdown()

    // workaround as long as imagesLoaded() non-functional
    setInterval(x => {
      this.layout()
    }, 3000)

    // fixes fetching resources when navigating from a different page (ex /about)...this seems exceedinly inelegant
    setTimeout(() => {
      if (this.selectedPane === 'resources' && this.resources.length === 0) {
        this.fetchResources()
      }
    }, 500)
  },
  watch: {
    member (newVal, oldVal) { // re-fetch resources/tags on member login/logout
      this.loginCheck = true
      this.$nextTick(x => {
        this.fetchResourceQuantity()
        if (this.selectedPane === 'resources') {
          this.fetchResources()
        }
      })
    },
    tagQuery (val, x) {
      if (this.tagQuery.length === 0) {
        this.suggestionDisplay = 'disciplines'
      }
      Cookies.set('tagQuery', val)
      if (this.loginCheck) { // don't fetch before checking member login
        this.$nextTick(() => {
          if (this.selectedPane === 'resources') {
            this.fetchResources()
          } else if (this.selectedPane === 'tags') {
            this.getTags() // only get tags if not loaded or set to groups or ungrouped
          }
          this.fetchResourceQuantity()
        })
      }
    },
    suggestionDisplay (val, x) {
      Cookies.set('suggestionDisplay', val)
      if (x.length > 0) {
        this.getTags()
      }
    },
    selectedPane (newVal, oldVal) {
      if (newVal !== oldVal && newVal === 'resources' && this.loginCheck) { // if resources
        this.fetchResources()
        this.$nextTick(() => {
          $('.dropdown-button').dropdown() // init order-by dropdown
        })
      } else if (newVal !== oldVal && newVal === 'tags') { // if tags
        this.getTags()
      } else { // if tag query
        console.log(this.$refs.tagQuery)
        // this.$refs.tagQuery.reloadItems() // TODO: vue-iso is not using the latest version of isotope, which has this function
      }
      this.layout()
    }
  }
}
</script>

<style>
.collapsible-header {
  position:sticky;
  top:0;
  z-index: 22;
  font-weight: 300;
}
.collapsible-body {
  padding:0!important;
}
.collapsible {
  margin:0;
}
.searchHead{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hoverable {
  box-shadow: none!important;
}
.hoverable:hover {
  box-shadow: 0 8px 17px 0 rgba(0,0,0,.2), 0 6px 20px 0 rgba(0,0,0,.19)!important;
}
.clear{
  font-size: 11px!important;
  font-weight: 300!important;
  line-height: 20px!important;
  border-radius: 25px!important;
  padding: 0px!important;
  color: black!important;
  height: 2em!important;
  width: 5em!important;
  padding-top: 2px!important;
}
[type="radio"]:checked+label:after, [type="radio"].with-gap:checked+label:before, [type="radio"].with-gap:checked+label:after {
    border: 2px solid #2196F3!important;
}
[type="radio"]:checked+label:after, [type="radio"].with-gap:checked+label:after {
    background-color: #2196F3!important;
}
.suggestionNav {
  z-index: 1;
}
.shadowUnder {
  box-shadow:0 5px 5px 0 rgba(0,0,0,0.2), 0 7px 11px 0 rgba(0,0,0,0.19);
}
.suggestionSteps {
  width: 100vw;
  height: 100%;
	height: 400px;

}
.suggestionGroupStep{
  width: 33%;
  overflow: scroll;
  height: 100%;
  margin-left:40px;
  /*padding: 30px 100px 30px 100px;*/
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-active{
  opacity: 0
}
.dropdown-button{
  margin-top: 5px;
}
.orderby{
  color:black;
}
.orderby span {
  text-transform: uppercase;
  vertical-align: middle;
  font-size: .9em;
}
.orderby i{
  transition: transform .5s;
}
.flipVert {
  transform: scaleY(-1);
}
.sort {
  width:150px!important;
}
.quantity {
  font-weight: 300;
  margin-right: 40px;
}
.crossSectionNav .flickity-page-dots {
  margin-bottom: -23px;
}
.crossSectionNav .flickity-page-dots {
  bottom: 23px;
}
.resourceCont {
    margin-top:50px;
  }
.crossSectionNav {
  position: sticky;
  overflow: hidden;
  top: -80px;
  background-color: white;
  z-index: 1;
  width: 100%;
}
.crossSectionSteps {
	width: 100%;
}
.listFullWidth {
  width: 100%!important;
  margin-left: 0%!important;
}
#tagSuggestionOptions {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
#tagSuggestionOptions span {
  margin: 10px 20px 0px 20px;
  width: 110px;
}
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    .suggestionGroupStep{
      padding: 0;
      width: 90vw;
    }
  }
#tagSuggestionOptions {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
#tagSuggestionOptions span {
  margin: 10px 20px 0px 20px;
  width: 110px;
}
</style>
