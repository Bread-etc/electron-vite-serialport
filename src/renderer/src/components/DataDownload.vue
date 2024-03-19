<template>
  <div :class="$style.container">
    <div :class="$style.saveSetting">
      <span :class="$style.label">保存设置</span>
      <div :class="$style.functionArea">
        触发源: <select />
        写入频率: <select />
        <button @click="importFile">另存为</button>
        <button @click="writeXlsxFile">开始写入</button>
      </div>
    </div>
    <div :class="$style.selectArea">
      <span :class="$style.label">数据选择</span>
      <div :class="$style.selection">
        <div :class="$style.line">
            <span>ACC_X<input type="checkbox" v-model="variables['accx']"></span>
            <span>ACC_Y<input type="checkbox" v-model="variables['accy']"></span>
            <span>ACC_Z<input type="checkbox" v-model="variables['accz']"></span>
            <span>MAG_X<input type="checkbox" v-model="variables['magx']"></span>
            <span>MAG_Y<input type="checkbox" v-model="variables['magy']"></span>
            <span>MAG_Z<input type="checkbox" v-model="variables['magz']"></span>
        </div>
        <div :class="$style.line">
            <span>GYR_X<input type="checkbox" v-model="variables['gyrx']"></span>
            <span>GYR_Y<input type="checkbox" v-model="variables['gyry']"></span>
            <span>GYR_Z<input type="checkbox" v-model="variables['gyrz']"></span>
            <span>Angle_ROL<input type="checkbox" v-model="variables['rol']"></span>
            <span>Angle_PIT<input type="checkbox" v-model="variables['pit']"></span>
            <span>Angle_YAW<input type="checkbox" v-model="variables['yaw']"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const { ipcRenderer } = require('electron');
const { Serialport } = require('serialport');

const data: any = ref();
const variables = {};

const variablesNames = ['accx', 'accy', 'accz', 'magx', 'magy', 'magz','gyrx', 'gyry', 'gyrz', 'rol', 'pit', 'yaw'];
for (const name of variablesNames) {
  variables[name] = ref(1);
}

// // 从串口读取指定文件
// const readData = async () => {
//   try {

//   }
// };


// 创建文件
const importFile = async () => {
    try {
        await ipcRenderer.invoke('saveFile', data.value, {
            title: "Save as",
            buttonLabel: "另存为",
            defaultPath: 'C:\/Users\/Lenovo PC\/Desktop\/DATA.xlsx',
            filters: [{
                name: 'All Files',
                extensions: ['*']
            }]
        })
    } catch (e) {
        console.error(e);
    }
};

// 写入xlsx文件
// const writeXlsxFile = async () => {
//   try {
     
//   }
// };
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
