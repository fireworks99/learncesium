import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currMaxZIndex: 1,
    curSelect: ''
  },
  getters: {
  },
  mutations: {
    SET_CURR_MAX_ZINDEX(state, val) {
      state.currMaxZIndex = val;
    },
    SET_CUR_SELECT(state, val) {
      state.curSelect = val;
    }
  },
  actions: {
  },
  modules: {
  }
})
