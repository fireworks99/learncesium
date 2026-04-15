// 这是转换十进制经纬度为度、分、秒的函数
export function decimalToDMS(decimalDegree, flag = 0) {//1: E/W, 2: N/S
  typeof decimalDegree !== 'number' && (decimalDegree = parseFloat(decimalDegree));
  const degrees = Math.floor(decimalDegree); // 获取度
  const minutesFloat = (decimalDegree - degrees) * 60; // 计算分的十进制数
  const minutes = Math.floor(minutesFloat); // 获取分
  const seconds = ((minutesFloat - minutes) * 60).toFixed(0);
  if (flag) {
    if (degrees >= 0) {
      return `${degrees}° ${minutes}′ ${seconds}″${flag === 1 ? 'E' : (flag === 2 ? 'N' : '')}`;
    } else {
      return `${-degrees}° ${minutes}′ ${seconds}″${flag === 1 ? 'W' : (flag === 2 ? 'S' : '')}`;
    }
  } else {
    return `${degrees}° ${minutes}′ ${seconds}″`;
  }
}
