<template>
  <div id="mySpacePage">
    <p>正在进入，请稍后...</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  // 用户未登录，跳转到登录页面
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    await router.replace('/login')
    return
  }
  // 用户已登录，会获取该用户自己创建的空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
  })
  console.log(res)
  if (res.data.code === 0) {
    console.log('接口调用成功')
    console.log(res.data.data)
    if (Array.isArray(res.data?.data?.records) && res.data.data.records.length > 0) {
      // 用户有空间，进入到第一个空间
      const space = res.data.data.records[0]
      await router.replace(`/space/${space?.id}`)
    } else {
      // 用户没有空间，创建空间
      await router.replace('/add_space')
      message.warning('请先创建空间')
    }
  } else {
    message.error('进入空间失败' + res.data.message)
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>

<style scoped></style>
