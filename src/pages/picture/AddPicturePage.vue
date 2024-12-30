<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '编辑图片' : '上传图片' }}</h2>
    <!-- 图片上传组件 -->
    <PictureUpload :picture="picture" :onSuccess="onSuccess" />
    <!-- 图片信息表单 -->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :autosize="{ minRows: 3, maxRows: 5 }"
          allow-clear
        >
        </a-textarea>
        <a-form-item name="category" label="分类">
          <a-auto-complete
            v-model:value="pictureForm.category"
            placeholder="请输入分类"
            :options="categoryOptions"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="pictureForm.tags"
            placeholder="请输入标签"
            :options="tagOptions"
            mode="tags"
          />
        </a-form-item>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 图片上传成功
 */
const pictureForm = reactive<API.PictureEditRequest>({})
const picture = ref<API.PictureVO>()
const router = useRouter()

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value.id
  if (!pictureId) {
    message.error('图片id为空')
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    if (route.query?.id) {
      message.success('修改成功')
    } else {
      message.success('上传成功')
    }
    // 跳转到详情页
    router.push(`/picture/${pictureId}`)
  } else {
    message.error('创建失败' + res.data.message)
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
    message.error('创建失败' + res.data.message)
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
    pictureForm.introduction = data.introduction
    pictureForm.tags = data.tags
    pictureForm.category = data.category
  }
}

onMounted(() => {
  getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
  max-width: 680px;
  margin: 0 auto;
}
</style>
