const puppeteer = require('puppeteer');
const ac = require('@antiadmin/anticaptchaofficial');
const express = require('express')
let router = express.Router()

const antiCaptchaKey = process.env.anticaptchaAPIKey || '1d0f98f50be1aa14f3b726b3ffdd2ffb'
console.log(antiCaptchaKey)

const siteUrl = process.env.supremeUrl || 'https://supremenewyork.com/shop/all/'; // Store URL to siteUrl
console.log(siteUrl)
// const siteUrl = 'https://supremenewyork.com/shop/all/';

router.get('/supreme', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });
      res.flushHeaders();
    ac.setAPIKey(antiCaptchaKey); // Check Anticaptcha if Connected
        ac.getBalance()
        .then((balance) => {
            // res.send(`Supreme : my balance is: ${balance}`)
            res.write(`Supreme : my balance is: ${balance}\n\n`)
        })
        .catch((error) => {
            // res.send(`Supreme : an error with API key  ${error}`)
            res.write(`Supreme : an error with API key  ${error}`)
        });
    checkout(req.query, res)
    next()
})
module.exports = router

let responseResult = '';
function sendResponse(res, result){ // Response function
    console.log(result)
    res.write(`${result}!\n\n`)
}

async function getProperty(element, propertyName){
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}

async function checkout(userBotData, res){
    responseResult = 'Connecting to the site!!!'
    sendResponse(res, responseResult)

    const url = siteUrl + userBotData["preferredCategoryName"]
    let preferredProxyServer = userBotData["preferredProxyServer"]
    const args = [
        '--proxy-server=socks5://' + preferredProxyServer,     
        '--disable-infobars',
        '--disable-web-security',
        '--disable-features=OutOfBlinkCors',
        '--disable-features=IsolateOrigins',
        ' --disable-site-isolation-trials',
        '--allow-external-pages',
        '--allow-third-party-modules',
        '--data-reduction-proxy-http-proxies',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
    const options = {  
        headless: false,
        slowMo: 35,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--enable-automation"],
        args
    }

    const browser = await puppeteer.launch(options)
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    const pages = await browser.pages()
    if (pages.length > 1) { await pages[0].close() } // Close unused page    
    await page.setViewport({ width: 1920, height: 912, deviceScaleFactor: 1, }) // Set page viewport
    page.setDefaultNavigationTimeout(0)
    page.setDefaultTimeout(0)
    const goto = await page.goto(url, {waitUntil: 'load', timeout: 0});

    if(goto === null){        
        responseResult = 'Cant get the site url... Process Stopped!!!'
        sendResponse(res, responseResult)
        await browser.close()
    }else{
        responseResult = 'Succesfully accessed the site url...'
        sendResponse(res, responseResult)
        await page.waitForSelector(".sold_out_tag")
        await removeSoldOutProduct(page, userBotData, res)
        // await browser.close()     
    }
}

async function removeSoldOutProduct(page, userBotData, res){ // Remove sold out items function
    let itemSoldOut = ".sold_out_tag";
    await page.evaluate((itemSoldOut) => {
        var elements = document.querySelectorAll(itemSoldOut);
        for(var i=0; i< elements.length; i++){ 
            elements[i].parentNode.parentNode.parentNode.removeChild(elements[i].parentNode.parentNode);
        }
    }, itemSoldOut);
    responseResult = 'Successfully removed SOLD OUT products...'
    sendResponse(res, responseResult)
    await selectProductByName(page, userBotData, res); // Proceed to function
}

// Select Available Product By Category
async function selectProductByName(page, userBotData, res){
    let preferredTitle = userBotData["preferredTitle"];

    await page.waitForSelector("div.product-name > a[class='name-link']") // Wait for selector to appear
    const productElement = await page.$$("div.product-name > a[class='name-link']") // Get all a product link element
    const productMapping = productElement.map(async (element) => { // Map all the product and find matched product
        const productTitle = await getProperty(element, 'innerText') // Get element Text
        productText = productTitle.replace(/(\r\n|\n|\r)/gm,"");
        if( productText === preferredTitle){ // If title is equal to PreferredTitle proceed
            await element.click()
            return true   
        }else{
            return false
        }
    })
    await Promise.all(productMapping)
    .then(values => {
        responseResult = `Successfully selected the product ${preferredTitle}`
        sendResponse(res, responseResult)
        addToCart(page, userBotData, res)
    })
    .catch(error => {
        responseResult = error.message
        sendResponse(res, responseResult)
    });     
}

// Bot on Add To Cart Page
async function addToCart(page, userBotData, res){

    let preferredTitle = userBotData["preferredTitle"];
    let preferredColor = userBotData["preferredColor"];
    let preferredSize = userBotData["preferredSize"];
    let preferredQuantity = userBotData["preferredQuantity"];
            
    // If color option exist
    await page.waitForSelector("button[data-style-name='"+preferredColor+"']")
    const colorElement = await page.evaluate((preferredColor) => {
        const element = document.querySelector("button[data-style-name='"+preferredColor+"']");        
        return element;
    }, preferredColor);
    if(colorElement !== null){        
        await page.$eval("button[data-style-name='"+preferredColor+"']", elem => elem.click()); // color picker
        responseResult = `${preferredColor} color succesfully selected... `
        sendResponse(res, responseResult)      
    }

    // If sizes Exist    
    const sizeElement = await page.evaluate(() => {
        const element = document.querySelector('select[aria-labelledby="select-size"]');        
        return element;
    });
    if(sizeElement !== null){
        await page.waitForSelector('select[aria-labelledby="select-size"]')
        const sizeElement1 = await page.$$('select[aria-labelledby="select-size"] > option') 
        const sizeMapping = sizeElement1.map(async (element, res) => {
            const size = await getProperty(element, 'innerText')
            if( size === preferredSize ){
                const value = await getProperty(element, 'value')                
                await page.select('select[aria-labelledby="select-size"]', value)
                responseResult = `${size} size succesfully selected... `
                sendResponse(res, responseResult)
            }else{
                responseResult = `${size} size not found... Process Stopped!!!`
                sendResponse(res, responseResult)
            }
        })
    }

    // If Quantity Exist
    const qtyElement = await page.evaluate(() => {
        const element = document.querySelector('select#qty');        
        return element;
    });
    if(qtyElement !== null){  
        await page.waitForSelector('select#qty')      
        await page.select("select#qty", preferredQuantity); // Quantity select
        responseResult = `${preferredQuantity} quantity/ies selected...`
        sendResponse(res, responseResult)
    }

    // If Add To Cart Button Exist    
    const addToCartElement = await page.evaluate(() => {
        const element = document.querySelector("input[type='submit']");        
        return element;
    });
    if(addToCartElement !== null){
        await page.waitForSelector("input[type='submit']")
        await page.$eval("input[value='add to cart']", elem => elem.click()) // add to cart button
        await page.waitForSelector("a[class='button checkout']", {visible: true})
        await page.$eval("a[class='button checkout']", elem => elem.click()) // checkout button
        try {
            responseResult = `${preferredTitle} product successfully added to cart...`
            sendResponse(res, responseResult)
            checkoutFormPage(page, userBotData, res)
        } catch (e) {
            await page.waitForSelector('input#order_billing_name');
            responseResult = `Product Does Not Exist... Retrying to select product ${preferredTitle}!!!`
            sendResponse(res, responseResult)
            checkoutFormPage(page, userBotData, res)           
        }
    }
}

// Bot on Delivery Page
async function checkoutFormPage(page, userBotData, res){
    let preferredBillingName = userBotData["preferredBillingName"];
    let preferredOrder_email = userBotData["preferredOrder_email"];
    let preferredOrder_number = userBotData["preferredOrder_number"];
    let preferredOrder_billing_address = userBotData["preferredOrder_billing_address"];
    let preferredOrder_billing_city = userBotData["preferredOrder_billing_city"];
    let preferredOrder_billing_zip = userBotData["preferredOrder_billing_zip"];
    let preferredOrder_billing_state = userBotData["preferredOrder_billing_state"];
    let preferredCreditCardNumber = userBotData["preferredCreditCardNumber"];
    let preferredCcnMonth = userBotData["preferredCcnMonth"];
    let preferredCcnYear = userBotData["preferredCcnYear"];
    let preferredCcnCVV = userBotData["preferredCcnCVV"];

    await page.waitForSelector("input[id='order_billing_name']")
    const order_billing_name = await page.evaluate(() => {
        const element = document.querySelector("input[id='order_billing_name']");        
        return element;
    });
    if(order_billing_name !== null){
        await page.type("input[id='order_billing_name']", preferredBillingName); // Write Full Name        
        await page.waitForTimeout(1000);
        responseResult = `Successfully written Billing Name...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[id='order_email']")
    const order_email = await page.evaluate(() => {
        const element = document.querySelector("input[id='order_email']");        
        return element;
    });
    if(order_email !== null){
        await page.type("input[id='order_email']", preferredOrder_email); // Write Email        
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Email Address...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[id='order_tel']")
    const order_tel = await page.evaluate(() => {
        const element = document.querySelector("input[id='order_tel']");        
        return element;
    });
    if(order_tel !== null){
        await page.type("input[id='order_tel']", preferredOrder_number); // Write Contact Number        
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Contact Number...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[name='order[billing_address]']")
    const billing_address = await page.evaluate(() => {
        const element = document.querySelector("input[name='order[billing_address]']");        
        return element;
    });
    if(billing_address !== null){
        await page.type("input[name='order[billing_address]']", preferredOrder_billing_address); // Write Billing Address        
        await page.waitForTimeout(1000);
        responseResult = `Successfully written Billing Address...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[name='order[billing_zip]']")
    const order_billing_zip = await page.evaluate(() => {
        const element = document.querySelector("input[name='order[billing_zip]']");        
        return element;
    });
    if(order_billing_zip !== null){
        await page.type("input[name='order[billing_zip]']", preferredOrder_billing_zip); // Write Zip Code        
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Zip Code...`
        sendResponse(res, responseResult)
    }

    // await page.waitForSelector("input[name='order[billing_city]']")
    // const order_billing_city = await page.evaluate(() => {
    //     const element = document.querySelector("input[name='order[billing_city]']");        
    //     return element;
    // });
    // if(order_billing_city !== null){
    //     await page.type("input[name='order[billing_city]']", preferredOrder_billing_city); // Write City
    //     await page.waitForTimeout(1000)
    //     responseResult = `Successfully written City...`
    //     sendResponse(res, responseResult)
    // }
    
    // await page.waitForSelector("select#order_billing_state")
    // const order_billing_state = await page.evaluate(() => {
    //     const element = document.querySelector("select#order_billing_state");        
    //     return element;
    // });
    // if(order_billing_state !== null){
    //     await page.select("select#order_billing_state", preferredOrder_billing_state); // Select State
    //     await page.waitForTimeout(1000)
    //     responseResult = `Successfully selected State...`
    //     sendResponse(res, responseResult)
    // }

    await page.waitForSelector("input[id='rnsnckrn']")
    const rnsnckrn = await page.evaluate(() => {
        const element = document.querySelector("input[id='rnsnckrn']");        
        return element;
    });
    if(rnsnckrn !== null){
        await page.type("input[id='rnsnckrn']", preferredCreditCardNumber); // Write Credit Card Number
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Credit Card Number...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("select[id='credit_card_month']")
    const credit_card_month = await page.evaluate(() => {
        const element = document.querySelector("select[id='credit_card_month']");        
        return element;
    });
    if(credit_card_month !== null){
        // await page.type("input[id='credit_card_month']", preferredCcnMonth); // Write Credit Card Month
        await page.select("select[id='credit_card_month']", preferredCcnMonth);
        await page.waitForTimeout(1000)
        responseResult = `Successfully selected Credit Card Month...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("select[id='credit_card_year']")
    const credit_card_year = await page.evaluate(() => {
        const element = document.querySelector("select[id='credit_card_year']");        
        return element;
    });
    if(credit_card_year !== null){
        await page.type("select[id='credit_card_year']", preferredCcnYear); // Write Credit Card Year
        await page.waitForTimeout(1000)
        responseResult = `Successfully selected Credit Card Year...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[id='orcer']")
    const orcer = await page.evaluate(() => {
        const element = document.querySelector("input[id='orcer']");        
        return element;
    });
    if(orcer !== null){
        await page.type("input[id='orcer']", preferredCcnCVV); // Write Credit Card CVV
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Credit Card CVV...`
        sendResponse(res, responseResult)
    }
    
    await page.waitForSelector('input[id="order_terms"]')
    const order_terms = await page.$('input[id="order_terms"]'); // Click Terms and Condition
    console.log(await (await order_terms.getProperty('checked')).jsonValue());
    await order_terms.click(); // Check Order Terms

    await page.waitForSelector("input[name='commit']")
    await page.$eval("input[name='commit']", elem => elem.click()); // checkout button
    await page.waitForTimeout(1000);

    // Final step re captcha solver
    const gReCaptchaElement = await page.evaluate(() => { // Check if gReCaptcha
        const element = document.querySelector(".g-recaptcha");        
        return element;
    });

    const hReCaptchaElement = await page.evaluate(() => { // Check if hReCaptcha
        const element = document.querySelector("div[data-callback='checkoutAfterCaptcha']");        
        return element;
    });

    await page.waitForTimeout(1000)
    if(gReCaptchaElement){
        await gReCaptchaResolver(page, userBotData, res)
    }else if(hReCaptchaElement){
        await hReCaptchaResolver(page, userBotData, res)
    }
}

async function hReCaptchaResolver(page, userBotData, res){
    responseResult = `Solving ReCaptcha!!`
    sendResponse(res, responseResult)
    const captchaSiteKey = await page.evaluate(() => {
        const element = document.querySelector("div[data-callback='checkoutAfterCaptcha']")
        let attribute = element.getAttribute('data-sitekey')
        return attribute;
    });
    await page.waitForSelector("textarea[name='h-captcha-response']")

    if(captchaSiteKey){
        let captchaResponseToken = await ac.solveHCaptchaProxyless( page.url(), captchaSiteKey )
        
        .then((gresponse) => {
            responseResult = `Captcha Solved!`
            sendResponse(res, responseResult)
            return true
        })
        .catch((error) => {
            responseResult = `Error ReCaptcha Solving! ${error}`
            sendResponse(res, responseResult)
            return false
        });
        if(captchaResponseToken == true){
            await page.evaluate(`document.querySelector("textarea[name='h-captcha-response']").innerHTML="${captchaResponseToken}"`)            
            await page.evaluate(`document.getElementById("checkout_form").submit();`)
            responseResult = `ReCaptcha Solved! Finalizing Checkout!! ${captchaResponseToken}`
            sendResponse(res, responseResult)
            await confirmationPage(page, userBotData, res)
        }else{
            responseResult = `Invalid ReCaptcha... Trying to resolve...`
            sendResponse(res, responseResult)
            hReCaptchaResolver(page, userBotData, res)
        }
    }
}


async function gReCaptchaResolver(page, userBotData, res){
    const captchaSiteKey = await page.evaluate(() => {
        const element = document.querySelector(".g-recaptcha")
        let attribute = element.getAttribute('data-sitekey')
        return attribute;
    });

    if(captchaSiteKey){

        let captchaResponseToken = await ac.solveRecaptchaV2Proxyless( page.url(), captchaSiteKey )
        .then(gresponse => {
            responseResult = `Solving ReCaptcha! ${gresponse}`
            sendResponse(res, responseResult)
            return true
        })
        .catch(error => {            
            responseResult = `Error ReCaptcha Solving ${error}`
            sendResponse(res, responseResult)
            return false
        })

        if(captchaResponseToken == true){
            await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${captchaResponseToken}";`)            
            await page.evaluate(`document.getElementById("checkout_form").submit();`)
            responseResult = `ReCaptcha Solved! Finalizing Checkout!!`
            sendResponse(res, responseResult)
            await confirmationPage(page, userBotData, res)
        }else{
            responseResult = `Invalid ReCaptcha... Trying to resolve...`
            sendResponse(res, responseResult)
            gReCaptchaResolver(page, userBotData, res)
        }  

    }
}

async function confirmationPage(page, userBotData, res){    
    let preferredTitle = userBotData['preferredTitle']
    await page.waitForSelector("#confirmation")

    const successMessage = await page.evaluate(() => {
        const element = document.querySelector("#confirmation")
        let attribute = element.getAttribute('class')
        return attribute;
    });

    if(successMessage === 'failed'){               
        responseResult = `Failed to checkout product ${preferredTitle}.. Retrying...`
        sendResponse(res, responseResult)
        await page.goBack()
        await page.goBack()
        await addToCart(page, userBotData, res)
        // await page.close()
        // checkout(userBotData, res)
    }else{
        responseResult = `Succeffully Purchased the item ${preferredTitle}...`
        sendResponse(res, responseResult)
        // await page.close()
    }
}