<template>
  <!--图片搜索表单-->
  <div id="picture-search-form" class="picture-search-form">
    <!-- 搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-col :span="6">
        <a-form-item class="form-item-spacing" label="关键词">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介中搜索"
            allowClear
          />
        </a-form-item>
      </a-col>
      <a-col>
        <a-form-item class="form-item-spacing" label="类型">
          <a-auto-complete
            v-model:value="searchParams.category"
            placeholder="请输入分类"
            allow-clear
            style="min-width: 128px"
            :options="categoryOptions"
          />
        </a-form-item>
      </a-col>
      <a-col>
        <a-form-item class="form-item-spacing" name="tags" label="标签">
          <a-select
            v-model:value="searchParams.tags"
            placeholder="请输入标签"
            :options="tagOptions"
            style="min-width: 128px"
            mode="tags"
          />
        </a-form-item>
      </a-col>

      <!-- 高级搜索表单项 -->
      <template v-if="showAdvanced">
        <!-- 高级搜索表单项 -->
        <a-col>
          <a-form-item class="form-item-spacing" label="日期" name="dataRange">
            <a-range-picker
              style="width: 350px"
              show-time
              :placeholder="['开始时间', '结束时间']"
              v-model:value="dateRange"
              format="YYYY/MM/DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item class="form-item-spacing" label="名称">
            <a-input v-model:value="searchParams.name" placeholder="从图片名称中搜索" allowClear />
          </a-form-item>
        </a-col>
        <br />
        <a-col>
          <a-form-item class="form-item-spacing" label="简介">
            <a-input
              v-model:value="searchParams.introduction"
              placeholder="从图片简介中搜索"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item class="form-item-spacing" label="宽度">
            <a-input-number v-model:value="searchParams.picWidth" allowClear />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item class="form-item-spacing" label="高度">
            <a-input-number v-model:value="searchParams.picHeight" allowClear />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item class="form-item-spacing" label="格式">
            <a-input v-model:value="searchParams.picFormat" placeholder="图片格式" allowClear />
          </a-form-item>
        </a-col>
      </template>
      <a-col>
        <a-form-item>
          <a-button type="link" class="form-item-spacing" @click="toggleAdvanced">
            {{ showAdvanced ? '收起' : '展开' }}
          </a-button>
        </a-form-item>
      </a-col>
      <a-col>
        <a-form-item class="form-item-spacing">
          <a-space>
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button html-type="reset" @click="doClear">重置</a-button>
          </a-space>
        </a-form-item>
      </a-col>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()
const dateRange = ref<[]>([])

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

// 搜索数据
const doSearch = () => {
  props.onSearch?.(searchParams)
}

const showAdvanced = ref(false)
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 清理
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  dateRange.value = []
  props.onSearch?.(searchParams)
}

const onChange = (date: Dayjs) => {
  if (date) {
    console.log('Date: ', date)
  } else {
    console.log('Clear')
  }
}
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}
// 时间预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

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

<style scoped>
/* 搜索表单整体样式 */
#picture-search-form {
  padding: 8px; /* 调整顶部和底部内边距 */
  background-color: #f5f5f5; /* 给表单区域加一个浅色背景，提升视觉分区 */
  border-radius: 8px; /* 增加圆角效果 */
}

/* 调整表单项上下间距 */
.form-item-spacing {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
