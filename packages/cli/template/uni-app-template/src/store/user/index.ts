import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userInfo: {
        name: 'dylanjs',
      },
    }
  },
  // 也可以这样定义
  // state: () => ({ count: 0 })
  actions: {},
})
