const puppeteer = require('puppeteer');
const ac = require('@antiadmin/anticaptchaofficial');
const express = require('express')
let router = express.Router()

const siteUrl = process.env.nikeUrl || 'https://www.nike.com/'; // Store URL to siteUrl
const antiCaptchaKey = process.env.anticaptchaAPIKey || '1d0f98f50be1aa14f3b726b3ffdd2ffb' // AntiCaptcha API Key

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
    checkout(req.query, res)
    next()
})
module.exports = router

let responseResult = '';
function sendResponse(res, result){ // Server to client Response
    console.log(result)
    res.write(`${result}!\n\n`)
}

async function getProperty(element, propertyName){ // Get Element Property
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}
async function checkout(userBotData, res){ // Initialize Browser

    sendResponse(res, 'Connecting to the site!!!') // Return update to client
    let preferredProxyServer = userBotData["preferredProxyServer"] // Set proxy server

    const args = [
        '--proxy-server=socks5://' + preferredProxyServer,
        '--no-sandbox',
        '--disbale-setuid-sandbox',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        '--disable-extentions',
        '--disbale=gpu',
        '--disable-dev-shm-usage',
        '--allow-file-access-from-files',
        '--allow-file-access',
        '--allow-cross-origin-auth-prompt',
    ]
    const options = {
        slowMo: 50,
        headless: false,       
        ignoreDefaultArgs: ["--enable-automation"], 
        ignoreHTTPSErrors: true,      
        args,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    }

    const browser = await puppeteer.launch(options)
    const context = await browser.createIncognitoBrowserContext() // Use Incognito Browser
    const page = await context.newPage()
    await page.evaluateOnNewDocument(() => {delete navigator.__proto__.webdriver;});
     // Bypass hairline feature
     await page.evaluateOnNewDocument(() => {
        // store the existing descriptor
        const elementDescriptor = Object.getOwnPropertyDescriptor(
          HTMLElement.prototype,
          "offsetHeight"
        );  
        // redefine the property with a patched descriptor
        Object.defineProperty(HTMLDivElement.prototype, "offsetHeight", {
          ...elementDescriptor,
          get: function() {
            if (this.id === "modernizr") {
              return 1;
            }
            // @ts-ignore
            return elementDescriptor.get.apply(this);
          },
        });
    });

    await page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8'
    })

    const pages = await browser.pages()
    if (pages.length > 1) { await pages[0].close() } // Close unused pages
    await page.setViewport({ width: 1920, height: 912, deviceScaleFactor: 1, }) // Set page viewport
    await page.setDefaultTimeout(0) // Set timeout to 0

    // const goto = await page.goto('https://bot.sannysoft.com/', {waitUntil: 'networkidle2', timeout: 0});
    const goto = await page.goto(siteUrl, {waitUntil: 'networkidle2', timeout: 0});

    await searchProduct(page, userBotData, res); // Call searchProduct function to start working
    await browser.close() // Close Browser
}

async function getProperty(element, propertyName){ // Get Element property function
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}

async function searchProduct(page, userBotData, res){
    var preferredCategoryName = userBotData['preferredCategoryName']
    var preferredSKU = userBotData['preferredSKU']
    var preferredTitle = userBotData['preferredTitle']
    var preferredGender = userBotData['preferredGender']

    if(preferredTitle){ // if user only added Product Title

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
                await productElement.click();
                await productPage(page, userBotData)
            }else{
                return "Item Not Found!!!"
            }
        })
        await Promise.all(productMapping)        

    }else if(preferredSKU){ // if user only added Product SKU

        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            await productElement.click();
            await productPage(page, userBotData)
        })
        await Promise.all(productMapping)

    }else if(preferredTitle && preferredSKU ){ // if user only added Both Product Title and SKU

        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            await productElement.click();
            await productPage(page, userBotData)
        })
        await Promise.all(productMapping)

    }  

}

async function productPage(page, userBotData){

    const preferredSize = userBotData['preferredSize']

    await page.waitForSelector("label[class='css-xf3ahq']") // Wait for selector to appear
    const sizeCard = await page.$$("label[class='css-xf3ahq']") // Get all a size link element
    const sizeMapping = sizeCard.map(async (sizeElement) => { // Map all the sizes and find matched size
        const productSize = await getProperty(sizeElement, 'innerText') // Get element Text
        if( productSize === preferredSize){ // If size is equal to preferredSize proceed
            await sizeElement.click();
        }else{
            console.log("Size Not Found!!!")
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

async function checkoutPage(page, userBotData){
    console.log('Checkout Page');
}