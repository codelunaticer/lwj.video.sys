<template>
  <div class="player_page">
    <div class="content_container">
      <div v-show="!loading" id="mse">
        <div id="rotate_box"></div>
      </div>
      <div v-show="loading" class="mse_mask">播放器创建中...</div>
      <div class="back_btn">
        <button @click="back">回到首页</button>
      </div>
      <div v-if="chlid.length > 1" class="jishulist">
        <div
          v-for="(item, index) in chlid"
          @click="switchPlayer(item, index)"
          :key="item.name"
          class="j_item"
          :class="currentNum == index ? 'active' : ''"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div style="color: #ffce47; font-size: 10px">
      !全屏观看时请开启手机的自动旋转<span style="color: #db5028">
        (如果不看弹幕可以不用管)
      </span>
      , 然后将手机放正一次,否则弹幕会重叠<span style="color: #db5028">
        (之后就不用管了,如果再重叠再放正)
      </span>
    </div>
    <div v-show="loading" class="page_mask">
      <div>加载中...</div>
      <div>{{ timeNum }}秒</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Player, { Events } from "xgplayer";
import "xgplayer/dist/index.min.css";
// @ts-ignore
import Danmu from "xgplayer/es/plugins/danmu";
import "xgplayer/es/plugins/danmu/index.css";
import { fetchGet } from "../../zhuz_ts_sdk/fetch";
import HlsPlugin from "xgplayer-hls";
import router from "../../router/router";

const localData = JSON.parse(
  localStorage.getItem("sdfwerwr") || JSON.stringify({})
);
//@ts-ignore
const poster = localData.dataItem.poster;
const chlid = ref(localData.dataItem.urls);
const player: any = ref(null);
const loading = ref(true);
const timeNum = ref(0);
const currentNum = ref(0);

let timer: any = null;
openTimer();
function openTimer() {
  loading.value = true;
  timer = setInterval(() => {
    timeNum.value++;
  }, 1000);
}
function closeTimer() {
  if (timer) {
    clearInterval(timer);
    timeNum.value = 0;
    timer = null as any;
    loading.value = false;
  }
}

function back() {
  router.push("/");
}

async function getDanmuDataApi(danmupath: any) {
  let danmulist: any = [];
  if (danmupath) {
    danmulist = await fetchGet(danmupath);
  }
  return danmulist;
}

async function switchPlayer(item: any, index: any) {
  openTimer();
  const danmuInstance = player.value.getPlugin("danmu");
  const newDanm = await getDanmuDataApi(item.danmufile);
  danmuInstance.updateComments(newDanm, true);
  player.value.switchURL(item.url);
  closeTimer();
  setTimeout(() => {
    player.value.seek(1);
    currentNum.value = index;
  }, 1000);
}

onMounted(() => {
  getDanmuDataApi(chlid.value[0].danmufile).then((danmulist) => {
    _initPlayer(danmulist, localData.dataItem.islive, chlid.value[0].url);
  });
});

let isFull = ref(false);

function _initPlayer(danmulist: any, isLive: any, url: any) {
  let plugins = [Danmu];
  if (isLive) {
    plugins.push(HlsPlugin);
  }
  player.value = new Player({
    id: "mse",
    url: url,
    poster,
    height: "50vh",
    isLive: isLive || false,
    hls: {
      targetLatency: 10, // 直播目标延迟，默认 10 秒
      maxLatency: 20, // 直播允许的最大延迟，默认 20 秒
      disconnectTime: 0, // 直播断流时间，默认 0 秒，（独立使用时等于 maxLatency）
      fetchOptions: {
        // 该参数会透传给 fetch，默认值为 undefined
        mode: "cors",
      },
    },
    width: "80%",
    "x5-video-player-type": "h5",
    "x5-video-orientation": "landscape",
    "x5-video-player-fullscreen": true,
    plugins: plugins,
    danmu: {
      comments: danmulist,
      area: {
        //弹幕显示区域
        start: 0, //区域顶部到播放器顶部所占播放器高度的比例
        end: 0.5, //区域底部到播放器顶部所占播放器高度的比例
        lines: undefined,
      },
      closeDefaultBtn: isLive, // 是否禁用弹幕开关
      defaultOff: false, //是否初始化弹幕
    },
    miniprogress: true,
    controls: {
      initShow: true,
    },
    closeVideoClick: true, //是否单击播放器区域切换播放/暂停
    fullscreen: {
      needBackIcon: true, // 返回功能
      // rotateFullscreen: true,
      // useCssFullscreen: true,
      switchCallback: () => {
        if (isFull.value) {
          document.exitFullscreen();
          setTimeout(() => {
            player.value.exitFullscreen();
            isFull.value = false;
          }, 500);
        } else {
          document.documentElement.requestFullscreen();
          setTimeout(() => {
            player.value.getRotateFullscreen();
          }, 500);
        }
      },
    },
    ignores: ["rotate"],
    enableContextmenu: true, // 禁用右键
    rotate: {
      disable: true,
      // index: -9,
    },
  });
  // 监听网页全屏(即页面全屏)也是一样的逻辑
  player.value.on(Events.FULLSCREEN_CHANGE, (isFullscreen: any) => {
    isFull.value = isFullscreen;
  });
  // 播放器创建video完成，可以开始播放
  player.value.on(Events.COMPLETE, () => {
    loading.value = false;
    console.log("播放器初始化完成");
    closeTimer();
  });
}
</script>
<style>
html {
  background-color: #272822;
}
</style>
<style lang="scss" scoped>
.player_page {
  .page_mask {
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
    height: 99vh;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 30px;
    font-weight: bold;
    flex-direction: column;
    background-color: rgba(128, 128, 128, 0.7);
    z-index: 99;
    user-select: none;
  }
  .mse_mask {
    height: 50vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 70;
    color: #2879ff;
    font-size: 3vw;
  }
  .content_container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .back_btn {
    padding: 20px;
    button {
      font-size: 3vw;
      background-color: teal;
    }
  }
  .jishulist {
    display: flex;
    flex-wrap: wrap;
    margin-top: 30px;
    margin-left: 30px;
    gap: 30px;
    align-self: flex-start;
    justify-content: flex-start;
    .active {
      background-color: gray !important;
    }
    .j_item {
      padding: 1vw;
      border-radius: 10%;
      background-color: teal;
      user-select: none;
    }
  }
  :deep(xg-danmu) {
    div {
      font-size: 30px !important;
    }
  }
}
/* 在 Web 端中 */
@media screen and (min-width: 769px) {
  .player_page {
    :deep(xg-danmu) {
      div {
        font-size: 20px !important;
      }
    }
  }
}
/* 在手机端（非 Web 端）中 */
@media screen and (max-width: 768px) {
  .player_page {
    :deep(xg-danmu) {
      div {
        font-size: 15px !important;
      }
    }
  }
}
</style>
