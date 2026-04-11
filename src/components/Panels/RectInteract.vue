<template>
  <Layout :panel_show.sync="panel_show" title="矩形绘制-交互绘制">
    内容
  </Layout>
</template>

<script>
import Layout from '../Layout.vue';
import { mapState } from 'vuex';

export default {
  name: 'RectInteract',
  components: {
    Layout
  },
  data() {
    return {
      panel_show: false
    }
  },
  computed: {
    ...mapState([ 'curSelect' ])
  },
  watch: {
    curSelect(val) {
      val === "draw-rect-interact" && (this.panel_show = true);
    }
  }
}
</script>