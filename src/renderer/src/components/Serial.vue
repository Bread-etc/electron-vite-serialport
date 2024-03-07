<template>
  <div :class="$style.container">
    <div :class="$style.showArea">
      <textarea
        :class="$style.input"
        v-model="receive"
        type="textarea"
        placeholder="接收区"
        readonly
        style="min-height: 200px; max-height: 290px;"
      />
      <input
        :class="$style.input"
        v-model="send"
        placeholder="发送区"
      />
    </div>
    <div :class="$style.selectOptions">
      <div
        style="
          width: 100%;
          margin-right: 1rem;
          display: flex;
          flex-direction: row;
        "
      >
        <n-select
          size="tiny"
          :options="portOptions"
          placeholder="串口"
          @update:value="handlePortOption"
        />
      </div>
      <div
        style="
          width: 100%;
          margin-right: 1rem;
          display: flex;
          flex-direction: row;
        "
      >
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
          style="
            margin-left: 1rem;
            font-weight: bold;
            font-size: 12px;
            width: 70%;
          "
          v-show="!buttonState"
        >
          连接
        </n-button>
        <n-button
          @click="handleClose"
          type="success"
          ghost
          size="tiny"
          style="
            margin-left: 1rem;
            font-weight: bold;
            font-size: 12px;
            width: 70%;
          "
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
            margin-left: 1rem;
            font-weight: bold;
            font-size: 12px;
            width: 70%;
          "
        >
          发送
        </n-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSelect, NButton, useMessage } from "naive-ui";
const { SerialPort } = require("serialport");
import { onMounted, ref } from "vue";

const message = useMessage();
const send = ref<string>("");
const receive = ref<string>("");
// 串口和波特率
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
  }
]);
const buttonState = ref<boolean>(false);
let port: any = null;

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
    port = new SerialPort({ path: portChoose.value, baudRate: baudRateChoose.value, autoOpen: false });
    port.open();
    // 读取数据
    port.on('data', data => {
      const hexData = Buffer.from(data).toString('hex'); // 将数据转换为16进制字符串
      receive.value += hexData + '\n';
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
    // 编码中文字符
    // const sendData = iconv.encode(send.value, 'gbk');
    // 发送十六进制
    const sendData = Buffer.from(send.value, 'hex');
    await port.write(sendData);
    return;
  } else {
    message.error("串口未打开");
    return 0;
  }
}

onMounted(() => {
  // 获取串口列表
  SerialPort.list()
    .then((ports) => {
      // 将结果转换为您想要的格式
      portOptions.value = ports.map((port) => ({
        label: port.path,
        value: port.path,
      }));
    })
    .catch((err) => {
      console.error("Error getting serial ports:", err);
    });
});
</script>

<style module>
.container {
  display: flex;
  flex-direction: column;

  .showArea {
    .input {
      margin-bottom: .5rem;
      max-width: 90%;
      min-width: 90%;
      padding: 1rem;
    }
  }

  .selectOptions {
    width: 80%;
    font-size: small;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    margin-right: 1rem;

    .buttonGroups {
      display: flex;
      flex-direction: row;
    }
  }
}
</style>
