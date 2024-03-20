<template>
  <div :class="$style.container">
    <div :class="$style.saveSetting">
      <span :class="$style.label">保存设置</span>
      <div :class="$style.functionArea">
        触发源: <select />
        写入频率: <select />
        <button @click="writeXlsxFile">开始写入</button>
      </div>
    </div>
    <div :class="$style.selectArea">
      <span :class="$style.label">数据选择</span>
      <div :class="$style.selection">
        <div :class="$style.line">
            <span>{{ accx.name }}<input type="checkbox" v-model="accx.chosen"></span>
            <span>{{ accy.name }}<input type="checkbox" v-model="accy.chosen"></span>
            <span>{{ accz.name }}<input type="checkbox" v-model="accz.chosen"></span>
            <span>{{ magx.name }}<input type="checkbox" v-model="magx.chosen"></span>
            <span>{{ magy.name }}<input type="checkbox" v-model="magy.chosen"></span>
            <span>{{ magz.name }}<input type="checkbox" v-model="magz.chosen"></span>
        </div>
        <div :class="$style.line">
            <span>{{ gyrx.name }}<input type="checkbox" v-model="gyrx.chosen"></span>
            <span>{{ gyry.name }}<input type="checkbox" v-model="gyry.chosen"></span>
            <span>{{ gyrz.name }}<input type="checkbox" v-model="gyrz.chosen"></span>
            <span>{{ roll.name }}<input type="checkbox" v-model="roll.chosen"></span>
            <span>{{ pitch.name }}<input type="checkbox" v-model="pitch.chosen"></span>
            <span>{{ yaw.name }}<input type="checkbox" v-model="yaw.chosen"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, reactive, watch } from 'vue';
import { exportExcel } from '@renderer/utils/exportXlsx';
import { useSerialPortInfo } from "@renderer/stores/modules/serialPortInfo";

// 使用串口和组件通信
const serialPortInfo = useSerialPortInfo();
const receive = ref<string>("");


const data: any = [
  {
    id: 1, name: 'zhangsan', age: 16
  },
  {
    id: 2, name: 'lisi', age: 18
  },
  {
    id: 3, name: 'wangwu', age: 20
  }
];

// 存储各类数据以及动态绑定选项
const roll = reactive({ value: 0, chosen: false, name: "Angle_ROL"});
const pitch = reactive({ value: 0, chosen: false, name: "Angle_PIT" });
const yaw = reactive({ value: 0, chosen: false, name: "Angle_YAW" });
const accx = reactive({ value: 0, chosen: false, name: "ACC_X" });
const accy = reactive({ value: 0, chosen: false, name: "ACC_Y" });
const accz = reactive({ value: 0, chosen: false, name: "ACC_Z" });
const magx = reactive({ value: 0, chosen: false, name: "MAG_X" });
const magy = reactive({ value: 0, chosen: false, name: "MAG_Y" });
const magz = reactive({ value: 0, chosen: false, name: "MAG_Z" });
const gyrx = reactive({ value: 0, chosen: false, name: "GYR_X" });
const gyry = reactive({ value: 0, chosen: false, name: "GYR_Y" });
const gyrz = reactive({ value: 0, chosen: false, name: "GYR_Z" });
let readInterval: any = null;

// 从串口读取指定数据
const readData = async () => {
  try {
    let selectArr = [roll, pitch, yaw, accx, accy, accz, magx, magy, magz, gyrx, gyry, gyrz];
    // 返回选定的数组
    const selectedNames = selectArr.filter((item, _index, _array) => {
      return item.chosen === true;
    });
    console.log(selectedNames);

  } catch(err) {
    throw err;
  }
};


// 写入xlsx文件
const writeXlsxFile = () => {
  readData();
  const fields = ['name', 'gender', 'age'];
  const headers = ['姓名', '性别', '年龄'];

  exportExcel(data, fields, headers, 'DATA.xlsx', 'dataSheet');
};

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

// 定时器获取数据
readInterval = setInterval(() => {
  console.log(roll.value, pitch.value, yaw.value);
}, 500)

// 组件卸载销毁定时器
onUnmounted(() => {
  clearInterval(readInterval);
})
</script>

<style module>
.container {
  display: flex;
  flex-direction: column;

  .saveSetting {
    width: 100%;
    display: flex;
    flex-direction: column;

    .label {
      min-width: 20%;
      display: block;
      left: 0%;
      font-weight: bold;
    }

    .functionArea {
        margin-top: .5rem;
        width: 100%;
        display: flex;
        flex-direction: row;

        select {
            width: 20%;
            margin: 0 .5rem;
        }

        button {
            margin-left: .8rem;
        }
    }
  }

  .selectArea {

    margin-top: .5rem;

    .label {
      min-width: 20%;
      display: block;
      left: 0%;
      font-weight: bold;
    }

    .selection {
        margin-top: .5rem;
        display: flex;
        flex-direction: row;

        .line {
            width: 30%;
            display: flex;
            flex-direction: column;
            align-items: left;

            span {
                display: flex;
                flex-direction: row;
                justify-items: center;
            }
        }
    }
  }
}
</style>
