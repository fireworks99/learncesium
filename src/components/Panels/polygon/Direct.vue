<template>
  <Layout :panel_show.sync="panel_show" title="矩形绘制-直接绘制">
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import { mapState } from 'vuex';

export default {
  name: 'PolygonDirect',
  components: {
    Layout,
    CodeBrower
  },
  data() {
    return {
      panel_show: false
    }
  },
  computed: {
    ...mapState(['curSelect']),
  },
  watch: {
    curSelect(val) {
      val === "draw-polygon-direct" && (this.panel_show = true);
    }
  },
}
</script>