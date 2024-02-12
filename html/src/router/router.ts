import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "video",
    component: () => import("../view/video/video.vue"),
  },
  {
    path: "/playeritem",
    name: "plaueritme",
    component: () => import("../view/video/video_item.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
