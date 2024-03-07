<template>
  <div :class="$style.container">
    <div :class="$style.showArea">
      <div
        :class="$style.dataWaveForm"
        ref="info"
        style="width: 100%; height: 400px"
      ></div>
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
              width: 100%;
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
              width: 100%;
            "
            v-show="buttonState"
          >
            关闭
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSelect, NButton, useMessage } from "naive-ui";
const { SerialPort } = require("serialport");
import { onMounted, ref } from "vue";
import * as echarts from "echarts";

const message = useMessage();
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
  },
]);
const buttonState = ref<boolean>(false);
let port: any = null;

// 存储角度数据
const roll = ref<number>(0);
const pitch = ref<number>(0);
const yaw = ref<number>(0);
let readInterval: any = null;

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
      // 接收数据并且转换为16进制
      const hexData = Buffer.from(data).toString("hex"); // 将数据转换为16进制字符串
      const splitResult = splitHexData(hexData);
      const angles = calculateAngles(splitResult);

      roll.value = angles[0];
      pitch.value = angles[1];
      yaw.value = angles[2];
      console.log(angles);
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
    clearInterval(readInterval);
  }
  buttonState.value = false;
}

// echarts
const info = ref();
const data_rol: number[] = [];
const data_pit: number[] = [];
const data_yaw: number[] = [];

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

  // 渲染echarts
  const infoEl = info.value;
  const userEc = echarts.init(infoEl, "light");

  let option = {
    // 横坐标
    xAxis: {
      type: "category",
      interval: 0.5, // 设置坐标轴刻度间隔为500ms
    },
    // 纵坐标
    yAxis: {
      type: "value",
      min: -180, // 设置纵坐标最小值为-180
      max: 360, // 设置纵坐标最大值为180
      interval: 45, // 设置纵坐标刻度间隔为45度
    },

    // data
    series: [
      {
        name: "横滚角",
        type: "line",
        smooth: true,
        data: data_rol,
        
        // 高亮样式
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold',
          }
        }
      },
      {
        name: "俯仰角",
        type: "line",
        smooth: true,
        data: data_pit,
        
        // 高亮样式
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold',
          }
        }
      },
      {
        name: "偏航角",
        type: "line",
        smooth: true,
        data: data_yaw,
        
        // 高亮样式
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold',
          }
        }
      },
    ],
  };

  userEc.setOption(option);

  // 读取新数据
  readInterval = setInterval(function () {
    data_rol.push(roll.value);
    data_pit.push(pitch.value);
    data_yaw.push(yaw.value);
    userEc.setOption(option);
  }, 1000);
});

// 分割数据
function splitHexData(hexData: string) {
  const startIndex = hexData.indexOf('aaaa0106');
  if (startIndex !== -1) {
    const group1 = hexData.substring(startIndex + 8, startIndex + 10);
    const group2 = hexData.substring(startIndex + 10, startIndex + 12);
    const group3 = hexData.substring(startIndex + 12, startIndex + 14);

    const splitGroups = (group: string): [string, string] => {
      return [group.substring(0, 1), group.substring(1, 2)];
    };

    return [splitGroups(group1), splitGroups(group2), splitGroups(group3)];
  }
  return [['0', '0'], ['0', '0'], ['0', '0']];
}

// 计算角度
function calculateAngles(hexData: string[][]) {
  if (hexData && hexData.length === 3) {
    const calculateAngle = (high: string, low: string): number => {
      const highValue = parseInt(high, 16);
      const lowValue = parseInt(low, 16);
      return ((highValue << 8) + lowValue) / 100;
    };

    const angles: number[] = [];
    hexData.forEach(group => {
      if (group.length === 2) {
        const angle = calculateAngle(group[0], group[1]);
        angles.push(angle);
      }
    });
    return angles;
  }
  return [0,0,0];
}

</script>

<style module>
.container {
  display: flex;
  flex-direction: column;

  .showArea {
    width: 100%;
    display: flex;
    flex-direction: column;

    .dataWaveForm {
      font-size: large;
      display: flex;
    }

    .selectOptions {
      width: 80%;
      font-size: small;
      font-weight: bold;
      display: flex;
      flex-direction: row;
      margin-right: 1rem;

      .buttonGroups {
        width: 20%;
        display: flex;
        flex-direction: row;
      }
    }
  }
}
</style>
