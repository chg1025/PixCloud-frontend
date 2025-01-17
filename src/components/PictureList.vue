<template>
  <div class="picture-list" >
    <!--图片列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 --->
          <a-card hoverable style="width: 240px" @click="doClickPicture(picture)">
            <template #cover>
              <!--<img alt="example" :src="picture.url" style="height: 240px; object-fit: cover" />-->
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <ShareAltOutlined @click="(e) => doShareImage(picture, e)" />
              <SearchOutlined @click="(e) => doSearchImage(picture, e)" />
              <EditOutlined @click="(e) => doEdit(picture, e)" />
              <DeleteOutlined @click="(e) => doDelete(picture, e)" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShowModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import ShowModal from '@/components/ShowModal.vue'

interface Props {
  dataList?: API.PictureVO[]
  loading: boolean
  showOp: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
})

const router = useRouter()

// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑数据
const doEdit = (picture: API.PictureVO, e: Event) => {
  // 阻止冒泡
  e.stopImmediatePropagation()
  router.push({
    path: `/add_picture`,
    query: { id: picture.id, spaceId: picture.spaceId },
  })
}

// 删除数据
const doDelete = async (picture: API.PictureVO, e: Event) => {
  // 阻止冒泡
  e.stopImmediatePropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// 搜索
const doSearchImage = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 分享

const shareModalRef = ref()
const shareLink = ref<string>()
const doShareImage = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  // alert(shareLink.value)
  if (shareModalRef.value) {
    shareModalRef.value.showModal()
  }
}
</script>

<style>
/* 保持原有样式 */
.picture-list {
  margin-top: 16px;
  text-align: center; /* 确保整个列表内容居中 */
}

/* 确保图片卡片在小屏时居中 */
.picture-list .ant-list-item {
  display: flex;
  justify-content: center; /* 水平方向居中对齐 */
}

/* 卡片样式优化 */
.picture-list .ant-card {
  margin: 0 auto; /* 确保每个卡片居中 */
}

</style>
