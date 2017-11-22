<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!-- keep-alive把里面的东西缓存到内存中，这样就不会因为刷新路由而多次请求那些一样的数据了 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab.vue'

  export default {
    components: {
      MHeader,
      Tab
    }
  }
</script>

<style lang="stylus" scoped>

</style>
