<template>
  <div>
  <span class='options'>
    <!-- <q-radio v-model="displayed" val="base" label="Base Tags" /> -->
    <q-radio v-model="displayed" val="tags" label="Tags" />
    <q-radio v-model="displayed" val="groups" label="Groups" />
    <!-- <q-radio v-model="displayed" val="disciplines" label="disciplines" /> -->
  </span>
  <q-btn class='back' color='primary' small flat round v-show='displayed === "subGroup"' @click="showAllGroups">
    <q-icon name='arrow back' />
  </q-btn>
  <isotope  v-if='show' class='rtags' ref='rtags' :list="tags" :options="{}">
    <tag v-if='displayed === "groups"' v-for="tag, i in tags"
      :tag="tag"
      :key="tag.tag.uid+i"
      v-on:include="addTag(tag)"
      v-on:pin="addTag(tag)"
      v-on:focus="addTag(tag)"
      hide="lens remove"
      v-on:main="showGroup(i)"
      display='thumb'>
    </tag>
    <!-- TODO include lens option above... -->
    <tag v-else
      :tag="tag"
      :key="tag.tag.uid+i"
      v-on:include="addTag(tag)"
      v-on:pin="addTag(tag)"
      v-on:focus="addTag(tag)"
      hide="remove lens"
      v-on:main="tagQuery.push(tag)"
      display='thumb'>
    </tag>
  </isotope>
  </div>
</template>

<script>
import tag from '@/components/tag'
import isotope from 'vueisotope'
import {QRadio, QBtn, QIcon} from 'quasar'

export default {
  name: 'tagSuggestions',
  components: { tag, isotope, QRadio, QBtn, QIcon },
  props: ['tagQuery'],
  data () {
    return {
      show: true,
      fetching: false, // currently fetching
      tags: [],
      type: 'none',
      displayed: 'tags', // TODO save in cookie
      baseUID: 'rJlh4ZPpNG',
      groupSet: []
    }
  },
  methods: {
    showGroup (index) {
      this.tags = this.groupSet[index].contains
      this.displayed = 'subGroup'
    },
    showAllGroups () {
      this.tags = this.groupSet.map(x => {
        x.group[0].connections = x.contains.length // show number of tags contained
        return x.group[0]
      })
      this.$nextTick(() => {
        this.$refs.rtags.layout()
      })
      this.displayed = 'groups'
    },
    addTag (tag) {
      this.$emit('add', tag) // with pin/include/focus flag
    },
    fetch () { // determine which method to get
      if (!this.fetching) { // TODO: fix me. This prevents isotope from screwing up (breaking due to multiple assignments of the tag suggestion array) but also prevents the right tag suggestions from loading after loading the tag query from cookies
        this.tags = []
        if (this.displayed === 'subGroup') {
          this.displayed = 'groups'
        }
        if (this.displayed === 'base') {
          this.getBase()
        } else if (this.displayed === 'groups') {
          this.getGroups()
        } else if (this.tagQuery.length > 0) {
          this.getTopRelated()
        } else {
          this.getTopAll()
        }
      }
    },
    getBase () {
      this.fetching = true
      this.tagSuggestions = []
      this.$http.get('/api/set/' + 'rJgyQNK64f' + '/crossSection', { // hard coding base-set uid
        params: {
          languageCode: 'en'
        },
        before (request) {
          if (this.previousRequest) {
            this.previousRequest.abort()
          }
          this.previousRequest = request
        }
      }).then(response => {
        this.tags = response.body.map(x => x.group[0])

        this.$refs.rtags.layout()
        this.fetching = false
      })
    },
    getGroups () {
      this.fetching = true
      var include = []
      for (var tagIndex = 0; tagIndex < this.tagQuery.length; tagIndex++) {
        include.push(this.tagQuery[tagIndex].setID)
      }
      this.$http.get('/api/set/', {
        params: {
          languageCode: 'en',
          include: include,
          exclude: [''],
          type: this.displayed
        },
        before (request) {
          if (this.previousRequest) {
            this.previousRequest.abort()
          }
          this.previousRequest = request
        }
      }).then(response => {
        this.groupSet = response.body
        this.showAllGroups()
        this.fetching = false
      })
    },
    getTopRelated () {
      this.fetching = true
      let include = []
      // var exclude = []
      for (var tagIndex = 0; tagIndex < this.tagQuery.length; tagIndex++) {
        include.push(this.tagQuery[tagIndex].setID)
      }
      this.$http.get('/api/set/', {
        params: {
          languageCode: 'en',
          include: include,
          exclude: [''],
          type: 'none'
        }
      }).then(response => {
        this.tags = response.body
        this.$refs.rtags.layout()
        this.fetching = false
      })
    },
    getTopAll () {
      this.fetching = true
      this.$http.get('/api/tag/most', {
        params: {
          languageCode: 'en'
        }
      }).then(response => {
        this.tags = response.body
        this.$refs.rtags.layout()
        this.fetching = false
      })
    }
  },
  mounted () {
    setTimeout(() => { // wait for vue-isotope to be ready
      this.fetch()
    }, 100)
  },
  watch: {
    tagQuery (val) {
      this.fetch()
    },
    displayed (val) {
      if (val !== 'subGroup') {
        this.fetch()
      }
    }
  }
}
</script>

<style>
.rtags {
  min-height: 150px;
  margin-left: 30px;
}
.options div {
  margin-left: 30px;
  margin-right: 10px;
  height: 40px;
}
.back {
  margin:10px;
}
</style>
