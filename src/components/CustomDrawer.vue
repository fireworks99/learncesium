<template>
  <transition name="right-drawer">
    <div v-show="visible" class="custom-drawer">
      <div class="drawer-content" ref="drawer">
        <!-- header -->
        <div class="header">
          <div class="title">{{ title }}</div>
          <div class="close" @click="$emit('update:visible', false)">
            <img src="@/assets/images/close.svg" alt="">
          </div>
        </div>

        <!-- body -->
        <div class="drawer-body">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "CustomDrawer",

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    handleClickOutside(e) {
      if (!this.visible) return;

      const drawer = this.$refs.drawer;

      // 点击在抽屉内部
      if (drawer && drawer.contains(e.target)) {
        return;
      }

      // 点击在抽屉外部
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.custom-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;

  .drawer-content {
    height: 100%;
    width: max-content;
    max-width: 80vw;
    pointer-events: auto;
    background: rgba(9, 43, 77, 0.96);
    border-left: 1px solid rgba(0, 175, 255, 0.4);
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35), $glow-shadow;
    color: $text-color;
    backdrop-filter: blur(10px);
    border-top-left-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
    overflow: auto;
    padding: 16px;
    box-sizing: border-box;

    .header {
      background: linear-gradient(90deg, #0068B4, #00AFFF);
      color: #fff;
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      box-shadow: 0 0 8px rgba(0, 175, 255, 0.5);
      margin-bottom: 16px;
      border-radius: 8px;

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
  }
}

// ===== 动画 =====

.right-drawer-enter-active,
.right-drawer-leave-active {
  transition: all 0.3s ease;
}

.right-drawer-enter,
.right-drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.right-drawer-enter-to,
.right-drawer-leave {
  transform: translateX(0);
  opacity: 1;
}
</style>