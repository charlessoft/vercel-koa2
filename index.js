const Koa = require('koa');
const axios = require('axios');
const AmazonScraper = require('./AmazonScraper');
const Router = require('koa-router'); // 引入koa-router库
const fs = require('fs');

const logger = require('./logger');

// logger.error('This is an error message');
const app = new Koa();
const router = new Router(); // 创建一个新的Router实例

router.get('/readlog', async(ctx,next)=>{
    try {
        const logContent = await fs.promises.readFile('app.log', 'utf8');
        ctx.body = logContent;
    } catch (err) {
        ctx.status = 500;
        ctx.body = 'Error reading log file';
    }
})

// 定义一个路由处理函数
router.get('/search', async (ctx, next) => {
    try {
        const response = await axios.get('http://219.135.99.136:7777');
        await logger.info("current ip :" + response)
        const scraper = new AmazonScraper();
        let res = await scraper.search('奶粉');
        ctx.body = res;
    } catch (error) {
        ctx.body = 'Error fetching data from http://ip.com';
        console.error(error);
    }
});


router.get('/', async (ctx, next) => {
    await logger.info('This is an info message 111');
    await logger.info('This is an info message 222');
    ctx.body = 'hello'
});



app
    .use(router.routes()) // 将路由处理函数添加到您的应用程序中
    .use(router.allowedMethods());



// app.use(async ctx => {
//
//    try {
//         const response = await axios.get('http://219.135.99.136:7777');
//         const scraper = new AmazonScraper();
//         let res = await scraper.search('奶粉')
//        ctx.body = res;
//     } catch (error) {
//         ctx.body = 'Error fetching data from http://ip.com';
//         console.error(error);
//     }
//     // ctx.body = 'Hello Vercel111';
// });

app.listen(3008, () => {
    console.log('3008项目启动')
});

