const http = require('http')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const pluginProxy = require('puppeteer-extra-plugin-proxy')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const ac = require('@antiadmin/anticaptchaofficial')

const express = require('express')
let router = express.Router()

const antiCaptchaKey = process.env.anticaptchaAPIKey || '1d0f98f50be1aa14f3b726b3ffdd2ffb' // AntiCaptcha API Key
const siteUrl = process.env.nikeUrl || 'https://www.nike.com/'; // Store URL

const { PrivacyApi } = require('privacy.com')
const privacyApi = new PrivacyApi('269db36d-8d7f-483a-9031-e861a80cecf4')

puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
puppeteer.use(StealthPlugin())
puppeteer.use(pluginProxy({
    address: 'zproxy.lum-superproxy.io',
    port: 22225,
    credentials: {
      username: 'lum-customer-c_35009731-zone-dnashoebot-country-us',
      password: 'jiv2w#%o42of',
    }
  }))

router.get('/', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      })
    res.flushHeaders()
    ac.setAPIKey(antiCaptchaKey); // Check Anticaptcha if Connected
        ac.getBalance()
        .then((balance) => {
            res.write(`Nike : my balance is: ${balance}\n\n`)
        })
        .catch((error) => {
            res.write(`Nike : an error with API key  ${error}`)
        })

    createCard(req.query, res) // Privay.com check response of create API
    next()
})
module.exports = router

async function createCard(userBotData, res){ // Privacy.com 
    const cardParams = {
        type: "UNLOCKED",
        memo: "friendly identifier",
        spend_limit: 1000,
        spend_limit_duration: "MONTHLY"
    }    
    privacyApi
        .createCard(cardParams)
        .then((createCardResponse) => {
            
            const data = createCardResponse.data
            let obj = {}
            obj.preferredCreditCardNumber = data.pan
            obj.preferredCcnMonth = data.exp_month
            obj.preferredCcnYear = data.exp_year
            obj.preferredCcnCVV = data.cvv
            Object.assign(userBotData, obj)

            sendResponse(res, `Virtual Credit Card Created!!!`)
            checkout(userBotData, res)
        })
        .catch((e) => {
            const message = e.response.status + " " + e.response.statusText
            sendResponse(res, message)
        })
}

async function checkout(userBotData, res){ // Initialize Browser

    sendResponse(res, 'Connecting to the site!!!') // Return update to client
    const url = siteUrl

    // [
    //     '--no-sandbox',
    //     '--disable-web-security',
    // ]

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',?
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--blink-settings=imagesEnabled=true'
    ]
    const options = {
        // browserWSEndpoint: ws,
        slowMo: 50,
        headless: false,       
        ignoreDefaultArgs: ["--enable-automation", "--enable-blink-features=IdleDetection"],
        ignoreHTTPSErrors: true,
        args
    }
    // const browser = await puppeteer.connect(options) // For MLA
    const browser = await puppeteer.launch(options)
    const context = await browser.createIncognitoBrowserContext() // Use Incognito Browser
    const page = await context.newPage()

    const pages = await browser.pages()
    if (pages.length > 1) { await pages[0].close() } // Close unused pages
    await page.setViewport({ width: 1920, height: 969, deviceScaleFactor: 1, }) // Set page viewport
    await page.setDefaultTimeout(0) // Set timeout to 0

    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
    })

    const goto = await page.goto(url, {waitUntil: 'networkidle2', timeout: 0})
    
    if(goto === null){
        sendResponse(res, 'Cant get the site url... Process Stopped!!!')
        await browser.close()
    }else{
        await searchProduct(page, userBotData, res)
    }

}

