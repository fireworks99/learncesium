import store from '@/store';

export default {
  name: 'dialogDrag',
  bind(el) {
    const headerEl = el.querySelector('.drag-header');
    if (!headerEl) return;

    headerEl.style.cursor = 'move';

    headerEl.onmousedown = (e) => {
      e.preventDefault();

      const parent = e.target.parentElement;
      const newZIndex = store.state.currMaxZIndex + 1;
      parent.style.zIndex = newZIndex;
      store.commit('SET_CURR_MAX_ZINDEX', newZIndex);

      const style = window.getComputedStyle(el);
      const startLeft = parseFloat(style.left) || 0;
      const startTop = parseFloat(style.top) || 0;
      const startX = e.clientX;
      const startY = e.clientY;

      const elWidth = el.offsetWidth;
      const elHeight = el.offsetHeight;

      // 拖动前设置为 absolute
      el.style.position = 'absolute';
      el.style.margin = 0;
      el.style.right = 'auto'; // 确保只用 left/top 定位

      const onMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 新的 left/top 值
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;

        // 浏览器窗口宽高
        const maxLeft = window.innerWidth - elWidth;
        const maxTop = window.innerHeight - elHeight;

        // 限制边界
        newLeft = Math.min(Math.max(0, newLeft), maxLeft);
        newTop = Math.min(Math.max(0, newTop), maxTop);

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

};
