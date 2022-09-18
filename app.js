// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  onShow() {
    this.onNetworkStatusChange()
  },
  globalData: {
    userInfo: null,
    nonetwork: false,
  },
  /* 监听网络状态 */
  onNetworkStatusChange() {
    var that = this
    /* 获取网络类型 */
    wx.getNetworkType({
      success: function (res) {
        const networkType = res.networkType
        if ('none' != networkType) {
          that.globalData.nonetwork = true
          /* 监听网络状态变化事件 */
          wx.onNetworkStatusChange(function (res) {
            if (res.isConnected) {
              that.globalData.nonetwork = true
            } else {
              that.globalData.nonetwork = false
            }
          })
        } else {
          wx.onNetworkStatusChange(function (res) {
            if (res.isConnected) {
              that.globalData.nonetwork = true
            } else {
              that.globalData.nonetwork = false
            }
          })
        }
      },
    })
  },
})
