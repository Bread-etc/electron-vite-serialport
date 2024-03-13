<template>
    <div :class="$style.functionArea">
        <!-- 左侧导航 -->
        <div :class="$style.navigation">
            <Navigation/>
        </div>
        <div :class="$style.controlArea">
            <!-- 渲染子组件的路由 -->
            <router-view :class="$style.container"></router-view>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Navigation from './Navigation.vue';
</script>

<style lang="css" module>
.functionArea {
    display: flex;
    flex-direction: row;
    min-height: 500px;
    min-width: 700px;

    .navigation {
        min-width: 20%;
        display: flex;
        justify-content: center;
    }

    .controlArea {
        width: 80%;
        display: flex;
        flex-direction: column;
        padding: 1rem 0;
        padding-right: 1.5rem;

        .container {
            width: 100%;
        }
    }
}
</style>