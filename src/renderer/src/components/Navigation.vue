<template>
  <div>
    <ul>
      <li v-for="item in guideList" @click="directTo(item.url)">
        <n-icon v-html="item.icon" size="24px" depth="2" :class="$style.icon" />
        {{ item.name }}
      </li>
    </ul>
    <div :class="$style.selectOptions">
      <div>
        <n-select
          size="tiny"
          :options="portOptions"
          placeholder="串口"
          @update:value="handlePortOption"
        />
      </div>
      <div style="margin-top: 0.5rem">
        <n-select
          size="tiny"
          :options="baudOptions"
          placeholder="波特率"
          @update:value="handleBaudRateOption"
        />
      </div>
      <div :class="$style.buttonGroups">
        <n-button
          @click="handleConnect"
          type="success"
          ghost
          size="tiny"
          style="font-weight: bold; font-size: 12px; width: 70%"
          v-show="!buttonState"
        >
          连接
        </n-button>
        <n-button
          @click="handleClose"
          type="success"
          ghost
          size="tiny"
          style="font-weight: bold; font-size: 12px; width: 70%"
          v-show="buttonState"
        >
          关闭
        </n-button>
        <n-button
          @click="handleSend"
          type="warning"
          ghost
          size="tiny"
          style="
            font-weight: bold;
            font-size: 12px;
            width: 70%;
            margin-top: 0.5rem;
          "
        >
          发送
        </n-button>
        <n-button
          @click="handleRefresh"
          type="info"
          ghost
          size="tiny"
          style="
            font-weight: bold;
            font-size: 12px;
            width: 70%;
            margin-top: 0.5rem;
          "
        >
          刷新串口
        </n-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { SerialPort } = require("serialport");
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { NIcon, NSelect, NButton, useMessage } from "naive-ui";
import { useSerialPortInfo } from "../stores/modules/serialPortInfo";

const guideList = [
  {
    name: "基本收发",
    url: "/",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M4.25 4A2.25 2.25 0 0 0 2 6.25v11.5A2.25 2.25 0 0 0 4.25 20h15.5A2.25 2.25 0 0 0 22 17.75V6.25A2.25 2.25 0 0 0 19.75 4H4.25zm1.496 4.994A7.254 7.254 0 0 1 13 16.248a.75.75 0 1 1-1.5 0a5.754 5.754 0 0 0-5.754-5.754a.75.75 0 0 1 0-1.5zm-.75 3.757a.75.75 0 0 1 .75-.75a4.247 4.247 0 0 1 4.247 4.247a.75.75 0 0 1-1.5 0A2.747 2.747 0 0 0 5.746 13.5a.75.75 0 0 1-.75-.75zm2 3.245a.998.998 0 1 1-1.996 0a.998.998 0 0 1 1.996 0z" fill="currentColor"></path></g></svg>',
  },
  {
    name: "数据波形",
    url: "/dataWave",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M3 3.75a.75.75 0 0 1 1.5 0V19.5h15.75a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75V3.75zm16.5 3a.75.75 0 0 0-1.2-.6l-5.6 4.2l-3.82-2.246a.75.75 0 0 0-.715-.025L5.5 9.411V18.5h14V6.75z" fill="currentColor"></path></g></svg>',
  },
  {
    name: "飞控状态",
    url: "/flightControl",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M21.989 11.946a1.991 1.991 0 0 1-2.05 1.99l-4.738-.139l-3.454 7.143c-.277.574-.86.94-1.498.94a.926.926 0 0 1-.92-1.037l.863-7.193l-3.765-.11l-.49 1.341a1.29 1.29 0 0 1-1.211.847a.901.901 0 0 1-.901-.902V13.35l-.81-.169a1.261 1.261 0 0 1 0-2.469l.81-.168V9.066c0-.46.343-.838.788-.894l.113-.007a1.29 1.29 0 0 1 1.21.846l.492 1.34l3.751-.11l-.85-7.084a.93.93 0 0 1-.004-.055l-.002-.055c0-.511.415-.926.926-.926c.585 0 1.123.307 1.423.8l.075.14l3.403 7.035l4.79-.14a1.991 1.991 0 0 1 2.048 1.932v.058z" fill="currentColor"></path></g></svg>',
  },
  {
    name: "飞控设置",
    url: "/pid",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M6.75 3h-1A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21H6v-6a2.25 2.25 0 0 1 2.25-2.25h7.353l1.788-1.788A3.28 3.28 0 0 1 19.713 10h.002c.437 0 .875.087 1.285.261V8.287a3.25 3.25 0 0 0-.952-2.299l-2.035-2.035A3.25 3.25 0 0 0 15.75 3v4.5a2.25 2.25 0 0 1-2.25 2.25H9A2.25 2.25 0 0 1 6.75 7.5V3zm7.353 11.25l-2.615 2.615a3.685 3.685 0 0 0-.969 1.712l-.458 1.83c-.05.202-.07.4-.062.593H7.5v-6a.75.75 0 0 1 .75-.75h5.853zM14.25 3v4.5a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75V3h6zm5.465 8h-.002c-.585 0-1.17.223-1.615.67l-5.902 5.902a2.684 2.684 0 0 0-.707 1.247l-.458 1.831a1.087 1.087 0 0 0 1.319 1.318l1.83-.457a2.684 2.684 0 0 0 1.248-.707l5.902-5.902A2.285 2.285 0 0 0 19.715 11z" fill="currentColor"></path></g></svg>',
  },
];

