<template>
  <div :class="$style.container">
    <div :class="$style.selectArea">
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">ROL速率</span>
        <input type="number" v-model="p1"/>
        <input type="number" v-model="i1"/>
        <input type="number" v-model="d1"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">PIT速率</span>
        <input type="number" v-model="p2"/>
        <input type="number" v-model="i2"/>
        <input type="number" v-model="d2"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">YAW速率</span>
        <input type="number" v-model="p3"/>
        <input type="number" v-model="i3"/>
        <input type="number" v-model="d3"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">自稳ROL</span>
        <input type="number" v-model="p4"/>
        <input type="number" v-model="i4"/>
        <input type="number" v-model="d4"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">自稳PIT</span>
        <input type="number" v-model="p5"/>
        <input type="number" v-model="i5"/>
        <input type="number" v-model="d5"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">自稳YAW</span>
        <input type="number" v-model="p6"/>
        <input type="number" v-model="i6"/>
        <input type="number" v-model="d6"/>
      </div>
    </div>
    <div :class="$style.selectArea">
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">高度速率</span>
        <input type="number" v-model="p7"/>
        <input type="number" v-model="i7"/>
        <input type="number" v-model="d7"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">高度保持</span>
        <input type="number" v-model="p8"/>
        <input type="number" v-model="i8"/>
        <input type="number" v-model="d8"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">位置速率</span>
        <input type="number" v-model="p9"/>
        <input type="number" v-model="i9"/>
        <input type="number" v-model="d9"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">位置保持</span>
        <input type="number" v-model="p10"/>
        <input type="number" v-model="i10"/>
        <input type="number" v-model="d10"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">PID11</span>
        <input type="number" v-model="p11"/>
        <input type="number" v-model="i11"/>
        <input type="number" v-model="d11"/>
      </div>
      <div :class="$style.simplePITSetting">
        <span :class="$style.label">PID12</span>
        <input type="number" v-model="p12"/>
        <input type="number" v-model="i12"/>
        <input type="number" v-model="d12"/>
      </div>
    </div>
  </div>
  <div :class="$style.buttonArea">
    <n-button icon-placement="left" strong size="large" color="#f25022" style="margin: 0 1rem;" @click="handleRead">
      <template #icon>
        <n-icon>
          <DrawerArrowDownload24Filled />
        </n-icon>
      </template>
      读取PID
    </n-button>
    <n-button icon-placement="left" strong size="large" color="#00a4ef" style="margin: 0 1rem;" @click="handleWrite">
      <template #icon>
        <n-icon>
          <DrawerAdd24Filled />
        </n-icon>
      </template>
      写入PID
    </n-button>
    <n-button icon-placement="left" strong size="large" color="#ffb900" style="margin: 0 1rem;" @click="handleRecover">
      <template #icon>
        <n-icon>
          <ApprovalsApp24Filled />
        </n-icon>
      </template>
      恢复默认
    </n-button>
  </div>
</template>

<script lang="ts" setup>
const { SerialPort } = require("serialport");
import { onUnmounted, ref } from "vue";
import { NButton, NIcon, useMessage } from "naive-ui";
import { ApprovalsApp24Filled, DrawerArrowDownload24Filled, DrawerAdd24Filled } from "@vicons/fluent";

// 交互模块
const message = useMessage();
const receive = ref<string>("");

// 定义多个变量
const p1 = ref(0), p2 = ref(0), p3 = ref(0), p4 = ref(0), p5 = ref(0), p6 = ref(0), p7 = ref(0), p8 = ref(0), p9 = ref(0), p10 = ref(0), p11 = ref(0), p12 = ref(0);
const i1 = ref(0), i2 = ref(0), i3 = ref(0), i4 = ref(0), i5 = ref(0), i6 = ref(0), i7 = ref(0), i8 = ref(0), i9 = ref(0), i10 = ref(0), i11 = ref(0), i12 = ref(0);
const d1 = ref(0), d2 = ref(0), d3 = ref(0), d4 = ref(0), d5 = ref(0), d6 = ref(0), d7 = ref(0), d8 = ref(0), d9 = ref(0), d10 = ref(0), d11 = ref(0), d12 = ref(0);
// 自动连接并且打开串口
const port: any = new SerialPort({ path: 'COM3', baudRate: 500000, autoOpen: true });

