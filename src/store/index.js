/**
 * Created by wenZ on 2017/11/23.  入口--初始化操作
 */

/**
 * 只有mutations才能修改state
 * */

import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import mutations from './mutations'
import state from './state'

import createLogger from 'vuex/dist/logger'   // 在控制台打印修改的日志

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'   // 没上线前使用 有点性能问题

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  strict: debug,     // 严格模式检测修改state的方式只能通过mutations
  plugins: debug ? [createLogger()] : []
})
