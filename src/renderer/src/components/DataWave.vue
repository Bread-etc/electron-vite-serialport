<template>
  <div :class="$style.container">
    <div :class="$style.showArea">
      <div
        :class="$style.dataWaveForm"
        ref="info"
        style="width: 100%; height: 400px"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSerialPortInfo } from "@renderer/stores/modules/serialPortInfo";
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";

const serialPortInfo = useSerialPortInfo();
const receive = ref<string>("");

// 存储角度数据
const roll = ref<number>(0);
const pitch = ref<number>(0);
const yaw = ref<number>(0);
let readInterval: any = null;

// 组件内通信获取数据并进行处理
watch(serialPortInfo.$state, async(newState, _oldState) => {
  if(serialPortInfo.receive) {
    // 接收数据
    receive.value = newState.receive;
    const lines = receive.value.split('\n');
    const lastLine = lines[lines.length - 2].trim();
    const splitStringData = splitHexData(lastLine);
    const hexNumberData = hexStringTohexNumber(splitStringData);
    const angles = calculateAngles(hexNumberData);
    roll.value = angles[0];
    pitch.value = angles[1];
    yaw.value = angles[2];
  }
})

// echarts
const info = ref();
const data_rol: number[] = [];
const data_pit: number[] = [];
const data_yaw: number[] = [];

onMounted(() => {
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
  }
}
</style>
