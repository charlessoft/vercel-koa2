const axios = require('axios');
const fs = require('fs');
const request = require('request')
const cheerio = require('cheerio');
const logger = require('./logger');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const instance = axios.create({
  proxy: {
    host: '127.0.0.1',
    port: 8888,
  }
});

class AmazonScraper {
  constructor() {
    // this.url = 'https://www.amazon.com/s?field-keywords=%s';
    this.url = 'https://www.amazon.com/s?k=%s&ref=nb_sb_noss_1'
    this.jsonData=''
  }
  async parseJson(content) {
    const $ = cheerio.load(content);
    const elements = $("div.a-section.a-spacing-base");
    const lst = [];

    elements.each((index, element) => {
      console.log(`${index}`, '==' + '==' * 10);
      const elementHtml = $.html(element);
      const element$ = cheerio.load(elementHtml);
      let price = element$(
          "div.a-section.a-spacing-base span.a-price span.a-offscreen"
      );

      if (price.length === 0) {
        return;
      } else {
        price = price.text();
      }

      const dic = {
        img: element$(
            "div.a-section.a-spacing-base div.a-section.aok-relative.s-image-square-aspect img.s-image"
        ).attr("src"),
        title: element$("div.a-section.a-spacing-base div h2").text(),
        url: element$("div.a-section.a-spacing-base div h2 a").attr("href"),
        price: price,
      };

      lst.push(dic);
    });

    await logger.info(JSON.stringify(lst));

    return lst;
  }




  async search(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    this.url = this.url.replace('%s', encodedKeyword);
    await logger.info('begin search');
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      'sec-ch-ua':
        '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
    };

    const requestPromise = (options) => {
      return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
          if (error) {
            logger.info("error!!!")
            logger.info(response.statusCode)
            logger.info(error)
            reject(error);
          } else {
            logger.info('ok===')
            logger.info(response.statusCode)
            logger.info(response.headers)
            logger.info(body)
            resolve(body);
          }
        });
      });
    };
    try {
      const options = {
        url: this.url,
        timeout: 50000,
        headers: headers,
        // proxy: 'http://107.148.13.39:8888',
        // proxy: 'http://127.0.0.1:8888',
        // proxy:'http://190.92.219.170:8080'
      };
      await logger.info(JSON.stringify(options))
      let ret = await requestPromise(options)
      return this.parseJson(ret)

    } catch (error) {
      console.error(error);
    }

  }

  async writeContent(content) {
    try {
      await writeFileAsync('output.html', content);
      console.log('Content written to output.html');
    } catch (error) {
      console.error('Error writing content to file:', error);
    }
  }

  parse(content) {
    // Add your parsing logic here
    console.log('Parsing content...');
  }

  notifyDing(message) {
    // Add your DingTalk notification logic here
    console.log('Sending notification:', message);
  }
}

module.exports = AmazonScraper;
