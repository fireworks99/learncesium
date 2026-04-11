<template>
  <div class="panel_wrapper" v-show="panel_show" v-dialogDrag @click="moveTop($event)" ref="panel">
    <div class="header drag-header">
      <div class="title">{{ title }}</div>
      <div class="close" @click="$emit('update:panel_show', false)">
        <img src="@/assets/images/close.svg" alt="">
      </div>
    </div>

    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store';

export default {
  props: {
    panel_show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "Title"
    },
  },
  computed: {
    ...mapState({
      currMaxZIndex: 'currMaxZIndex'
    })
  },
  watch: {
    panel_show(val) {
      if(val) {
        this.$refs.panel.style.zIndex = this.currMaxZIndex + 1;
        store.commit("SET_CURR_MAX_ZINDEX", this.currMaxZIndex + 1);
      }
    }
  },
  methods: {
    moveTop(e) {
      let dom = e.target;
      while(!dom.classList.contains("panel_wrapper") && dom.parentElement) {
        dom = dom.parentElement;
      }
      if(dom.classList.contains("panel_wrapper")) {
        dom.style.zIndex = this.currMaxZIndex + 1;
        store.commit("SET_CURR_MAX_ZINDEX", this.currMaxZIndex + 1);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel_wrapper {
  position: absolute;
  z-index: 1;
  left: calc(200px + 16px);
  top: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 175, 255, 0.3);
  border: 1px solid rgba(0, 175, 255, 0.2);

  .header {
    background: linear-gradient(90deg, #0068B4, #00AFFF);
    color: #fff;
    height: 48px;
    line-height: 48px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 0 8px rgba(0, 175, 255, 0.5);

    .title {
      font-size: 16px;
      font-weight: bold;
      text-shadow: 0 0 5px #00AFFF, 0 0 10px #00AFFF;
    }

    .close {
      margin-left: auto;
      display: flex;
      align-items: center;
      img {
        height: 20px;
        width: 20px;
        cursor: pointer;
        filter: drop-shadow(0 0 4px #00AFFF);
        transition: transform 0.2s ease;
      }
      img:hover {
        transform: scale(1.2);
      }
    }
  }

  .content {
    background: rgba(9, 43, 77, 0.8);
    backdrop-filter: blur(8px);
    padding: 12px;
    border-top: 1px solid rgba(0, 175, 255, 0.1);
    color: #fff;
  }
}

</style>