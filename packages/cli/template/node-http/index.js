const http = require('node:http')
// const Url = require('node:url')
// const qs = require('node:querystring')

// 创建一个http对应的服务器
const server = http.createServer((req, res) => {
  // 浏览器访问了两次 一次是localhost:8000 一次是localhost:favicon.ico
  // console.log('浏览器访问了几次？')
  // request对象中包含本次客户端请求的所有信息
  // response对象用于给客户端返回结果的

  const url = req.url
  const method = req.method
  let info
  if (url === '/login') {
    if (method === 'POST') {
      // console.log('post请求的login')
    }
    res.end('登录成功')
  } else if (url.includes('/home')) {
    // const urlInfo = Url.parse(url)
    // const queryString = qs.parse(urlInfo.query)
    res.end('有参数的url')
  } else if (url === '/bodyurl') {
    req.setEncoding('utf-8')

    // 获取参数：body参数
    // request对象本质上是一个readable可读流
    req.on('data', data => {
      info = data
      // const dataString = data
      // const loginInfo = JSON.parse(dataString)
    })
    req.on('end', () => {
      res.end('有body参数的url', info)
    })
  } else if (url === '/headerurl') {
    // console.log(req.headers.token)
    // console.log(req.headers['content-type'])

    // 响应状态码
    // statusCode
    // res.statusCode = 208
    // setHead响应头
    // res.writeHead(401)

    // 设置响应headers信息
    // 第一种方式
    // res.setHeader('Content-Type', 'application/json;charset=utf8;')
    // res.setHeader('Content-Type', 'text/plain;charset=utf8;')
    // 第二种方式
    // res.writeHead(200, {
    //   'Content-Type': 'text/plain;charset=utf8;',
    // })

    // 两种返回方式
    // 第一种
    // res.write('使用write方法响应数据')
    // res.write('使用write方法响应数据11111')
    res.end('你好呀')
    // 第二种
    // res.end('查看headers的信息')
  }
})

// 开启对应的服务器，并且告知需要监听的端口
// 监听端口时，监听1024以上的端口，66535以下的端口
// 1025-65535之间的端口
// 2个字节=>256*256=>65536=>0-65535
server.listen(8000, () => {
  // console.log('服务器已经开启成功了')
})
