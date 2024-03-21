<template>
  <div :class="$style.container">
    <div :class="$style.saveSetting">
      <span :class="$style.label">保存设置</span>
      <div :class="$style.functionArea">
        触发源:
        <select v-model="source">
          <option value="timer">timer</option>
        </select>
        写入频率:
        <select v-model="timer">
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
        <button @click="startWrite" v-show="!writing">开始写入</button>
        <button @click="stopWrite" v-show="writing">停止写入</button>
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
import { ref, reactive, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { createExcel } from '@renderer/utils/exportXlsx';
import { splitHexData, hexStringTohexNumber, calculateAngles } from '@renderer/utils/calcAngle';
import { useSerialPortInfo } from "@renderer/stores/modules/serialPortInfo";

// 使用串口和组件通信
const serialPortInfo = useSerialPortInfo();
const receive = ref<string>("");


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
let timer = ref<number>(500);
let source = ref<string>('timer');
let data: any[] = [];
const writing = ref<boolean>(false);
const message = useMessage();

const startWrite = async () => {
  writing.value = true;
  // 清空之前的数据
  data = [];
  // 读取数据
  const result = await readData() as any[];
  // 创建 Excel 文件
  createExcel('DATA.xlsx', 'dataSheet', result);
};

const stopWrite = () => {
  try {
    writing.value = false;
    message.success("写入成功！");
  } catch (error) {
    console.error("写入失败..", error);
  }
};

// 从串口读取指定数据
const readData = async () => {
  return new Promise((resolve, reject) => {
    try {
      let result: object[] = [];
      let startTime = new Date().getTime(); // 获取开始时间

      const intervalId = setInterval(async () => {
        try {
          let selectArr = [roll, pitch, yaw, accx, accy, accz, magx, magy, magz, gyrx, gyry, gyrz];
          let selectedNames = selectArr.filter(item => item.chosen === true);
          let formattedData = {};

          // 构造带有时间戳的数据对象
          const timestamp = Math.floor((new Date().getTime() - startTime));  // 获取毫秒数
          formattedData['timestamp'] = `${timestamp}ms`;
          selectedNames.forEach(item => {
            formattedData[item.name] = item.value;
          })
          // 添加数据到result中
          result.push(formattedData);

          if (!writing.value) {
            // 停止写入
            clearInterval(intervalId);
            resolve(result);
          }
        } catch (error) {
          console.error("读取数据时出错:", error);
        }
      }, timer.value);
    } catch (error) {
      reject(error);
    }
  });
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
