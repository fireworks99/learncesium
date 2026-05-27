<template>
  <div class="polygon_wrapper">
    <div class="header flex_center">
      <el-radio-group v-model="radio">
        <el-radio :label="1">度</el-radio>
        <el-radio :label="2">度分</el-radio>
        <el-radio :label="3">度分秒</el-radio>
      </el-radio-group>
      <div class="btns">
        <i class="el-icon-refresh-right" @click="resetPoint" style="font-size: 24px;"></i>
        <i class="el-icon-circle-plus-outline" @click="addPoint" style="font-size: 24px;" v-if="!fixed"></i>
        <i class="el-icon-circle-check" @click="confirmPoints" style="font-size: 24px;"></i>
      </div>
    </div>

    <div class="range_wrapper">

      <div class="range_row flex_center" v-for="(item, index) in selectedPoints" :key="index">

        <div class="range_item">
          <div class="text">经度: </div>

          <div class="other" v-if="radio === 1">
            <el-input v-model="item.lon1" clearable></el-input>
            <span class="unit">°</span>
          </div>

          <div class="other" v-if="radio === 2">
            <el-input v-model="item.lon1" clearable></el-input>
            <span class="unit">°</span>
            <el-input v-model="item.lon2" clearable></el-input>
            <span class="unit">′</span>
          </div>

          <div class="other" v-if="radio === 3">
            <el-input v-model="item.lon1" clearable></el-input>
            <span class="unit">°</span>
            <el-input v-model="item.lon2" clearable></el-input>
            <span class="unit">′</span>
            <el-input v-model="item.lon3" clearable></el-input>
            <span class="unit">″</span>
          </div>

        </div>

        <div class="range_item">
          <div class="text">纬度: </div>

          <div class="other" v-if="radio === 1">
            <el-input v-model="item.lat1" clearable></el-input>
            <span class="unit">°</span>
          </div>

          <div class="other" v-if="radio === 2">
            <el-input v-model="item.lat1" clearable></el-input>
            <span class="unit">°</span>
            <el-input v-model="item.lat2" clearable></el-input>
            <span class="unit">′</span>
          </div>

          <div class="other" v-if="radio === 3">
            <el-input v-model="item.lat1" clearable></el-input>
            <span class="unit">°</span>
            <el-input v-model="item.lat2" clearable></el-input>
            <span class="unit">′</span>
            <el-input v-model="item.lat3" clearable></el-input>
            <span class="unit">″</span>
          </div>

        </div>

        <div class="remove-btn" @click="removePoint(index)" v-if="!fixed">
          <i class="el-icon-circle-close" style="font-size: 24px;"></i>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: "PolygonRange",
  props: {
    pointList: {
      type: Array,
      default: []
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      radio: 1,
      selectedPoints: [
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
      ]
    };
  },
  computed: {
    points() {
      return this.selectedPoints.filter(item => item.lon1 !== '' && item.lat1 !== '').map(item => {
        const lon = this._convertByFormats(item.lon1, item.lon2, item.lon3, this.radio, 1);
        const lat = this._convertByFormats(item.lat1, item.lat2, item.lat3, this.radio, 1);
        return [parseFloat(lon[0]), parseFloat(lat[0])];
      });
    }
  },
  watch: {
    radio: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return;
        this.selectedPoints = this.selectedPoints.map(item => {
          const lon = this._convertByFormats(item.lon1, item.lon2, item.lon3, oldVal, newVal);
          const lat = this._convertByFormats(item.lat1, item.lat2, item.lat3, oldVal, newVal);
          return {
            lon1: lon[0], lon2: lon[1], lon3: lon[2],
            lat1: lat[0], lat2: lat[1], lat3: lat[2]
          };
        });
      }
    },
    points(val) {
      this.$emit("update:pointList", val);
    }
  },
  mounted() {
    this.selectedPoints = [];
    this.pointList.forEach(item => {
      this.selectedPoints.push({ lon1: item[0], lon2: '', lon3: '', lat1: item[1], lat2: '', lat3: '' });
    })
  },
  beforeDestroy() {
    
  },
  methods: {
    addPoint() {
      this.selectedPoints.push({ lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' });
    },
    removePoint(index) {
      this.selectedPoints.splice(index, 1);
    },
    confirmPoints() {
      this.$emit("confirm");
    },
    resetPoint() {
      this.selectedPoints = [
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
        { lon1: '', lon2: '', lon3: '', lat1: '', lat2: '', lat3: '' },
      ];
      setTimeout(() => {
        // 等points计算完
        this.confirmPoints();
      });
    },

    _toDecimal(deg, min, sec) {
      if ((deg === '' || deg === null || deg === undefined) && (min === '' || min === null || min === undefined) && (sec === '' || sec === null || sec === undefined)) return null;
      const d = parseFloat(deg);
      const m = parseFloat(min);
      const s = parseFloat(sec);
      if (!isNaN(d) && (isNaN(m) || m === null) && (isNaN(s) || s === null)) return d;
      const degAbs = Math.abs(isNaN(d) ? 0 : d);
      const minVal = isNaN(m) ? 0 : m;
      const secVal = isNaN(s) ? 0 : s;
      const decimal = (degAbs) + (minVal / 60) + (secVal / 3600);
      return (d < 0 || (deg === '' && (min < 0 || sec < 0))) ? -decimal : decimal;
    },
    _fromDecimal(decimal, format) {
      if (decimal === null || decimal === '' || isNaN(decimal)) return ['', '', ''];
      const num = parseFloat(decimal);
      const sign = Math.sign(num) || 1;
      const abs = Math.abs(num);
      const deg = Math.floor(abs);
      const remMin = (abs - deg) * 60;
      const min = Math.floor(remMin);
      const sec = (remMin - min) * 60;
      if (format === 1) {
        return [num.toFixed(6).replace(/\.0+$/, '').replace(/(?<=\.[0-9]*?)0+$/, ''), '', ''];
      } else if (format === 2) {
        const degSigned = (sign < 0) ? -deg : deg;
        const minutes = ((abs - deg) * 60).toFixed(6).replace(/\.0+$/, '').replace(/(?<=\.[0-9]*?)0+$/, '');
        return [degSigned.toString(), minutes, ''];
      } else if (format === 3) {
        const degSigned = (sign < 0) ? -deg : deg;
        const minutes = min.toString();
        const seconds = sec.toFixed(4).replace(/\.0+$/, '').replace(/(?<=\.[0-9]*?)0+$/, '');
        return [degSigned.toString(), minutes, seconds];
      }
      return ['', '', ''];
    },
    _convertByFormats(a1, a2, a3, fromFormat, toFormat) {
      // values are strings
      // if fromFormat missing (e.g., initial load) assume fromFormat === toFormat
      if (!fromFormat) fromFormat = toFormat;
      let decimal = null;
      if (fromFormat === 1) {
        const v = a1;
        if (v === '' || v === null || v === undefined) return ['', '', ''];
        const parsed = parseFloat(v);
        if (isNaN(parsed)) return ['', '', ''];
        decimal = parsed;
      } else if (fromFormat === 2) {
        const deg = a1; const min = a2;
        if ((deg === '' || deg === null || deg === undefined) && (min === '' || min === null || min === undefined)) return ['', '', ''];
        const d = parseFloat(deg);
        const m = parseFloat(min);
        if (isNaN(d) && isNaN(m)) return ['', '', ''];
        decimal = this._toDecimal(d || 0, m || 0, 0);
      } else if (fromFormat === 3) {
        const deg = a1; const min = a2; const sec = a3;
        if ((deg === '' || deg === null || deg === undefined) && (min === '' || min === null || min === undefined) && (sec === '' || sec === null || sec === undefined)) return ['', '', ''];
        const d = parseFloat(deg);
        const m = parseFloat(min);
        const s = parseFloat(sec);
        if (isNaN(d) && isNaN(m) && isNaN(s)) return ['', '', ''];
        decimal = this._toDecimal(d || 0, m || 0, s || 0);
      }
      if (decimal === null || isNaN(decimal)) return ['', '', ''];
      return this._fromDecimal(decimal, toFormat);
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";

.polygon_wrapper {
  text-align: center;
  color: #97F3FF;

  .header {
    height: 24px;
    margin-bottom: 8px;

    .btns {
      margin-left: auto;
      position: absolute;
      /* 使其脱离文档流，不影响第一个元素的居中 */
      right: 0px;
      display: flex;
      gap: 16px;

      i {
        cursor: pointer;
      }
    }
  }

  .range_wrapper {
    max-height: 210px;
    overflow-y: auto;

    .range_row {
      gap: 8px;

      &:not(:first-child) {
        margin-top: 8px;
      }

      .range_item {
        display: flex;
        align-items: center;

        .text {
          white-space: nowrap;
          margin-right: 8px;
        }

        .other {
          display: flex;
          gap: 4px;
        }
      }

      .remove-btn {
        cursor: pointer;
      }
    }
  }
}
</style>

<style lang="scss">
body {
  .polygon_wrapper {
    .el-radio {
      margin-right: 12px;

      .el-radio__inner {
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>