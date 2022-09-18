// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    showActionsheet: false,
    groups: [{
        text: '东恒',
        value: '浙江宝平物联网有限公司浙江省湖州市德清县新安镇新安大道369号'
      },
      {
        text: '新市',
        value: '浙江宝平物联网有限公司浙江省湖州市德清县果山头71号'
      },
      {
        text: '新安',
        value: '浙江宝平物联网有限公司(德清分公司)浙江省湖州市德清县新安镇盛丰路728号1号楼1层101室'
      },
      {
        text: '臻港',
        value: '浙江宝平臻港库浙江省湖州市德清县石塘村德清佳华木业南'
      },
      {
        text: '融运库',
        value: '浙江融运供应链科技有限公司浙江省湖州市德清县雷甸镇白云南路718号'
      }
    ]
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  handleSignIn() { //立即签到
    this.setData({
      showActionsheet: true
    })
  },

  close: function () {
    this.setData({
      showActionsheet: false
    })
  },
  btnClick(e) {
    console.log(e)
    let target = e.detail.value
    wx.navigateTo({
      url: '/pages/signIn/index?target=' + target,
   })
   this.close()
  }
})