const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');
const URL = require('url');

const target = {                                  // 目标服务器的host和port
    host : '10.25.157.139',
    port : 8080
};

const proxy = new httpProxy.createProxyServer({   // 创建一个代理对象
    target: target
});

http.createServer( (req, res)=>{                  // 创建一个普通的http server
    if(req.url.indexOf('bsoi-sg') >= 0) {
        proxy.web(req, res);                      // 用代理对象处理请求，解决跨域问题
    }else {
        staticFileHandler(req, res);              // 处理静态文件
    }
}).listen(8888);
console.log('Server is running on http://localhost:8888');

const staticFileHandler = (req, res)=>{
    const filename = path.join(__dirname, URL.parse(req.url).pathname);
    let stats;
    try {
        stats = fs.lstatSync(filename);       // 返回一个stat数组对象,包含这个路径的基本信息
    }catch(e){
        res.writeHead(404, {
            'Content-Type' : 'text/plain'
        });
        res.write('404 Not Found\n');
        res.end();
        return;
    }

    if(stats.isFile()) {
        const mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, {
            'Content-Type' : mimeType
        });
        const fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    }else if(stats.isDirectory()) {
        const fileStream = fs.createReadStream(filename + '/index.html');
        fileStream.pipe(res);
    }else{
        res.writeHead(500, {
            'Content-Type' : 'text/plain'
        });
        res.write('500 Internal server error\n');
        res.end();
        return;
    }
};

const mimeTypes = {
	"html" : "text/html",
	"js" : "text/javascript",
    "css" : "text/css",
	"jpg" : "image/jpeg",
	"png" : "image/png"
};
