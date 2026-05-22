<template>
  <Layout :panel_show.sync="panel_show" title="分队战斗行动（尾）绘制-交互绘制">
    <el-tabs v-model="activeName" type="card">
      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="primary" @click="create">开始绘制</el-button>
        </div>
      </el-tab-pane>

      <!-- 2. 编辑 -->
      <el-tab-pane label="编辑" name="update">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="success" @click="update">开始编辑</el-button>
        </div>
      </el-tab-pane>

      <!-- 3. 删除 -->
      <el-tab-pane label="删除" name="delete">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="danger" @click="clear">删除</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import Collapse from '@/components/Collapse.vue';
import { mapState } from 'vuex';


import { createEntity, showPrimitiveOnMap } from './script';
import { useUnfixed } from '../useUnfixed';

const {
  startDraw,
  clearDraw,
  startModify
} = useUnfixed({
  minP: 2,
  createEntity,
  showPrimitiveOnMap
});

export default {
  name: 'TailedSquadCombatInteract',
  components: {
    Layout,
    CodeBrower,
    Collapse
  },
  data() {
    return {
      panel_show: false,
      activeName: 'insert',
    }
  },
  computed: {
    ...mapState(['curSelect', 'stopLast'])
  },
  watch: {
    curSelect(val) {
      val === "draw-tailedSquadCombat-interact" && (this.panel_show = true);
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