<template>
  <div id="picture-detail-page">
    <a-row :gutter="[16, 16]">
      <!--图片预览-->
      <a-col :md="24" :sm="12" :lg="12">
        <a-card title="图片预览">
          <a-image
            :src="picture.url"
            style="max-height: 600px; object-fit: contain; margin-bottom: auto"
          />
        </a-card>
      </a-col>
      <!--图片信息-->
      <a-col :md="24" :sm="12" :lg="12">
        <a-card title="图片信息">
          <a-descriptions :column="1" layout="horizontal">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
          <!--图片操作-->
          <div>
            <a-space wrap>
              <a-button type="primary" @click="doDownload">
                免费下载
                <template #icon>
                  <DownloadOutlined />
                </template>
              </a-button>
              <a-button
                v-if="hasEditPermission()"
                type="default"
                @click="doEdit"
                :icon="h(EditOutlined)"
                >编辑
              </a-button>
              <a-button
                v-if="hasEditPermission()"
                danger
                @click="doDelete"
                :icon="h(DeleteOutlined)"
                >删除
              </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, h } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { downloadImage, formatSize } from '@/utils'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

interface Props {
  id: string | number
}

const props = defineProps<Props>()

// 数据
const loading = ref(true)

const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  loading.value = true
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败' + res.data.message)
    }
    loading.value = false
  } catch (e: any) {
    loading.value = false
    message.error('获取图片详情失败' + e.message)
  }
}

const router = useRouter()
const loginUserStore = useLoginUserStore()

const hasEditPermission = () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return false
  }
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
}

// 编辑数据
const doEdit = async () => {
  router.push(`/add_picture?id=` + picture.value.id)
}

// 删除数据
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 跳转到首页
    router.push({
      path: `/`,
    })
  } else {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// 处理下载
const doDownload = () => {
  downloadImage(picture.value.url)
}
</script>

<style>
#picture-detail-page {
  margin-top: 16px;
}
</style>
