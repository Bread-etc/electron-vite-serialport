<template>
  <div>
    <ul>
        <li v-for="item in guideList" @click="directTo(item.url)">
            <n-icon v-html="item.icon" size="24px" depth="2" :class="$style.icon"/>
            {{ item.name }}
        </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { NIcon } from 'naive-ui';

const guideList = [
    {
        name: '基本收发',
        url: '/',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M4.25 4A2.25 2.25 0 0 0 2 6.25v11.5A2.25 2.25 0 0 0 4.25 20h15.5A2.25 2.25 0 0 0 22 17.75V6.25A2.25 2.25 0 0 0 19.75 4H4.25zm1.496 4.994A7.254 7.254 0 0 1 13 16.248a.75.75 0 1 1-1.5 0a5.754 5.754 0 0 0-5.754-5.754a.75.75 0 0 1 0-1.5zm-.75 3.757a.75.75 0 0 1 .75-.75a4.247 4.247 0 0 1 4.247 4.247a.75.75 0 0 1-1.5 0A2.747 2.747 0 0 0 5.746 13.5a.75.75 0 0 1-.75-.75zm2 3.245a.998.998 0 1 1-1.996 0a.998.998 0 0 1 1.996 0z" fill="currentColor"></path></g></svg>'
    },
        {
        name: '数据波形',
        url: '/dataWave',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M3 3.75a.75.75 0 0 1 1.5 0V19.5h15.75a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75V3.75zm16.5 3a.75.75 0 0 0-1.2-.6l-5.6 4.2l-3.82-2.246a.75.75 0 0 0-.715-.025L5.5 9.411V18.5h14V6.75z" fill="currentColor"></path></g></svg>'
    },
    {
        name: '飞控状态',
        url: '/flightControl',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M21.989 11.946a1.991 1.991 0 0 1-2.05 1.99l-4.738-.139l-3.454 7.143c-.277.574-.86.94-1.498.94a.926.926 0 0 1-.92-1.037l.863-7.193l-3.765-.11l-.49 1.341a1.29 1.29 0 0 1-1.211.847a.901.901 0 0 1-.901-.902V13.35l-.81-.169a1.261 1.261 0 0 1 0-2.469l.81-.168V9.066c0-.46.343-.838.788-.894l.113-.007a1.29 1.29 0 0 1 1.21.846l.492 1.34l3.751-.11l-.85-7.084a.93.93 0 0 1-.004-.055l-.002-.055c0-.511.415-.926.926-.926c.585 0 1.123.307 1.423.8l.075.14l3.403 7.035l4.79-.14a1.991 1.991 0 0 1 2.048 1.932v.058z" fill="currentColor"></path></g></svg>'
    },
]

// 路由跳转
const router = useRouter();
async function directTo(url: string) {
    await router.push(`${url}`);
}
</script>

<style module>
ul {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        padding: 1rem 1rem;
        display: flex;
        flex-direction: row;
        justify-items: center;
        align-items: center;
        font-weight: bold;
        cursor: pointer;
    }

    li:hover {
        color: gray;
        transition: color 0.5s ease-out;

        .icon {
            color: gray;
            transition: color 0.5s ease-out;
        }
    }

    .icon {
        margin-right: 8px;
    }
}
</style>