// 路由跳转
const router = useRouter();
async function directTo(url: string) {
  await router.push(`${url}`);
}

/** 串口通信 **/
const portChoose = ref<string>("");
const baudRateChoose = ref<number>();
const portOptions = ref<any[]>([]);
const baudOptions = ref<any[]>([
  {
    label: "9600",
    value: 9600,
  },
  {
    label: "115200",
    value: 115200,
  },
  {
    label: "500000",
    value: 500000,
  },
]);
const buttonState = ref<boolean>(false);
const message = useMessage();
let port: any = null;
// 组件内通信
const serialPortInfo = useSerialPortInfo();
const receive = ref<string>("");
const send = ref<string>("");

// 选择串口
function handlePortOption(value: string) {
  portChoose.value = value;
}
// 选择波特率
function handleBaudRateOption(value: number) {
  baudRateChoose.value = value;
}

// 连接串口
async function handleConnect() {
  if (portChoose.value && baudRateChoose.value) {
    port = new SerialPort({
      path: portChoose.value,
      baudRate: baudRateChoose.value,
      autoOpen: false,
    });
    port.open();
    // 读取数据
    port.on("data", (data) => {
      const hexData = Buffer.from(data).toString("hex"); // 将数据转换为16进制字符串
      receive.value += hexData + "\n";
      // 存储接受值到pinia中
      serialPortInfo.receive = receive.value;
    });
    message.success("串口已打开");
    buttonState.value = true;
    return;
  } else {
    message.error("未选择串口或波特率");
    return 0;
  }
}

// 关闭串口
function handleClose() {
  if (port) {
    port.close();
    message.success("串口已关闭");
    port = null;
  }
  buttonState.value = false;
}

// 发送信息
async function handleSend() {
  if (port) {
    // 发送十六进制
    send.value = serialPortInfo.send;
    const sendData = Buffer.from(send.value, "hex");
    await port.write(sendData);
    return;
  } else {
    message.error("串口未打开");
    return 0;
  }
}

// 刷新串口信息
function handleRefresh() {
  // 获取串口列表
  SerialPort.list()
    .then((ports) => {
      // 将结果转换为您想要的格式
      portOptions.value = ports.map((port) => ({
        label: port.path,
        value: port.path,
      }));
    })
    .catch((err: any) => {
      console.error("Error getting serial ports:", err);
    });
}

onMounted(() => {
  // 获取串口列表
  handleRefresh();
});
</script>

<style module>
ul {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 1rem 1rem;
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    font-weight: bold;
    cursor: pointer;
  }

  li:hover {
    color: gray;
    transition: color 0.5s ease-out;

    .icon {
      color: gray;
      transition: color 0.5s ease-out;
    }
  }

  .icon {
    margin-right: 8px;
  }
}

.selectOptions {
  font-size: small;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.5rem;

  .buttonGroups {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
    width: 100%;
  }
}
</style>
