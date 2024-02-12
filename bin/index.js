const fs = require("fs");
const xml2js = require("xml2js");
const { decimalToHex } = require("./zhuz_js_sdk/color.js");
const { xmlFilderPath } = require("./config.js");
const Path = require("path");

function getDirList(dir) {
  return new Promise((r, j) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw new Error("读取目录失败!");
      }
      r(files);
    });
  });
}

function getXmlContent(xmlpath_) {
  return new Promise((resolve, reject) => {
    fs.readFile(xmlpath_, "utf-8", (err, data) => {
      if (err) {
        console.error("读取文件失败:", err);
        reject(false);
        return;
      }
      // 使用 xml2js 解析 XML 数据
      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        if (err) {
          console.error("解析 XML 失败:", err);
          reject(false);
          return;
        }
        // 打印解析后的 JSON 数据
        resolve(result);
      });
    });
  });
}

function riteJsonFile(data, wrpath) {
  // 将 JavaScript 对象转换为压缩成一行的 JSON 字符串
  const jsonData = JSON.stringify(data, null, 0);

  // 将 JSON 字符串写入文件
  fs.writeFile(wrpath, jsonData, "utf8", (err) => {
    if (err) {
      console.error("写入文件失败:", err);
      return;
    }

    console.log(`数据已写入到 ${wrpath} 文件`);
  });
}

function getMode(type) {
  switch (type) {
    case "1":
      return "scroll";
    case "4":
      return "bottom";
    case "5":
      return "top";
    default:
      return "scroll";
  }
}

function getDanmuList(data) {
  let result = [];
  for (let k = 0, len = data.length; k < len; k++) {
    const item = data[k];
    const ar = item["$"].p.split(",");
    // if (k === 0) {
    //   console.log(ar);
    // }
    result.push({
      //弹幕持续显示时间,毫秒(最低为5000毫秒)
      // duration: 10000,
      moveV: 70, // 弹幕匀速移动速度(单位: px/秒)，设置该项时duration无效
      id: k,
      start: ar[0] * 1000, //弹幕出现时间，毫秒
      prior: false, //该条弹幕优先显示，默认false
      color: true, //该条弹幕为彩色弹幕，默认false
      txt: item["_"], //弹幕文字内容
      style: {
        color: decimalToHex(ar[3]), // 弹幕颜色
        fontSize: Number(ar[2]) + 10 + "px", // 字体大小
      },
      mode: getMode(ar[5]), //显示模式，top顶部居中，bottom底部居中，scroll滚动，默认为scroll
    });
  }
  return result;
}

async function run() {
  const files = await getDirList("./xml");
  for (let k = 0, len = files.length; k < len; k++) {
    const item = files[k];
    const result = await getXmlContent(xmlFilderPath + "/" + item);
    const newData = getDanmuList(result.i.d);
    const filename = Path.parse(item).name;
    riteJsonFile(newData, `./json/${filename}.json`);
  }
}

run();