// 读取PID
async function handleRead() {
  if (port) {
    // 读取PID命令: aaaf020101015d
    const sendData = Buffer.from("AAAF020101015D", "hex");
    await port.write(sendData);
    // 解码收到的信息(隔300ms，防止收到错误信息)
    setTimeout(() => {
      const hexData = port.read().toString("hex");
      receive.value = hexData;
      const lastIndex = receive.value.lastIndexOf("aaaaef02025da4");
      if (lastIndex !== -1) {
        const pidString = receive.value.slice(lastIndex + "aaaaef02025da4".length)
        splitPid123(pidString);
        splitPid456(pidString);
        splitPid789(pidString);
        message.success("读取PID成功");
      }
    }, 300);
    return;
  } else {
    message.error("读取PID失败...");
    return 0;
  }
}

// 写入PID
async function handleWrite() {
  if (port) {
    // 构建发送的数据帧
    const frame1To3 = Buffer.from(buildFrame(p1, i1, d1, p2, i2, d2, p3, i3, d3, 10), "hex");
    const frame4To6 = Buffer.from(buildFrame(p4, i4, d4, p5, i5, d5, p6, i6, d6, 11), "hex");
    const frame7To9 = Buffer.from(buildFrame(p7, i7, d7, p8, i8, d8, p9, i9, d9, 12), "hex");
    await port.write(frame1To3);
    await port.write(frame4To6);
    await port.write(frame7To9);
    await handleRecover();
    message.success("写入PID成功");
    return;
  } else {
    message.error("写入PID失败...");
    return 0;
  }
}

// 恢复默认PID
function handleRecover() {
  p1.value = p2.value = p3.value = p4.value = p5.value = p6.value = p7.value = p8.value = p9.value = p10.value = p11.value = p12.value = 0;
  i1.value = i2.value = i3.value = i4.value = i5.value = i6.value = i7.value = i8.value = i9.value = i10.value = i11.value = i12.value = 0;
  d1.value = d2.value = d3.value = d4.value = d5.value = d6.value = d7.value = d8.value = d9.value = d10.value = d11.value = d12.value = 0;
}

// 分隔处理
function splitPid123(hexData: string) {
  // 功能字10
  const startIndex = hexData.indexOf('aaaa1012');
  if (startIndex !== -1) {
    const PID_P1 = hexData.substring(startIndex + 8, startIndex + 12);
    const PID_I1 = hexData.substring(startIndex + 12, startIndex + 16);
    const PID_D1 = hexData.substring(startIndex + 16, startIndex + 20);
    const PID_P2 = hexData.substring(startIndex + 20, startIndex + 24);
    const PID_I2 = hexData.substring(startIndex + 24, startIndex + 28);
    const PID_D2 = hexData.substring(startIndex + 28, startIndex + 32);
    const PID_P3 = hexData.substring(startIndex + 32, startIndex + 36);
    const PID_I3 = hexData.substring(startIndex + 36, startIndex + 40);
    const PID_D3 = hexData.substring(startIndex + 40, startIndex + 44);

    p1.value = parseInt(PID_P1, 16); p2.value = parseInt(PID_P2, 16); p3.value = parseInt(PID_P3, 16);
    i1.value = parseInt(PID_I1, 16); i2.value = parseInt(PID_I2, 16); i3.value= parseInt(PID_I3, 16);
    d1.value = parseInt(PID_D1, 16); d2.value = parseInt(PID_D2, 16); d3.value = parseInt(PID_D3, 16);
  }
}

function splitPid456(hexData: string) {
  // 功能字11
  const startIndex = hexData.indexOf('aaaa1112');
  if (startIndex !== -1) {
    const PID_P4 = hexData.substring(startIndex + 8, startIndex + 12);
    const PID_I4 = hexData.substring(startIndex + 12, startIndex + 16);
    const PID_D4 = hexData.substring(startIndex + 16, startIndex + 20);
    const PID_P5 = hexData.substring(startIndex + 20, startIndex + 24);
    const PID_I5 = hexData.substring(startIndex + 24, startIndex + 28);
    const PID_D5 = hexData.substring(startIndex + 28, startIndex + 32);
    const PID_P6 = hexData.substring(startIndex + 32, startIndex + 36);
    const PID_I6 = hexData.substring(startIndex + 36, startIndex + 40);
    const PID_D6 = hexData.substring(startIndex + 40, startIndex + 44);

    p4.value = parseInt(PID_P4, 16); p5.value = parseInt(PID_P5, 16); p6.value = parseInt(PID_P6, 16);
    i4.value = parseInt(PID_I4, 16); i5.value = parseInt(PID_I5, 16); i6.value = parseInt(PID_I6, 16);
    d4.value = parseInt(PID_D4, 16); d5.value = parseInt(PID_D5, 16); d6.value = parseInt(PID_D6, 16);
  }
}

