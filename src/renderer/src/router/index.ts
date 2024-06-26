import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "serial",
    component: () => import("@renderer/components/Serial.vue"),
  },
  {
    path: "/dataWave",
    name: "dataWave",
    component: () => import("@renderer/components/DataWave.vue"),
  },
  {
    path: "/pid",
    name: "pid",
    component: () => import("@renderer/components/PID.vue"),
  },
  {
    path: "/excel",
    name: "excel",
    component: () => import("@renderer/components/DataDownload.vue"),
  }
];

// 定义路由器
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;