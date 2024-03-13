import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "serial",
    meta: {
      title: "基本收发",
    },
    component: () => import("@renderer/components/Serial.vue"),
  },
  {
    path: "/dataWave",
    name: "dataWave",
    meta: {
      title: "数据波形",
    },
    component: () => import("@renderer/components/DataWave.vue"),
  },
  {
    path: "/flightControl",
    name: "flightControl",
    meta: {
      title: "飞控状态",
    },
    component: () => import("@renderer/components/FlightControl.vue"),
  },
  {
    path: "/pid",
    name: "pid",
    meta: {
      title: "飞控设置",
    },
    component: () => import("@renderer/components/PID.vue"),
  },
];

// 定义路由器
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;