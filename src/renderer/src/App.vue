<script setup lang="ts">
import { NMessageProvider } from 'naive-ui';
import Home from './components/Home.vue';
</script>

<template>
  <n-message-provider>
    <Home />
  </n-message-provider>
</template>

<style>
body {
  overflow: hidden;
  background-image: url('./assets/img/wavy-lines.svg');
  background-size: cover;
  user-select: none;
}
</style>
