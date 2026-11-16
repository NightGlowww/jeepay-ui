import { afterEach, expect, test, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import MerchantAlipay from '../src/views/mchApp/custom/AlipayPayConfig.vue'
import ManagerAlipay from '../../jeepay-ui-manager/src/views/mchApp/custom/AlipayPayConfig.vue'
import IsvAlipay from '../../jeepay-ui-manager/src/views/isv/custom/AlipayPayConfig.vue'

const api = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }))
vi.mock('../src/api/manage', () => ({
  API_URL_MCH_PAYCONFIGS_LIST: '/mock/mchPayConfigs',
  API_URL_ISV_PAYCONFIGS_LIST: '/mock/isvPayConfigs',
  getMchPayConfigUnique: api.load,
  getIsvPayConfigUnique: api.load,
  req: { add: api.save },
  upload: { cert: '/mock/upload' },
}))

const Container = defineComponent({
  setup: (_, { slots }) => () => h('div', slots.default?.()),
})
const Form = defineComponent({
  setup(_, { slots, expose }) {
    expose({ validate: async () => true, resetFields: () => {} })
    return () => h('div', slots.default?.())
  },
})
const RadioGroup = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup: (props, { emit, slots }) => () => h('select', {
    value: props.value,
    onChange: event => emit('update:value', event.target.value),
  }, slots.default?.()),
})
const Radio = defineComponent({
  props: ['value'],
  setup: (props, { slots }) => () => h('option', { value: props.value }, slots.default?.()),
})

let app
afterEach(() => {
  app?.unmount()
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

test.each([
  ['merchant', MerchantAlipay, '/mock/mchPayConfigs'],
  ['manager', ManagerAlipay, '/mock/mchPayConfigs'],
  ['ISV', IsvAlipay, '/mock/isvPayConfigs'],
])('%s: defaults legacy/new configs to USER_ID and preserves or saves the selected mode', async (_, Component, endpoint) => {
  api.load.mockResolvedValue(undefined)
  api.save.mockResolvedValue({})
  document.body.innerHTML = '<div id="test-app"></div>'
  app = createApp(Component)
  app.config.globalProperties.$access = () => true
  app.config.globalProperties.$infoBox = { message: { error: vi.fn(), success: vi.fn() } }
  for (const name of ['a-drawer', 'a-row', 'a-col', 'a-form-item', 'a-divider', 'a-tag',
    'a-input', 'a-textarea', 'a-icon', 'JeepayUpload']) app.component(name, Container)
  app.component('a-button', defineComponent({
    setup: (_, { slots }) => () => h('button', { type: 'button' }, slots.default?.()),
  }))
  app.component('a-form', Form)
  app.component('a-radio-group', RadioGroup)
  app.component('a-radio', Radio)
  const component = app.mount('#test-app')
  const mode = () => [...document.querySelectorAll('select')]
    .find(select => [...select.options].some(option => option.value === 'OPEN_ID'))
  const show = async () => {
    const count = api.load.mock.calls.length
    component.show('test-app', { ifCode: 'alipay', mchType: 1, ifConfigState: 1 })
    await vi.waitFor(() => expect(api.load).toHaveBeenCalledTimes(count + 1))
    await nextTick()
  }
  const save = async expected => {
    api.save.mockClear()
    const button = [...document.querySelectorAll('button')].find(button => button.textContent === '保存')
    button.click()
    await vi.waitFor(() => expect(api.save).toHaveBeenCalledTimes(1))
    expect(api.save.mock.calls[0][0]).toBe(endpoint)
    expect(JSON.parse(api.save.mock.calls[0][1].ifParams).userIdType).toBe(expected)
  }

  await show()
  expect(mode().value).toBe('USER_ID')
  await save('USER_ID')

  api.load.mockResolvedValue({ ifParams: JSON.stringify({ appId: 'legacy-app' }) })
  await show()
  expect(mode().value).toBe('USER_ID')
  mode().value = 'OPEN_ID'
  mode().dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
  await save('OPEN_ID')

  api.load.mockResolvedValue({ ifParams: JSON.stringify({ userIdType: 'OPEN_ID' }) })
  await show()
  expect(mode().value).toBe('OPEN_ID')
  await save('OPEN_ID')
})
