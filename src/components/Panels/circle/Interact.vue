<template>
  <Layout :panel_show.sync="panel_show" title="圆绘制-交互绘制">
    <div style="text-align: center; margin-bottom: 8px;">
      <el-button type="primary" @click="create">开始绘制 startDraw()</el-button>
      <el-button type="success" @click="update">开始编辑 startModify()</el-button>
      <el-button type="danger" @click="clear">删除 clearDraw()</el-button>
    </div>

    <Collapse title="①固定点数图形-公共方法 + ③以下代码，即可完成增删改">
      <CodeBrower :code="script" language="javascript" :maxHeight="maxHeight"/>
    </Collapse>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import Collapse from '@/components/Collapse.vue';
import { mapState } from 'vuex';

import { createEntity, showPrimitiveOnMap, script } from './script';
import { useFixed } from '../useFixed';

const {
  startDraw,
  clearDraw,
  startModify
} = useFixed({
  minP: 2,
  createEntity,
  showPrimitiveOnMap
});

export default {
  name: 'CircleInteract',
  components: {
    Layout,
    CodeBrower,
    Collapse
  },
  data() {
    return {
      panel_show: false,
      script
    }
  },
  computed: {
    ...mapState(['curSelect', 'stopLast']),

    maxHeight() {
      return parseFloat(innerHeight) - 250;
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-circle-interact" && (this.panel_show = true);
    }
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    clear() {
      clearDraw();
    },

    create() {
      this.stopLast && this.stopLast();
      this.$store.commit("SET_STOP_LAST", this.clear);
      startDraw();
    },

    update() {
      startModify();
    }

  }// methods end
}
</script>