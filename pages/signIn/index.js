let app = getApp()
import {
  getLocation,
  mapSearch,
  reverseGeocoder
} from '../../utils/map'
const util = require('../../utils/util')
Page({
  data: {
    longitude: 0, //经度
    latitude: 0, //纬度
    onLine: true, //是否有网络
    target: '', //目标位置
    markers: [], //地图
    addressName: '', //地址标题
    time: '', //时间
    timer: '', //定时器
    timer2: '', // 用来每个一段时间自动刷新一次定位
    canClick: false, //是否在打卡范围内
    distance: 0, //距离打卡位置距离
    locationChangeFn: ''
  },
  onLoad(options) {
    this.getTime()
    this.setData({
      target: options.target
    })
    if(app.globalData.nonetwork) {
      this.setData({
        onLine: true
      })
    }
  },
  onShow() {
    if (app.globalData.nonetwork) {
      this.setData({
        onLine: true
      })
      wx.showLoading({
        title: "定位中!"
      })
      this.rePosition()
      // this.getPositions()
    } else {
      this.setData({
        onLine: false
      })
      wx.showToast({
        title: '网络错误，请检查网络设置',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onUnload: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.timer2)
    this.clearOnPosition() // 停止位置监听
    console.log("定时器已被清除")
  },

  /* 获取当前用户的位置 */
  getCusLocation(location) {
    reverseGeocoder(location).then(res => {
      console.log('res111', res)
      var res = res.result;
      var mks = [];
      //当get_poi为0时或者为不填默认值时，检索目标位置，按需使用
      mks.push({ // 获取返回结果，放到mks数组中
        title: res.address,
        id: 0,
        latitude: res.location.lat,
        longitude: res.location.lng,
        width: 30,
        height: 38,
      })
      this.setData({
        markers: mks,
        addressName: res.address,
        latitude: res.location.lat,
        longitude: res.location.lng
      })
      wx.hideLoading()
    })
  },

  /* 获取时间 */
  getTime: function () {
    let that = this
    let time = that.data.time
    that.setData({
      timer: setInterval(function () {
        time = util.formatTime(new Date())
        that.setData({
          time: time.substr(-8)
        });
        if (time == 0) {
          // 页面跳转后，要把定时器清空掉，免得浪费性能
          clearInterval(that.data.timer)
        }
      }, 1000)
    })
  },

  /* 重新定位 */
  rePosition: function () {
    let that = this
    let _locationChangeFn = function (res) {
      if(app.globalData.nonetwork) {
        let {
          longitude,
          latitude
        } = res
        that.setData({
          longitude,
          latitude
        })
        let location = {
          latitude: latitude,
          longitude: longitude
        }
        that.getCusLocation(location) //逆地址解析
        that.getDistance(location) //获取签到地点距离
        console.log('location change', res)
      } else {
        this.setData({
          onLine: false
        })
        wx.showToast({
          title: '网络错误，请检查网络设置',
          icon: 'none',
          duration: 2000
        })
      }
    }
    this.setData({
      locationChangeFn: _locationChangeFn
    })
    if(app.globalData.nonetwork) {
      this.setData({
        onLine: true
      })
      wx.showLoading({
        title: "定位中!"
      })
      wx.startLocationUpdate({
        success: (res) => {
          wx.hideLoading()
          // 成功开启后 去调用位置监听 wx.onLocationChange(_locationChangeFn)
          wx.onLocationChange(this.data.locationChangeFn)
        },
        fail: (err) => {
          wx.hideLoading()
          console.log('err111', err)
          wx.showModal({
            content: '暂未授权无法获取定位，是否重新获取？',
            success (res) {
              if (res.confirm) {
                wx.openSetting()
              } else if (res.cancel) {
                wx.navigateBack()
              }
            }
          })
          // 如果没有选择使用时和离开后 可以通过 wx.openSetting 打开设置手动授权
          // wx.openSetting()
        }
      })
    } else {
      this.setData({
        onLine: false
      })
      wx.showToast({
        title: '网络错误，请检查网络设置',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
  /* 清除位置监听 */
  clearOnPosition() {
    console.log('卸载')
    wx.stopLocationUpdate(this.data.locationChangeFn)
  },
  /* 点击签到用户确认打卡信息 */
  checkIn: function () {
    this.setData({
      canClick: false
    })
    console.log('用户点击了签到')


    var that = this
    var nowTime = util.formatTime(new Date())
    wx.showModal({
      title: '请确认打卡信息',
      // content: '请确认待整改项已整改完毕！',
      content: `地点：${this.data.addressName}\n时间：${nowTime}`, // 开发者工具上没有换行，真机调试时会有的
      confirmText: '确认',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // 调起签到接口
          // that.realyCheckIn()

        } else if (res.cancel) {
          console.log('用户点击取消')
          that.setData({
            canClick: true
          })
        }
      }
    })
  },

  /* 传递后台 */
  realyCheckIn: function () {
    var that = this
    var patrolForm = app.globalData.patrolForm // 其他需要一并提交过去的业务数据

    console.log(app.globalData)
    // debugger
    // 要在这里给 patrolForm 补充其他的参数
    patrolForm.checkaddress = this.data.addressName
    patrolForm.searchtime = util.formatTime(new Date())
    // 应该先判断用户有没有登录，没登录就授权登录
    patrolForm.searchuser = app.globalData.user ? app.globalData.user.UserName : app.globalData.userInfo.nickName
    console.log("传给后台的 searchuser：", patrolForm.searchuser)
    // 拼接："经度,纬度"
    patrolForm.latandlon = this.data.poi.longitude + "," + this.data.poi.latitude


    console.log(patrolForm)
    console.log("↑ 签到提交的post参数")

    var tmpNumber = 0
    wx.request({
      url: urlList.submitCheckInInfo,
      data: patrolForm,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        if (res.data.IsSuccess) {
          console.log(res.data.IsSuccess, typeof (res.data.IsSuccess))
          console.log("请求成功")
          var patrolId = res.data.ReturnData[0].id
          // // 看怎么取到返回的id
          // debugger

          if (patrolForm.img_arr1.length > 0) {
            for (var i = 0; i < patrolForm.img_arr1.length; i++) {
              tmpNumber = i
              wx.uploadFile({
                // 图片上传的接口地址
                url: urlList.submitCheckInPhoto + "?patrolid=" + patrolId,
                filePath: patrolForm.img_arr1[i],
                name: 'content',
                // formData: {
                //   // 这里面可以携带一些参数一并传过去
                //   patrolId: patrolId
                // },
                // header: {
                //   Authorization: token
                // },
                success: function (res) {
                  console.log(res)
                },
                fail: function (res) {
                  that.setData({
                    canClick: true
                  })
                },
                complete: function () {
                  // 因为上传图片是异步操作,所以会导致这里的 i 会取不到，故需要用个作用域更大点的变量来标识，否则 if 里面的代码不会执行
                  if (tmpNumber === patrolForm.img_arr1.length - 1) {
                    // 有图片就等图片上传完了再返回首页
                    wx.showToast({
                      title: '巡查签到成功！',
                      icon: 'success',
                      duration: 2000,
                      complete: function () {
                        wx.navigateBack({
                          delta: 2 // 回退两层页面
                        })
                      }
                    })
                  }
                }
              })
            }
          } else {
            wx.showToast({
              title: '巡查签到成功！',
              icon: 'success',
              duration: 2000,
              complete: function () {
                wx.navigateBack({
                  delta: 2
                })
              }
            })
          }
        }
      },
      fail: function (res) {
        that.setData({
          canClick: true
        })
      }
    })

  },

  /* 获取用户位置 */
  getPositions() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({
          latitude,
          longitude
        })
        let location = {
          latitude: latitude,
          longitude: longitude
        }
        this.rePosition()
        // this.getCusLocation(location)
        wx.hideLoading()
      },
      fail: (err) => {
        console.log('getLocationErr', err)
        wx.hideLoading()
        wx.showModal({
          content: '暂未授权无法获取定位，是否重新获取？',
          success (res) {
            if (res.confirm) {
              wx.openSetting()
            } else if (res.cancel) {
              wx.navigateBack()
            }
          }
        })
      }
    })
  },

  /* 搜索距离 */
  getDistance(location) {
    let that = this
    mapSearch(that.data.target, location).then(res => {
      var data = res.data;
      that.setData({
        distance: data[0]["_distance"],
      })
      console.log('distance', that.data.distance)
      if (data[0]["_distance"] > 500) {
        that.setData({
          canClick: false
        })
      } else {
        that.setData({
          canClick: true
        })
      }
    })
  }
})