<template>
  <div class="video_page">
    <div class="list">
      <div
        v-for="item in videolist"
        @click="gotoPlayer(item)"
        :key="item.id"
        class="list-item"
      >
        <div class="fengMian">
          <img v-if="item.poster" :src="item.poster" alt="" />
          <div v-else class="mask_fen">
            {{ item.title }}
          </div>
          <div class="jishu">
            {{ item.jishu }}
          </div>
          <div v-if="item.zuoshang" class="zuoshang">{{ item.zuoshang }}</div>
          <div v-if="item.youshang" class="youshang">{{ item.youshang }}</div>
        </div>
        <div class="title">
          {{ item.title }}
        </div>
        <div class="title_sub">
          {{ item.title_sub }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { fetchGet } from "../../zhuz_ts_sdk/fetch";
import router from "../../router/router";

const videolist: any = ref([]);
function gotoPlayer(item: any) {
  localStorage.setItem(
    "sdfwerwr",
    JSON.stringify({
      dataItem: item,
    })
  );
  router.push("/playeritem");
}

async function getVideolistApi() {
  const result = await fetchGet(
    //@ts-ignore
    window.lwj.ip + "/temp/videolist.json"
  );
  let newr = [];
  for (let k = 0, len = result.length; k < len; k++) {
    const item = result[k];
    if (item.poster) {
      // @ts-ignore
      item.poster = window.lwj.ip + item.poster;
    }
    item.urls = item.urls.map((v) => {
      if (v.danmufile) {
        // @ts-ignore
        v.danmufile = window.lwj.ip + v.danmufile;
      }
      return v;
    });
    newr.push(item);
  }
  videolist.value = newr;
}

getVideolistApi();
</script>

<style>
html {
  background-color: #272822;
}
</style>

<style lang="scss" scoped>
.video_page {
  color: white;
  .list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px; /* 列与列之间的间隙 */
    .list-item {
      width: 40vw;
      height: 35vw;
      overflow: hidden;
      border-radius: 6px;
      .fengMian {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 6px;
        height: 25vw;
        img {
          width: 100%;
          height: 100%;
        }
        .mask_fen {
          width: 100%;
          height: 100%;
          background-color: #505050;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 7vw;
        }
        .jishu {
          position: absolute;
          bottom: 3px;
          right: 3px;
          font-size: 3vw;
          background-color: rgba(128, 128, 128, 0.6);
        }
        .zuoshang {
          position: absolute;
          top: 0;
          left: 0;
          padding: 0 3px 3px 0;
          font-size: 3vw;
          background-color: #3c3c3c;
        }
        .youshang {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0 0 3px 3px;
          font-size: 3vw;
          background-color: #ed643a;
        }
      }
      .title {
        font-size: 3vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title_sub {
        font-size: 3vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .list-item:nth-child(odd):last-child {
      transform: translateX(-20.5vw);
    }
  }
}
</style>
