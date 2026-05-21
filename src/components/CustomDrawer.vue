<template>
  <transition name="right-drawer">
    <div v-show="visible" class="custom-drawer">
      <div class="drawer-content" ref="drawer">
        <slot />
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
    }
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

    box-shadow:
      -4px 0 12px rgba(0, 0, 0, 0.35),
      $glow-shadow;

    color: $text-color;

    backdrop-filter: blur(10px);

    border-top-left-radius: $border-radius;
    border-bottom-left-radius: $border-radius;

    overflow: auto;

    padding: 16px;

    box-sizing: border-box;
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