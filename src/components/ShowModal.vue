<template>
  <div>
    <a-modal v-model:open="open" :title="title" :footer="false" @cancel="closeModel">
      <h4>复制分享链接 🔗</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px"></div>
      <h4>分享二维码 🖼️</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const open = ref<boolean>(false)

interface Props {
  title: string
  link: string
}

const props = withDefaults(defineProps<Props>(), {
  title: () => '分享图片',
  link: () => 'www.baidu.com',
})

import { defineExpose } from 'vue'

const showModal = () => {
  open.value = true
}

const closeModel = (e: MouseEvent) => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  showModal,
})
</script>
