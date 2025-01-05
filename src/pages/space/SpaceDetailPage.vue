<template>
  <div id="spaceDetailPage">
    <!-- 空间信息-->
    <a-flex justify="space-between">
      <h2 style="display: flex; align-items: center; justify-content: center">
        {{ space.spaceName }}（私有空间）
      </h2>
      <a-space size="middle">
        <a-tooltip title="上传图片" color="blue" placement="bottom">
          <a-button
            type="primary"
            ghost
            shape="circle"
            :href="`/add_picture?spaceId=${id}`"
            target="_blank"
            >+
          </a-button>
        </a-tooltip>

        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
          :color="tooltipColor"
          placement="bottom"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="progressPercent"
            :stroke-color="progressColor"
          />
        </a-tooltip>
      </a-space>
    </a-flex>

    <!--图片列表-->
    <PictureList :data-list="dataList" :loading="loading" :showOp="true" :on-reload="fetchData" />
    <a-pagination
      v-if="dataList.length > 0"
      style="text-align: center"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      v-model:total="total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  listPictureVoByPageWithCacheUsingPost,
} from '@/api/pictureController'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'

interface Props {
  id?: number
}

const props = defineProps<Props>()

// 数据
const loading = ref(true)
const space = ref<API.SpaceVO>({})

// 获取空间详情
const fetchSpaceDetail = async () => {
  loading.value = true
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败' + res.data.message)
    }
    loading.value = false
  } catch (e: any) {
    loading.value = false
    message.error('获取空间详情失败' + e.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)

// 获取图片列表

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true

  const params = {
    spaceId: props.id,
    ...searchParams,
  }
  // 获取图片列表
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

const onSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<String[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<String[]>([])
const selectedTags = ref<String[]>([])
/**
 * 获取标签和分类选项
 */
const getPictureTagCategory = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data?.data?.tagList ?? []
    categoryList.value = res.data?.data?.categoryList ?? []
  } else {
    message.error('获取标签分类列表失败' + res.data.message)
  }
}

onMounted(() => {
  getPictureTagCategory()
})

// 计算进度百分比
const progressPercent = computed(() => {
  const totalSize = space.totalSize ?? 0
  const maxSize = space.maxSize ?? 1 // 避免除以零
  return Math.min(totalSize / maxSize, 100) // 确保百分比不超过 100%
})

// 根据百分比动态设置进度条颜色
const progressColor = computed(() => {
  if (progressPercent.value >= 90) {
    return '#ff4d4f' // 红色
  } else if (progressPercent.value >= 80) {
    return '#faad14' // 黄色
  } else {
    return '#52c41a' // 绿色
  }
})

// 根据百分比动态设置 tooltip 的颜色
const tooltipColor = computed(() => {
  if (progressPercent.value > 90) {
    return '#ff4d4f' // 红色
  } else if (progressPercent.value > 80) {
    return '#faad14' // 黄色
  } else {
    return '#52c41a' // 绿色
  }
})
</script>

<style>
#spaceDetailPage {
  margin-top: 16px;
}
</style>
