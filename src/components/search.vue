<template>
  <div class="input-field ">
    <q-input type="text" float-label='Search' v-on:click.stop.prevent=""  class="search" v-model="input"  @focus="hidden=false" @blur="delayBlur"/>
    <ul id="ac" class="dropdown-content" style="position:absolute" :class="{ hide: hidden}">
			<li v-for="suggestion in suggestions" @click.stop.prevent='pick(suggestion)'>
				<img v-if="suggestion.tag.iconURL" :src="suggestion.tag.iconURL" class="left">
				<span><i v-if="suggestion.new" class='material-icons  left'>add</i>{{suggestion.translation.name}}<span v-if="$route.name !='addTag' && suggestion.new" @click="addWithDetail = true"><i class='material-icons right addDetail'>playlist_add</i></span></span>
			</li>
		</ul>
	</div>
</template>
<script>
import $ from 'jquery'
import Materialize from 'materialize-css'
import { QInput } from 'quasar'
// adapted from  http://stackoverflow.com/a/42757285/2061741
// TODO: there is a LOT of direct DOM manipulation here that probably ought to be cleaned up.
export default {
  props: ['ajaxUrl', 'inputId', 'exclude', 'holderText'],
  components: { QInput },
  name: 'search',
  data: () => {
    return {
      addWithDetail: false,
      suggestions: [],
      input: '',
      hidden: false,
      tag: {
        url: '',
        english: ''
      },
      translation: {
        name: '',
        definition: '',
        languageCode: 'en' // don't hard code
      }
    }
  },
  methods: {
    pick (item) {
      this.input = ''
      this.suggestions = []
      if (item.translation.name.indexOf('Create new tag:') > -1) { // if tag needs to be created
        this.tag.english = this.translation.name = item.translation.name.substr(16).trim()
        if (this.addWithDetail) {
          this.$router.push('/addTag/' + this.translation.name)
        } else {
          this.quickAdd()
        }
      } else {
        item.status = {includeIcon: true} // having to add item.status here feels dumb.
        this.$emit('select', item)
      }
    },
    delayBlur () { // delay blur so pick is detected..
      window.setTimeout(() => {
        this.hidden = true
      }, 300)
    },
    quickAdd () {
      this.$http.post('/api/auth/set', {tag: this.tag, translation: this.translation}).then(response => {
        if (response.body.tag) {
          this.$emit('select', response.body)
          Materialize.toast('"' + response.body.translation.name + '"' + ' created!', 3000)
        } else {
          Materialize.toast('Something went wrong...tag not added.', 4000)
        }
      }, response => {
        if (response.status === 401) {
          Materialize.toast('You must be logged in to add a tag!', 4000)
          $('#login-modal').modal('open')
        } else {
          Materialize.toast('Something went wrong...are you online?', 4000)
        }
      })
    },
    hide () { // need to time out because otherwise the li is hidden before selected() fires on click
      window.setTimeout(() => {
        this.hidden = true
      }, 250)
    }
  },
  updated () {
    if (this.$route.name === 'explore') {
      $('#ac').appendTo('#search') // workaround for stacking context
    }
  },
  mounted () {
    $('input').attr('id', this.inputId) // hacky way to grab text from input. Should probably just impliment quasar searh/autocomplete...
    var options = {
      inputId: this.inputId || 'search-input',
      ajaxUrl: this.ajaxUrl || '/api/tag/search/',
      data: {exclude: this.exclude},
      minLength: 1
    }
    var $input = $('#' + options.inputId)
    if (options.ajaxUrl) {
      var $search = $('#ac')
      var timeout
      var liSelected
      $input.on('keyup', (e) => {
        if (timeout) { // comment to remove timeout
          clearTimeout(timeout)
        }

        if (this.input.length === 0) {
          this.hidden = true
        } else {
          this.hidden = false
        }

        if (e.which === 13 && this.input.length > 0 && liSelected[0]) { // select element with enter key
          liSelected[0].click()
          return
        }

        // scroll ul with arrow keys
        if (e.which === 40) { // down arrow
          if (liSelected) {
            liSelected.removeClass('selected')
            var next = liSelected.next()
            if (next.length > 0) {
              liSelected = next.addClass('selected')
            } else {
              liSelected = $search.find('li').eq(0).addClass('selected')
            }
          } else {
            liSelected = $search.find('li').eq(0).addClass('selected')
          }
          return // stop new AJAX call
        } else if (e.which === 38) { // up arrow
          if (liSelected) {
            liSelected.removeClass('selected')
            next = liSelected.prev()
            if (next.length > 0) {
              liSelected = next.addClass('selected')
            } else {
              liSelected = $search.find('li').last().addClass('selected')
            }
          } else {
            liSelected = $search.find('li').last().addClass('selected')
          }
          return
        }

        // escape these keys
        if (e.which === 9 || // tab
            e.which === 16 || // shift
            e.which === 17 || // ctrl
            e.which === 18 || // alt
            e.which === 20 || // caps lock
            e.which === 35 || // end
            e.which === 36 || // home
            e.which === 37 || // left arrow
            e.which === 39) { // right arrow
          return
        } else if (e.which === 27) { // Esc. Close ul
          return
        }

        var val = $input.val().toLowerCase()
        if (val.length > options.minLength) {
          timeout = setTimeout(() => { // comment this line to remove timeout
            this.$http.get(options.ajaxUrl + val + '/' + this.exclude).then(data => {
              this.suggestions = data.body
              // hide "create new" if a match is found
              if (Object.values(this.suggestions).findIndex(item => this.input.toLowerCase().trim() === item.translation.name.toLowerCase().trim())) {
                this.suggestions.push({
                  tag: {},
                  translation: {
                    name: 'Create new tag: ' + this.input
                  },
                  new: true
                })
              }
            },
            fail => {
              console.log(fail)
            })
          }, 250) // comment this line to remove timeout
        }
      })
    }
  }
}
</script>

<style>

.addDetail{
  padding: 5px;
  margin-top: -5px;
  border-radius: 50%;
  background-color: white;
  transition: background-color .3s;
}
.addDetail:hover{
  background-color:rgb(210, 210, 210);
}
/* .searchDrop{
width:80vw;
right:10vw;
margin-top:0px;
} */
#ac {
  display: inline;
  opacity: 1;
  width: 60%;
  right: 20%;
}
#ac img {
  height: 40px;
  width: 40px;
  margin: 5px;
}
@media only screen
and (min-device-width : 320px)
and (max-device-width : 480px) {
  #ac {
    right: 5%;
    width: 90%;
  }
}
</style>