async function searchProduct(page, userBotData, res){
    var preferredCategoryName = userBotData['preferredCategoryName']
    var preferredSKU = userBotData['preferredSKU']
    var preferredTitle = userBotData['preferredTitle']
    var preferredGender = userBotData['preferredGender']

    if(preferredTitle){ // if user added Product Title
        sendResponse(res, `Searching Product ${preferredTitle}...`)
        await page.$eval("a[aria-label='"+preferredCategoryName+"']", elem => elem.click())// Click preferred category
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[aria-label='Filter for "+preferredGender+"']") // Select Preferred Gender
        await page.click("a[aria-label='Filter for "+preferredGender+"']")
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            if( productTitle === preferredTitle){ // If title is equal to PreferredTitle proceed
                sendResponse(res, `Product Found!!!`)
                await productElement.click();
                await productPage(page, userBotData, res)
            }else{
                sendResponse(res, `Product Not Found!!!`)
            }
        })
        await Promise.all(productMapping)        

    }else if(preferredSKU){ // if user added Product SKU
        sendResponse(res, `Searching Product ${preferredSKU}...`)
        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            sendResponse(res, `Product Found!!!`)
            await productElement.click();
            await productPage(page, userBotData, res)
        })
        await Promise.all(productMapping)

    }else if(preferredTitle && preferredSKU ){ // if user added Both Product Title and SKU
        sendResponse(res, `Searching Product ${preferredTitle}/${preferredSKU}...`)
        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            sendResponse(res, `Product Found!!!`)
            await productElement.click();
            await productPage(page, userBotData, res)
        })
        await Promise.all(productMapping)

    }  

}

async function productPage(page, userBotData, res){
    const preferredSize = userBotData['preferredSize']

    await page.waitForSelector("label[class='css-xf3ahq']") // Wait for selector to appear
    const sizeCard = await page.$$("label[class='css-xf3ahq']") // Get all a size link element
    const sizeMapping = sizeCard.map(async (sizeElement) => { // Map all the sizes and find matched size
        const productSize = await getProperty(sizeElement, 'innerText') // Get element Text
        if( productSize === preferredSize){ // If size is equal to preferredSize proceed
            sendResponse(res, `Size ${preferredSize} Selected...`)
            await sizeElement.click();
        }else{
            sendResponse(res, `Size ${preferredSize} not available...`)
        }
    })
    await Promise.all(sizeMapping)

    await page.waitForSelector("button[class='add-to-cart-btn']"); // Wait for add to cart button
    await page.$eval("button[class='add-to-cart-btn']", elem => elem.click()); // Click Add To Cart Button
    await page.waitForTimeout(2000);

    await page.waitForSelector("button[data-test='qa-cart-checkout']"); // Wait for checkout button
    await page.$eval("button[data-test='qa-cart-checkout']", elem => elem.click()); // Click Checkout Button
    await page.waitForTimeout(2000);



    // let preferredSize = userBotData['preferredSize'];
    // let sizeElementClass = '.css-xf3ahq';

    // await page.waitForSelector(sizeElementClass); 

    // const preferredSizeElement = (await page.$x('//*[@class = "css-xf3ahq"][text() = "'+preferredSize+'"]'))[0];

    // if (preferredSizeElement) {
    //     await preferredSizeElement.click(); // Select Size

    //     await page.waitForSelector("button[class='add-to-cart-btn']"); // Wait for add to cart button
    //     await page.$eval("button[class='add-to-cart-btn']", elem => elem.click()); // Click Add To Cart Button
    //     await page.waitForTimeout(2000);

    //     await page.waitForSelector("button[data-test='qa-cart-checkout']"); // Wait for checkout button
    //     await page.$eval("button[data-test='qa-cart-checkout']", elem => elem.click()); // Click Checkout Button
    //     await page.waitForTimeout(2000);

    //     checkoutPage(page, userBotData);
    // }else{
    //     console.log("Product Not Found!");
    // }
    
}

let responseResult = '';
function sendResponse(res, result){ // Server to client Response
    console.log(result)
    res.write(`${result}!\n\n`)
}
async function getProperty(element, propertyName){ // Get Element Property
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}