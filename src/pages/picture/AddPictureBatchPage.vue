<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量上传图片</h2>
    <!-- 图片信息表单 -->
    <a-form name="formData" layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item name="q" label="关键词">
        <a-input v-model:value="formData.q" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item name="pageSize" label="抓取数量">
        <a-input-number
          v-model:value="formData.pageSize"
          aria-placeholder="请输入数量（默认为10，最大30）"
          style="min-width: 128px"
          :min="1"
          :max="30"
          allow-clear
        >
        </a-input-number>
        <a-form-item name="namePrefix" label="名称前缀">
          <a-input
            v-model:value="formData.namePrefix"
            placeholder="请输入名称前缀（默认为关键词，如: 输入'风景照'，图片名称将按顺序补充为「风景照1，风景照2...」）"
            allow-clear
          />
        </a-form-item>

        <a-form-item name="category" label="分类">
          <a-auto-complete
            v-model:value="formData.category"
            placeholder="请输入分类"
            :options="categoryOptions"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="formData.tags"
            placeholder="请输入标签"
            :options="tagOptions"
            mode="tags"
          />
        </a-form-item>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >批量上传
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 图片上传成功
 */
const formData = reactive<API.PictureUploadByBatchRequest>({
  pageSize: 10,
  current: 1,
})
const picture = ref<API.PictureVO>()
const router = useRouter()
const loading = ref<boolean>(false)

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async () => {
  loading.value = true

  try {
    const res = await uploadPictureByBatchUsingPost({
      ...formData,
    })
    // 操作成功
    if (res.data.code === 0 && res.data.data) {
      message.success(`上传成功, 共${res.data.data}张图片`)
      // 跳转到首页
      router.push(`/`)
    } else {
      message.error('任务执行失败' + res.data.message)
    }
  } catch (e: any) {
    console.log('批量上传图片失败' + e.message)
    message.error('操作失败')
  } finally {
    loading.value = false
  }
}
const categoryOptions = ref<String[]>([])
const tagOptions = ref<String[]>([])
/**
 * 获取标签和分类选项
 */
const getPictureTagCategory = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data?.data?.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data?.data?.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败' + res.data.message)
  }
}

onMounted(() => {
  getPictureTagCategory()
})

const route = useRoute()
// 获取老数据
const getOldPicture = async () => {
  // 获取到id
  const id = route.query.id
  if (!id) {
    return
  }
  const res = await getPictureVoByIdUsingGet({
    id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data
    picture.value = data
    formData.name = data.name
    formData.introduction = data.introduction
    formData.tags = data.tags
    formData.category = data.category
  }
}

onMounted(() => {
  getOldPicture()
})
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 680px;
  margin: 0 auto;
}
</style>
