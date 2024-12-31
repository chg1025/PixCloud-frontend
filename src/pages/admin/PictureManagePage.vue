<template>
  <div id="pictureManagePage">
    <!-- 搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介中搜索"
          allowClear
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-auto-complete
          v-model:value="searchParams.category"
          placeholder="请输入分类"
          allow-clear
          style="min-width: 150px"
          :options="categoryOptions"
        />
      </a-form-item>

      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="searchParams.tags"
          placeholder="请输入标签"
          mode="tags"
          style="min-width: 150px"
          :options="tagOptions"
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 32px" />
    <!-- 表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" width="96px" />
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">
              {{ tag }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式: {{ record.picFormat }}</div>
          <div>宽: {{ record.picWidth }}</div>
          <div>高: {{ record.picHeight }}</div>
          <div>宽高比: {{ record.picScale }}</div>
          <div>大小 {{ formatSize(record.picSize) }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              type="default"
              style="color: cornflowerblue"
              :href="`/add_picture?id=${record.id}`"
              target="_blank"
              >编辑
            </a-button>
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { formatSize } from '@/utils'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '图片',
    dataIndex: 'url',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '名称',
    dataIndex: 'name',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '类型',
    dataIndex: 'category',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 128,
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    width: 80,
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
  {
    title: '操作',
    key: 'action',
    customHeaderCell: () => ({
      style: { textAlign: 'center' }, // 表头居中
    }),
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
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
</script>
