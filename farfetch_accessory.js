
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');

const scrapedData = [];
const base_url = 'https://www.farfetch.com';

async function farFetch_scraper(){
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
    });
        
    const page = await browser.newPage();
    for (let i = 1; i < 11; i++){
        await page.goto(`https://www.farfetch.com/bj/shopping/men/accessories-all-2/items.aspx?page=${i}&view=90&sort=3`, {
            timeout: 50000
        })
        try {
            await page.click('._52cda3.ltr-17ka3l3._737011._8a79e4._a681f1')
        } catch (error) {
            // This here can be empty
        }
        if (i != 10){
            await page.waitForSelector('.ltr-x69rqn.e19e7out0');
        }
        const pageData = await page.evaluate(() =>{
            return{html: document.documentElement.innerHTML,}
        })
        await scraper(pageData);

    }
    
    async function scraper(pageData){
        const $ = cheerio.load(pageData.html);
    
        $('.ltr-x69rqn.e19e7out0').each((index,e) =>{
            const brand = $(e).find('.e17j0z620.ltr-17q7kb6-Body-BodyBold.eq12nrx0').text();
            const name = $(e).find('.ltr-4y8w0i-Body.e1s5vycj0').text();
            const price = $(e).find('.ltr-4y8w0i-Body.e15nyh750').text();
            const link = $(e).find('.ltr-1gxq4h9.e4l1wga0').attr('href');
            const item_link = base_url + link;
            const image = $(e).find('.er03ef60.ltr-dkt6lq.e2u0eu40').attr('src');
        
            scrapedData.push({
                'Item Brand':brand,
                'Item Name':name,
                'Item Price':price,
                'Item Image':image,
                'Item Link':item_link,
            })
        })

    }
    const csv = json2csv.parse(scrapedData);
    fs.writeFileSync('farfetch_accessory.csv', csv);
    console.log(scrapedData);

    await browser.close();
}

farFetch_scraper();