<template>
  <div :class="$style.container">
    <div :class="$style.showArea">
      <textarea
        :class="$style.input"
        v-model="receive"
        type="textarea"
        placeholder="接收区"
        readonly
        style="min-height: 250px; max-height: 400px"
      />
      <input :class="$style.input" v-model="send" placeholder="发送区" />
      <div :class="$style.buttonsArea">
        <n-button
          @click="handleClearReceive"
          type="info"
          ghost
          size="small"
          style="
            font-weight: bold;
            font-size: 0.8rem;
            width: 20%;
          "
        >
          清空接收区
        </n-button>
        <n-button
          @click="handleClearSend"
          type="info"
          ghost
          size="small"
          style="
            font-weight: bold;
            font-size: 0.8rem;
            width: 20%;
            margin-left: 1rem;
          "
        >
          清空发送区
        </n-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSerialPortInfo } from "@renderer/stores/modules/serialPortInfo";
import { ref, watch } from "vue";
import { NButton } from "naive-ui";

const serialPortInfo = useSerialPortInfo();
const send = ref<string>("");
const receive = ref<string>("");

// 清空接收区
function handleClearReceive() {
  receive.value = '';
  serialPortInfo.receive = receive.value;
}

// 清空发送区
function handleClearSend() {
  send.value = '';
  serialPortInfo.send = send.value;
}

// 监听收发数据
watch(serialPortInfo.$state, async (newState, _oldState) => {
  if(serialPortInfo.receive) {
    receive.value = newState.receive;
  }
});

watch(send, async () => {
  if(send.value) {
    serialPortInfo.send = send.value;
  }
})
</script>

<style module>
.container {
  display: flex;
  flex-direction: column;

  .showArea {
    .input {
      margin-bottom: 0.5rem;
      width: 90%;
      padding: 1rem;
    }

    .buttonsArea {
      width: 90%;
      display: flex;
      flex-direction: row;
      justify-content: start;
      padding: 0.5rem 0;
    }
  }
}
</style>
