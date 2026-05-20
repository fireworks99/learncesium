<template>
  <Layout :panel_show.sync="panel_show" title="分队战斗行动（尾）绘制-交互绘制">

  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import Collapse from '@/components/Collapse.vue';
import { mapState } from 'vuex';

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
    ...mapState(['curSelect'])
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
      // clearDraw();
    },

    create() {
      // startDraw();
    },

    update() {
      // startModify();
    }

  }// methods end
}
</script>