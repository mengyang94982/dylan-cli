// node中使用axios发送请求
const http = require('node:http')
const axios = require('axios')

// 使用http模块发送get请求
http.get('http://localhost:8000/login', req => {
  // 从可读流中获取数据
  req.on('data', data => {
    // const list = data.toString()
    data.forEach()
  })
  req.on('end', () => {})
})

// 使用http模块发送post请求
const req = http.request(
  {
    mehod: 'POST',
    hostname: 'localhost',
    port: 8000
  },
  res => {
    res.on('data', data => {
      data.forEach()
      // const dataString = data.toString()
    })
  }
)
req.end()

// 使用axios发送请求

axios.get('http://localhost:8000/login')
// .then(res => {
// })
