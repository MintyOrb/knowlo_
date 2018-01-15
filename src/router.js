import Vue from 'vue'
import VueRouter from 'vue-router'
import explore from '@/views/explore'
import getInvolved from '@/views/getInvolved'
import landing from '@/views/landing'
import legal from '@/views/legal'
import member from '@/views/member'
import principals from '@/views/principals'
import resource from '@/views/resource'
import status from '@/views/status'
import tag from '@/views/tag'
import addResource from '@/components/addResource'

Vue.use(VueRouter)

function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  mode: 'hash',
  // scrollBehavior: () => ({ y: 0 }),

  routes: [
    // { path: '/', component: load('components/Hello') },
    {
      path: '/',
      component: explore,
      name: 'explore',
      children: [
        { path: '/m/:uid', component: member, name: 'member' },
        { path: '/r/:uid', component: resource, name: 'resource' },
        { path: '/t/:name/:uid?', component: tag, name: 'tag' },
        { path: '/addResource', component: addResource, name: 'addResource' }
      ]
    },
    {
      path: '/status',
      component: status
    },
    {
      path: '/about',
      component: landing
    },
    {
      path: '/principals',
      component: principals
    },
    {
      path: '/getInvolved',
      component: getInvolved
    },
    {
      path: '/legal',
      component: legal
    },

    // Always leave this last one
    { path: '*', component: load('/components/Error404') } // Not found
  ]
})
