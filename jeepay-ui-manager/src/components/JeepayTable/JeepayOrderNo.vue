<template>
  <p class="order-number">
    <span class="order-number-label" :class="`order-number-label--${tone}`">{{ label }}</span>
    <a-tooltip :title="String(value ?? '')" placement="bottom" :trigger="['hover', 'focus']">
      <span class="order-number-value" :title="String(value ?? '')" tabindex="0">{{ value || '-' }}</span>
    </a-tooltip>
  </p>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '' },
  tone: { type: String, default: 'pay' },
})
</script>

<style lang="less" scoped>
.order-number {
  display: flex;
  min-width: 0;
  width: 100%;
  margin: 5px 0;
  font-size: 12px;
  line-height: 16px;
  -webkit-text-size-adjust: none;
}
.order-number-label {
  flex: 0 0 35px;
  height: 16px;
  margin-right: 2px;
  border-radius: 5px;
  font-weight: 800;
  text-align: center;
  color: #729ed5;
  background: #e7f5f7;
  &--merchant {
    color: #56cf56;
    background: #d8eadf;
  }
  &--channel {
    color: #fff;
    background: #e09c4d;
  }
}
.order-number-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: normal;
}
</style>
