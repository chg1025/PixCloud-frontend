<template>
  <div id="home-page">
    <div id="home" class="home">
      <!--搜索框-->
      <div class="search-bar">
        <a-input-search
          v-model:value="searchParams.searchText"
          placeholder="从海量图片中搜索"
          enter-button="搜索"
          size="large"
          @search="onSearch"
        />
      </div>
      <!--分类和标签筛选-->
      <a-tabs v-model:activeKey="selectedCategory" @change="onSearch">
        <a-tab-pane key="all" tab="全部"></a-tab-pane>
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
      <div class="tag-bar">
        <span style="margin-right: 8px">标签:</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTags[index]"
            @change="onSearch"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>

      <!--图片列表-->
      <PictureList :data-list="dataList" :loading="loading" :showOp="false" />
      <a-pagination
        v-if="dataList.length > 0"
        style="text-align: center"
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        v-model:total="total"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageWithCacheUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'

// 数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

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
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTags.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageWithCacheUsingPost(params)
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

const router = useRouter()
</script>

<style>
#home-page {
  margin-top: 16px;
}

#home-page .search-bar {
  max-width: 512px;
  margin: 0 auto 16px;
}

#home-page .tag-bar {
  margin-bottom: 16px;
}
</style>
