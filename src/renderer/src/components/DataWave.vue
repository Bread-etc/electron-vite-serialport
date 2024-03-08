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
import { onMounted, onUnmounted, ref } from "vue";
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
      const hexData = Buffer.from(data).toString('hex');
      const splitStringData = splitHexData(hexData);
      const hexNumberData = hexStringTohexNumber(splitStringData);
      const angles = calculateAngles(hexNumberData);

      roll.value = angles[0];
      pitch.value = angles[1];
      yaw.value = angles[2];
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
  const userEc = echarts.init(infoEl);

  let option = {
    // 图例
    legend: {
      top: 0,
      left: 30,
    },
    // 横坐标
    xAxis: {
      type: "category",
      interval: 0.5, // 设置坐标轴刻度间隔为500ms
    },
    // 纵坐标
    yAxis: {
      type: "value",
      min: 0, // 设置纵坐标最小值为-180
      max: 8, // 设置纵坐标最大值为180
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
function splitHexData(hexData: string): [[string, string], [string, string], [string, string]] {
  const startIndex = hexData.indexOf('aaaa0106');
  if (startIndex !== -1) {
    const group1 = hexData.substring(startIndex + 8, startIndex + 12);
    const group2 = hexData.substring(startIndex + 12, startIndex + 16);
    const group3 = hexData.substring(startIndex + 16, startIndex + 20);

    const splitGroups = (group: string): [string, string] => {
      return [group.substring(0, 2), group.substring(2, 4)];
    };

    return [splitGroups(group1), splitGroups(group2), splitGroups(group3)];
  }
  return [["00", "00"], ["00", "00"], ["00", "00"]];
}

// 添加0x, 转换为16进制
function hexStringTohexNumber(hexStringList: [[string, string], [string, string], [string, string]]): [[number, number], [number, number], [number, number]] {
  const insertStr = (singleStringList: [string, string]): [string, string] => {
    const head: string = "0x";
    return [head.concat(singleStringList[0]), head.concat(singleStringList[1])];
  };

  hexStringList = [insertStr(hexStringList[0]), insertStr(hexStringList[1]), insertStr(hexStringList[2])];

  const hexStrToNumber = (singleHexString: [string, string]): [number, number] => {
    return [parseInt(singleHexString[0], 16), parseInt(singleHexString[1], 16)];
  };

  return [hexStrToNumber(hexStringList[0]), hexStrToNumber(hexStringList[1]), hexStrToNumber(hexStringList[2])];
}

// 计算角度
function calculateAngles(groups: [[number, number], [number, number], [number, number]]): [number, number, number] {
  const angle = (group: [number, number]): number => {
    return ((group[0] << 8) + group[1]) / 100;
  };
  return [angle(groups[0]),angle(groups[1]), angle(groups[2])];
}

// 组件卸载销毁定时器
onUnmounted(() => {
  clearInterval(readInterval);
})
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