function splitPid789(hexData: string) {
  // 功能字12
  const startIndex = hexData.indexOf('aaaa1212');
  if (startIndex !== -1) {
    const PID_P7 = hexData.substring(startIndex + 8, startIndex + 12);
    const PID_I7 = hexData.substring(startIndex + 12, startIndex + 16);
    const PID_D7 = hexData.substring(startIndex + 16, startIndex + 20);
    const PID_P8 = hexData.substring(startIndex + 20, startIndex + 24);
    const PID_I8 = hexData.substring(startIndex + 24, startIndex + 28);
    const PID_D8 = hexData.substring(startIndex + 28, startIndex + 32);
    const PID_P9 = hexData.substring(startIndex + 32, startIndex + 36);
    const PID_I9 = hexData.substring(startIndex + 36, startIndex + 40);
    const PID_D9 = hexData.substring(startIndex + 40, startIndex + 44);

    p7.value = parseInt(PID_P7, 16); p8.value = parseInt(PID_P8, 16); p9.value = parseInt(PID_P9, 16);
    i7.value = parseInt(PID_I7, 16); i8.value = parseInt(PID_I8, 16); i9.value = parseInt(PID_I9, 16);
    d7.value = parseInt(PID_D7, 16); d8.value = parseInt(PID_D8, 16); d9.value = parseInt(PID_D9, 16);
  }
}

// 帧插入处理
function buildFrame(fp, fi, fd, sp, si, sd, tp, ti, td, funNum) {
  // 将各个值转换为十六进制并确保每个十六进制数都是四位的
  const fpHex = fp.value.toString(16).padStart(4, '0');
  const fiHex = fi.value.toString(16).padStart(4, '0');
  const fdHex = fd.value.toString(16).padStart(4, '0');
  const spHex = sp.value.toString(16).padStart(4, '0');
  const siHex = si.value.toString(16).padStart(4, '0');
  const sdHex = sd.value.toString(16).padStart(4, '0');
  const tpHex = tp.value.toString(16).padStart(4, '0');
  const tiHex = ti.value.toString(16).padStart(4, '0');
  const tdHex = td.value.toString(16).padStart(4, '0');
  
  // 计算校验和
  const checksum = (0xAAAF + funNum + 18 +
                    parseInt(fpHex, 16) +
                    parseInt(fiHex, 16) +
                    parseInt(fdHex, 16) +
                    parseInt(spHex, 16) +
                    parseInt(siHex, 16) +
                    parseInt(sdHex, 16) +
                    parseInt(tpHex, 16) +
                    parseInt(tiHex, 16) +
                    parseInt(tdHex, 16)) & 0xFF;

  // 构建完整的数据帧字符串
  const frame = `AAAF${funNum}12${fpHex}${fiHex}${fdHex}${spHex}${siHex}${sdHex}${tpHex}${tiHex}${tdHex}${checksum.toString(16).padStart(2, '0')}`;
  
  return frame;
}


onUnmounted(() => {
  // 关闭串口
  if (port) {
    port.close();
  }
})

</script>

<style module>
.container {
  display: flex;
  flex-direction: row;

  .selectArea {
    width: 50%;
    display: flex;
    flex-direction: column;

    .simplePITSetting {
      display: flex;
      flex-direction: row;
      justify-items: center;
      align-items: center;
      font-size: 13px;
      font-weight: bold;
      margin-bottom: .2rem;

      .label {
        min-width: 25%;
        text-align: center
      }

      input {
        width: 30%;
        margin-right: .2rem;
      }

    }
  }
}
.buttonArea {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  justify-content: center;
  align-items: center;

}
</style>
