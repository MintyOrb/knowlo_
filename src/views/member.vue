<template :member='member'>
<div style="opacity:0" :id="'memberModal'+member.uid" class="modal fullPage ">
  <span class="exit modal-close"><i class="fa fa-3x fa-times"></i></span>

  <div class="member-container memberTitle center">
    <div>{{mem.name}}</div>
  </div>

  <div class="memberMeta">
    <div class="metaNav">
      <!-- flick navigation for isotope containers -->
      <span @click="selectSection(i)" v-for="step, i in memberSection">
        {{step}}
      </span>
    </div>
    <!-- flick contianers -->
    <flickity :options="flick" ref='flick' class="resourceSections">

      <div class="resourceStep discussion">
        <radar class="rchart" :data="scale.data" :data-label="scale.dataLabel" :labels="scale.labels"></radar>
        <isotope ref='scale' :list="scale.all" :options='{}'>
          <div v-for="tag in scale.all" :key="tag.setID">
            <tag :tag="tag" :display="'thumb'" :key="tag.setID" v-on:include="addToQuery(tag)" v-on:exclude="removeSynonym(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)">
            </tag>
          </div>
        </isotope>
      </div>

      <div class="resourceStep discussion about center">
        <div>
          <span>Member since:</span> {{mem.joined}}
        </div>
        <div>
          <span>Resources viewed:</span> {{mem.totalViewed}}
        </div>
        <div>
          <span>Total votes:</span> {{mem.totalVotes}}
        </div>
        <div>
          <span>Average quality vote:</span> {{mem.globalVote.quality.toFixed(2)}}
        </div>
        <div>
          <span>Average complexity vote:</span> {{mem.globalVote.complexity.toFixed(2)}}
        </div>
      </div>

      <div class="resourceStep discussion">
        <isotope ref='seenBin' :list="history" :options='{}'>
          <resource v-for="re in history" :re="re" :key="re.resource.uid" :display="'list'" :voting='false'>
          </resource>
        </isotope>
      </div>

      <div class="resourceStep tags">
        <isotope ref='top' :list="top" :options='{}'>
            <tag v-for="tag in top" :key="tag.setID" :tag="tag" :display="'list'" v-on:include="addToQuery(tag)" v-on:exclude="removeSynonym(tag.tag.uid)" v-on:focus="addToQuery(tag)" v-on:pin="addToQuery(tag)">
            </tag>
        </isotope>
      </div>

    </flickity>

  </div>

</div>
</template>
<script>
import Materialize from 'materialize-css'
import $ from 'jquery'
import tag from '@/components/tag'
import resource from '@/components/resource'
import isotope from 'vueisotope'
import radar from '@/components/radarChart'
import Flickity from 'vue-flickity'

export default {
  name: 'memberPageTemplate',
  props: ['member'],
  components: { tag, resource, isotope, radar, Flickity },
  data () {
    return {
      memberSection: ['Time By Discpline', 'Stats', 'History', 'Top Tags'],
      history: [],
      top: [],
      scale: {all: []},
      mem: {globalVote: {quality: 0, complexity: 0}},
      modalOpen: false,
      flick: {
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      }
    }
  },
  methods: {
    fetchSets () {
      this.$http.get('/api/member/' + this.$route.params.uid + '/set/Bylx_hVBa-').then(response => {
        if (response.body) {
          this.scale.all = response.body
          this.scale.data = []
          this.scale.labels = []
          this.scale.all.forEach(x => {
            this.scale.data.push(x.count)
            this.scale.labels.push(x.translation.name)
            x['connections'] = x.count
          })
          this.scale.dataLabel = ' '
        } else {
          Materialize.toast('Member not found.', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    addToQuery (item) {
      this.$emit('add', item)
    },
    fetchTop () {
      this.$http.get('/api/member/' + this.$route.params.uid + '/set/top', { params: {skip: 0, limit: 10} }).then(response => {
        if (response.body) {
          this.top = response.body
          this.top.forEach(x => {
            x['connections'] = x.count
          })
        } else {
          Materialize.toast('Member not found.', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchHistory () {
      this.$http.get('/api/member/' + this.$route.params.uid + '/history').then(response => {
        if (response.body) {
          this.history = response.body
          this.$nextTick(() => {
            window.setTimeout(() => {
              this.$refs.seenBin.layout('masonry')
            }, 1000)
          })
        } else {
          Materialize.toast('History not found.', 4000)
        }
      }, response => {
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    fetchMember () {
      this.$http.get('/api/member/' + this.$route.params.uid).then(response => {
        if (response.body) {
          this.mem = response.body
          this.mem.joined = new Date(this.mem.joined).toLocaleDateString()
        } else {
          Materialize.toast('Member not found.', 4000)
        }
        this.init()
      }, response => {
        this.init()
        Materialize.toast('Something went wrong...are you online?', 4000)
      })
    },
    init () {
      this.fetchSets()
      this.fetchTop()
      this.fetchHistory()
      this.$nextTick(() => {
        if (!this.modalOpen) {
          this.modalOpen = true
          $('#memberModal' + this.member.uid).modal({
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
      })
    },
    selectSection (index) {
      this.$refs.flick.select(index)
    }
  },
  mounted () {
    if (this.member.uid) {
      this.fetchMember()
    }
  },
  beforeRouteLeave (to, from, next) {
    $('.modal-overlay').remove() // needed if navigating from member page to set page
    $('body').css('overflow', 'auto')
    next()
  },
  watch: {
    '$route.params.uid': function (id) {
      this.fetchMember()
    },
    member (current) {
      if (current.uid) {
        this.fetchMember()
      }
    }
  }
}
</script>

<style>

.member-container{
  height: 80px;
  background-color: white;
}
.memberStep {
  width: 30vw;
}
.memberMeta {
  height: 100vh;
  position: relative;
  width: 100vw;
  background-color: white;
}
.about div {
  font-weight: 200;
  margin:30px;
  font-size: 20px;
}
.about span {
  font-weight: 300;
}
/* iPads (portrait and landscape) ----------- */
@media only screen
and (min-width : 768px)
and (max-width : 1024px) {
  .rchart {
    margin: auto;
    width: 90%;
  }
}
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) { /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */

    .rchart {
      margin: auto;
      width: 90%;
    }
  }
.rchart {
  margin: auto;
  width: 50%;
}
.tags {
  width: 400px;
  max-width: 100%;
}
</style>
