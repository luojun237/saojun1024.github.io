<script setup lang="ts">
import { onMounted } from 'vue'

const handleClick = () => {
    window.location.href = '/articles/works/robotCar.md'
}

onMounted(() => {
  //init()
})
</script>

<template>
   <div class="works">
        <a class="works-item" href="/articles/works/robotCar.html">
            <img class="works-item-img" src="/assets/img/moon.png" />
            <div class="works-item-title">基于Fabric.js 小车运动图</div>
        </a>
   </div>
</template>

<style scoped>
.works{
    display: flex;
    align-items: center;
    justify-content: center;
}

.works-item{
    display: inline-flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
}

.works-item-img{
    max-width: 200px;
    height: auto;
}

.works-item-title{
    font-size: 16px;
    color: #333;
    margin-top: 8px;
}
</style>