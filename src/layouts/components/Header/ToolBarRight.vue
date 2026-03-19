<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <Fullscreen id="fullscreen" />

      <Message id="message" />

      <ThemeSetting id="themeSetting" />
    </div>

    <span class="username">wjl</span>
    <Avatar />
  </div>
</template>

<script setup lang="ts">
// 记得把 script 里没用到的引入也删掉
import Fullscreen from "./components/Fullscreen.vue";
import Message from "./components/Message.vue";
import ThemeSetting from "./components/ThemeSetting.vue";
import Avatar from "./components/Avatar.vue";
</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 25px;
  .header-icon {
    display: flex;
    align-items: center;
    & > * {
      margin-left: 21px;
      color: var(--el-header-text-color);
    }
  }
  .username {
    margin: 0 20px;
    font-size: 15px;
    color: var(--el-header-text-color);
  }
}
</style>
