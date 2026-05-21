import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currMaxZIndex: 1,
    curSelect: '',
    stopLast: null
  },
  getters: {
  },
  mutations: {
    SET_CURR_MAX_ZINDEX(state, val) {
      state.currMaxZIndex = val;
    },
    SET_CUR_SELECT(state, val) {
      state.curSelect = val;
    },
    SET_STOP_LAST(state, val) {
      state.stopLast = val;
    }
  },
  actions: {
  },
  modules: {
  }
})
