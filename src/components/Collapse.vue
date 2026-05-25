<template>
  <div class="collapse_wrapper">
    <div class="header" @click="fold = !fold">
      <div class="title">{{ title }}</div>
      <div class="right">
        <i class="el-icon-arrow-down" v-show="fold"></i>
        <i class="el-icon-arrow-up" v-show="!fold"></i>
      </div>
    </div>

    <div :class="['content', { fold }]">
      <slot></slot>
      <div style="height: 0.5rem;"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Collapse',

  props: {
    title: {
      type: String,
      required: false,
      default: ''
    }
  },

  data() {
    return {
      fold: true
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.collapse_wrapper {
  border: 1px solid $primary-color;
  border-radius: 0.5rem;

  .header {
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      color: #00afff;
    }
  }

  .content {
    padding: 0 0.5rem;
    max-height: 9999px;
    overflow: hidden;
    transition: all 0.1s linear;

    &.fold {
      max-height: 0;
    }
  }
}
</style>