<template>
    <scroll
      class="listview"
      :data="data"
      ref="listview"
      :listenScroll="listenScroll"
      :probeType="probeType"
      @get-position="getPosition"
    >
      <ul>
        <li v-for="group in data" class="list-group" ref="listGroup">
          <h2 class="list-group-title">{{group.title}}</h2>
          <ul>
            <li v-for="item in group.items" class="list-group-item">
              <!-- 使用v-lazy懒加载图片 -->
              <img class="avatar" v-lazy="item.avatar"/>
              <span class="name">{{item.name}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShorcutTouchMove">
        <ul>
          <li
            v-for="(item, index) in shortcutList"
            :data-index="index"
            class="item"
            :class="{'current' : currentIndex===index}">
            {{item}}
          </li>
        </ul>
      </div>
      <div class="list-fixed" ref="fixedtitle" v-show="fixedTitle">
        <h1 class="fixed-title">{{fixedTitle}}</h1>
      </div>
      <div v-show="!data.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  // 一个字母所占的高度
  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
    created() {
      // 这里声明变量是因为不用检测数据的变化
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
      this.probeType = 3  // 不给better-scroll节流
    },
    data() {
      return {
        scrollY: -1,    // 滚动的位置
        currentIndex: 0, // 高亮元素的索引
        diff: -1
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substring(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShorcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        // 或0操作等于Math.floor的作用,下面delta是计算Y轴的偏移计算滚动了几个元素
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      getPosition(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        // index不正常的话不执行
        if (!index && index !== 0) {
          return
        }
        // index的边界处理
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0   // 第一个元素的高度为0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]   // 每个group的元素
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间滚动的时候
        // 遍历要减多一个一是因为每个元素的上限是下一个元素的下限，我们要保证上限是存在的
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]     // 下限
          let height2 = listHeight[i + 1]   // 上限
          // 假如遍历到最后一个,  newY的话 都是负值，所以前面要加一个负号
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            // newY是负数
            this.diff = height2 + newY
            return
          }
        }
        // 最后一个group可能数据比较少，newY可能会大于上限
        // 当滚动到底部，且-newY大于最后一个元素的上限,listHeight的值比 shortcut的 多了一个的其实
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) { // newVal是watch中如果diff发生改变后的值，还有一个参数是oldVal改变前的值
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixedtitle.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

