<template>
  <div class="url-picture-upload">
    <a-input-group compact>
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 100px)"
        placeholder="请输入图片URL"
      />
      <a-button type="primary" style="width: 100px" :loading="loading" @click="handleUpload"
        >提交
      </a-button>
    </a-input-group>
    <div class="image-wrap">
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false)
const fileUrl = ref<String>()

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  loading.value = true
  try {
    if (!fileUrl.value) {
      message.warning('请输入图片URL')
      loading.value = false
      return
    }
    const params: API.PictureUploadRequest = { url: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.message) {
      message.success('图片上传成功')
      // 将上传成功的信息返回给父组件
      console.log(res.data.data)
      props.onSuccess?.({ ...res.data.data })
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('图片上传失败' + e.message)
    console.error('图片上传失败' + e.message)
  }
  loading.value = false
}
</script>
<style scoped>
.url-picture-upload {
  margin-bottom: 16px;
}

.url-picture-upload img {
  max-width: 100%;
  max-height: 360px;
}

.url-picture-upload .image-wrap {
  margin-top: 16px;
  text-align: center;
}
</style>
