<template>
  <Layout :panel_show.sync="panel_show" title="矩形绘制-直接绘制">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="执行" name="exec">
        <div style="display: flex; align-items: center;">
          <div style="white-space: nowrap; margin: 0 16px;">经度范围</div>
          <el-input v-model="selectedSpace.minLon" size="small" clearable></el-input>
          <span style="margin: 0 16px;">至</span>
          <el-input v-model="selectedSpace.maxLon" size="small" clearable></el-input>
        </div>

        <div style="display: flex; align-items: center; margin-top: 8px;">
          <div style="white-space: nowrap; margin: 0 16px;">纬度范围</div>
          <el-input v-model="selectedSpace.minLat" size="small" clearable></el-input>
          <span style="margin: 0 16px;">至</span>
          <el-input v-model="selectedSpace.maxLat" size="small" clearable></el-input>
        </div>

        <div style="display: flex; align-items: center; margin-top: 8px; justify-content: end;">
          <el-button @click="clear">清除</el-button>
          <el-button @click="resetSelectedSpace">重置</el-button>
          <el-button type="primary" @click="confirmSelectedSpace">确定</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="代码" name="code">
        <CodeBrower :code="codeStr" language="javascript"/>
      </el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '../Layout.vue';
import CodeBrower from '../CodeBrower.vue';
import { mapState } from 'vuex';

export default {
  name: 'RectDirect',
  components: {
    Layout,
    CodeBrower
  },
  data() {
    return {
      panel_show: false,
      activeName: 'exec',
      selectedSpace: {
        minLon: '',
        maxLon: '',
        minLat: '',
        maxLat: ''
      },
      newRectEntity: null,
    }
  },
  computed: {
    ...mapState(['curSelect']),

    rangeObj() {
      const { minLon, maxLon, minLat, maxLat } = this.selectedSpace;

      // 检查是否有空值
      if (!minLon || !maxLon || !minLat || !maxLat) {
        return '';
      }

      // 转换为数字
      const minLonNum = parseFloat(minLon);
      const maxLonNum = parseFloat(maxLon);
      const minLatNum = parseFloat(minLat);
      const maxLatNum = parseFloat(maxLat);

      // 检查是否为有效数字
      if (isNaN(minLonNum) || isNaN(maxLonNum) || isNaN(minLatNum) || isNaN(maxLatNum)) {
        return '';
      }

      // 检查经度范围是否有效（通常经度范围 -180 到 180）
      if (minLonNum < -180 || minLonNum > 180 || maxLonNum < -180 || maxLonNum > 180) {
        return '';
      }

      // 检查纬度范围是否有效（通常纬度范围 -90 到 90）
      if (minLatNum < -90 || minLatNum > 90 || maxLatNum < -90 || maxLatNum > 90) {
        return '';
      }

      // 检查 min 是否大于 max
      if (minLonNum > maxLonNum || minLatNum > maxLatNum) {
        return '';
      }

      return { minLonNum, maxLonNum, minLatNum, maxLatNum };
    },

    codeStr() {
      if(!this.rangeObj) {
        return `viewer.entities.add({
                  rectangle: {
                    coordinates: Cesium.Rectangle.fromDegrees(minLonNum, minLatNum, maxLonNum, maxLatNum),
                    material: Cesium.Color.WHITE.withAlpha(0.3),
                    height: 0,
                    outline: true,
                    outlineColor: Cesium.Color.RED,
                  }
                });`
      } else {
        const { minLonNum, maxLonNum, minLatNum, maxLatNum } = this.rangeObj;
        return `viewer.entities.add({
                  rectangle: {
                    coordinates: Cesium.Rectangle.fromDegrees(${minLonNum}, ${minLatNum}, ${maxLonNum}, ${maxLatNum}),
                    material: Cesium.Color.WHITE.withAlpha(0.3),
                    height: 0,
                    outline: true,
                    outlineColor: Cesium.Color.RED,
                  }
                });`
      }
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-rect-direct" && (this.panel_show = true);
    }
  },

  mounted() {

  },

  beforeDestroy() {
    this.clear();
  },

  methods: {
    // 重置手填范围
    resetSelectedSpace() {
      this.selectedSpace = {
        minLon: '',
        maxLon: '',
        minLat: '',
        maxLat: ''
      };
    },

    clear() {
      if(this.newRectEntity) {
        viewer.entities.remove(this.newRectEntity);
        this.newRectEntity = null;
      }
    },

    // 确认手填范围
    confirmSelectedSpace() {
      if (!this.rangeObj) {
        this.$message.warning("手填范围无效，请重新填写");
        return;
      }

      const { minLonNum, maxLonNum, minLatNum, maxLatNum } = this.rangeObj;

      this.clear();

      this.newRectEntity = viewer.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(minLonNum, minLatNum, maxLonNum, maxLatNum),
          material: Cesium.Color.WHITE.withAlpha(0.3),
          height: 0,
          outline: true,
          outlineColor: Cesium.Color.RED,
        }
      });
    },
  }// methods end
}
</script>