<template>
  <Layout :panel_show.sync="panel_show" title="矩形绘制-直接绘制">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="执行" name="exec">执行</el-tab-pane>
      <el-tab-pane label="代码" name="code">代码</el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '../Layout.vue';
import { mapState } from 'vuex';

export default {
  name: 'RectDirect',
  components: {
    Layout
  },
  data() {
    return {
      panel_show: false,
      activeName: 'exec'
    }
  },
  computed: {
    ...mapState([ 'curSelect' ])
  },
  watch: {
    curSelect(val) {
      val === "draw-rect-direct" && (this.panel_show = true);
    }
  }
}
</script>