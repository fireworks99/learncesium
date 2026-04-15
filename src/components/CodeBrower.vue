<template>
  <div class="code-preview">
    <div class="toolbar">
      <span class="lang">{{ language }}</span>
      <button @click="copyCode">复制</button>
    </div>
    <div style="max-height: 600px; overflow-y: auto;">
      <pre>
        <code ref="codeRef" :class="language"></code>
      </pre>
    </div>
  </div>
</template>

<script>
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { hljsLineNumbers } from '@/utils/highlight_line_number.js';
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

export default {
  name: "CodePreview",
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: "javascript"
    }
  },
  data() {
    return {
      formattedCode: ""
    };
  },
  watch: {
    code: {
      immediate: true,
      handler() {
        this.formatCode();
      }
    }
  },
  mounted() {
    hljsLineNumbers(window, document, hljs);
  },
  methods: {
    formatCode() {
      try {
        this.formattedCode = prettier.format(this.code, {
          parser: "babel",
          plugins: [parserBabel],
          tabWidth: 2,
          semi: true,
          singleQuote: true
        });
      } catch (e) {
        console.error(e);
        this.formattedCode = this.code;
      }

      this.$nextTick(() => this.highlight());
    },
    highlight() {
      const el = this.$refs.codeRef;
      if (!el) return;
      el.textContent = this.formattedCode;
      hljs.highlightElement(el);

      this.$nextTick(() => {
        hljs.lineNumbersBlock(el);
      });
    },
    copyCode() {
      navigator.clipboard.writeText(this.formattedCode)
        .then(() => this.$message.success("复制成功"))
        .catch(() => this.$message.error("复制失败"));
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

// ===== 组件样式 =====
.code-preview {
  border-radius: $border-radius;
  overflow: hidden;
  background: $background-color;
  box-shadow: $glow-shadow;
  border: 1px solid rgba(0, 175, 255, 0.3);

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 175, 255, 0.1);
    border-bottom: 1px solid rgba(0, 175, 255, 0.2);

    .lang {
      font-size: 12px;
      color: $text-secondary-color;
    }

    button {
      cursor: pointer;
      border: none;
      padding: 4px 10px;
      border-radius: $border-radius;
      background: $primary-gradient;
      color: $text-color;
      font-size: 12px;
      transition: all 0.2s;

      &:hover {
        box-shadow: $glow-shadow-strong;
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }

  pre {
    overflow-x: auto;
    background: transparent;
  }

  code {
    display: block;
    font-size: 13px;
    line-height: 1.6;
    color: $text-color;
  }

  // 可选：微调 highlight.js 默认颜色，使其更贴近你的主题
  :deep(.hljs) {
    background: transparent;
    color: $text-color;
  }

  :deep(.hljs-keyword),
  :deep(.hljs-selector-tag),
  :deep(.hljs-built_in) {
    color: $primary-color;
  }

  :deep(.hljs-string),
  :deep(.hljs-title),
  :deep(.hljs-name) {
    color: $success-color;
  }

  :deep(.hljs-comment) {
    color: $text-secondary-color;
    font-style: italic;
  }

  :deep(.hljs-number),
  :deep(.hljs-literal) {
    color: $warning-color;
  }



  /* for block of numbers */
  :deep(.hljs-ln-numbers) {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    text-align: center;
    color: #ccc;
    border-right: 1px solid #CCC;
    vertical-align: top;
    padding-right: 5px;

    /* your custom style here */
  }

  /* for block of code */
  :deep(.hljs-ln-code) {
    padding-left: 10px;
  }

}
</style>