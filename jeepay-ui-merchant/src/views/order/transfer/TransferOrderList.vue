<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-range-picker
              class="table-head-layout"
              @change="onChange"
              v-model:value="vdata.date"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
            >
              <a-icon slot="suffixIcon" type="sync" />
            </a-range-picker>
            <jeepay-text-up
              :placeholder="'转账/商户/渠道订单号'"
              v-model:value="vdata.searchData.unionOrderId"
            />
            <!--            <jeepay-text-up :placeholder="'转账订单号'" :msg="searchData.transferId" v-model:value="searchData.transferId" />-->
            <!--            <jeepay-text-up :placeholder="'商户订单号'" :msg="searchData.mchOrderNo" v-model:value="searchData.mchOrderNo" />-->
            <!--            <jeepay-text-up :placeholder="'渠道支付订单号'" :msg="searchData.channelOrderNo" v-model:value="searchData.channelOrderNo" />-->
            <jeepay-text-up :placeholder="'应用AppId'" v-model:value="vdata.searchData.appId" />
            <a-select
              v-model:value="vdata.searchData.state"
              placeholder="转账状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">订单生成</a-select-option>
              <a-select-option value="1">转账中</a-select-option>
              <a-select-option value="2">转账成功</a-select-option>
              <a-select-option value="3">转账失败</a-select-option>
            </a-select>
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="queryFunc" :loading="vdata.btnLoading">
                搜索
              </a-button>
              <a-button
                style="margin-left: 8px"
                @click="
                  () => {
                    vdata.searchData = {}
                    vdata.date = ''
                  }
                "
              >
                重置
              </a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="vdata.btnLoading = false"
        ref="infoTable"
        :scroll="{ x: 1200 }"
        table-layout="fixed"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        rowKey="transferId"
        :tableRowCrossColor="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <b>￥{{ record.amount / 100 }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'state'">
            <a-tag
              :key="record.state"
              :color="
                record.state === 0
                  ? 'blue'
                  : record.state === 1
                    ? 'orange'
                    : record.state === 2
                      ? 'green'
                      : 'volcano'
              "
            >
              {{
                record.state === 0
                  ? '订单生成'
                  : record.state === 1
                    ? '转账中'
                    : record.state === 2
                      ? '转账成功'
                      : record.state === 3
                        ? '转账失败'
                        : record.state === 4
                          ? '任务关闭'
                          : '未知'
              }}
            </a-tag>
          </template>
          <template v-if="column.key === 'orderNo'">
            <div>
              <JeepayOrderNo label="转账" :value="record.transferId" />
              <JeepayOrderNo label="商户" :value="record.mchOrderNo" tone="merchant" />
              <JeepayOrderNo
                v-if="record.channelOrderNo"
                label="渠道"
                :value="record.channelOrderNo"
                tone="channel"
              />
            </div>
          </template>
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                type="link"
                v-if="$access('ENT_TRANSFER_ORDER_VIEW')"
                @click="detailFunc(record.transferId)"
              >
                详情
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 订单详情 页面组件  -->
    <TransferOrderDetail ref="transferOrderDetailRef" />
  </page-header-wrapper>
</template>
<script setup lang="ts">
import JeepayOrderNo from '@/components/JeepayTable/JeepayOrderNo.vue'
import { API_URL_TRANSFER_ORDER_LIST, req } from '@/api/manage'
import dayjs from 'dayjs'
import { reactive, ref, getCurrentInstance } from 'vue'
import TransferOrderDetail from './TransferOrderDetail.vue'

const { $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { title: '转账金额', key: 'amount' },
  { key: 'orderNo', title: '订单号', scopedSlots: { customRender: 'orderSlot' }, width: 260 },
  // { title: '转账订单号', dataIndex: 'transferId' },
  // { title: '商户转账单号', dataIndex: 'mchOrderNo' },
  // { title: '渠道订单号', dataIndex: 'channelOrderNo' },
  { title: '收款账号', dataIndex: 'accountNo', width: 200 },
  { title: '收款人姓名', dataIndex: 'accountName' },
  { title: '转账备注', dataIndex: 'transferDesc' },
  { title: '状态', key: 'state', width: 100 },
  { title: '创建日期', dataIndex: 'createdAt' },
  {
    title: '操作',
    width: '100px',
    fixed: 'right',
    align: 'center',
    key: 'op',
  },
]

const vdata: any = reactive({
  btnLoading: false,
  tableColumns: tableColumns,
  searchData: {},
  createdStart: '', // 选择开始时间
  createdEnd: '', // 选择结束时间
  date: '',
})

const infoTable = ref()
const transferOrderDetailRef = ref()

function queryFunc() {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}
// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_TRANSFER_ORDER_LIST, params)
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(true)
}
function detailFunc(recordId) {
  console.log(transferOrderDetailRef.value)
  transferOrderDetailRef.value.show(recordId)
}

function onChange(date, dateString) {
  vdata.searchData.createdStart = dateString[0] // 开始时间
  vdata.searchData.createdEnd = dateString[1] // 结束时间
}
function disabledDate(current) {
  // 今日之后日期不可选
  return current && current > dayjs().endOf('day')
}
</script>
