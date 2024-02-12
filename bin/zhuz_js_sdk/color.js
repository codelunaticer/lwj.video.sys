// 将十进制颜色值转换为十六进制颜色表示
exports.decimalToHex = function (decimalColor) {
  // 使用 toString(16) 方法将十进制颜色值转换为十六进制字符串，并在左侧补零，确保输出的颜色表示为六位
  return "#" + ("000000" + decimalColor.toString(16)).slice(-6);
};
