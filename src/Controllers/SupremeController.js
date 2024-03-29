const http = require('http')
const https = require('https')
const puppeteer = require('puppeteer-extra')
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const pluginProxy = require('puppeteer-extra-plugin-proxy')
const ac = require('@antiadmin/anticaptchaofficial')
const { PrivacyApi } = require('privacy.com')

// Production
const antiCaptchaKey = process.env.ANTICAPTCHA_API_KEY || '1d0f98f50be1aa14f3b726b3ffdd2ffb' // AntiCaptcha API Key
const privacyApi = new PrivacyApi(process.env.PRIVACY_API_KEY || 'a2c5ee29-5557-4dee-838f-7f17d00de073', false) // Privay API Key
// const privacyApi = new PrivacyApi('269db36d-8d7f-483a-9031-e861a80cecf4', true) // Development
const siteUrl = process.env.SUPREME_URL || 'https://www.supremenewyork.com/shop/all/' // Store URL

/**
 * Puppeteer Stealth Pre Settings for anti bot detection
**/ 
puppeteer.use(StealthPlugin())
puppeteer.use(pluginProxy({
    address: 'zproxy.lum-superproxy.io',
    port: 22225,
    credentials: {
      username: 'lum-customer-c_35009731-zone-dnashoebot-country-us',
      password: 'jiv2w#%o42of',
    }
  }))

exports.supreme = (req, res, next) => {
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    })
    res.flushHeaders()

    ac.setAPIKey(antiCaptchaKey)
    ac.getBalance()
    .then((balance) => {
        res.write(`Supreme : my balance is: ${balance}\n\n`)
    })
    .catch((error) => {
        res.write(`Supreme : an error with API key  ${error}`)
    });
    let userBotData = req.query
    // createCard(req.query, res) // Privay.com check response of create API
    // checkoutCluster(userBotData, res)
    checkout(userBotData, res)
    
    next()
}

async function createCard(userBotData, res){ // Privacy.com 

    // let cardName = userBotData['preferredBillingName']
    // const createCardParams = {
    //     type: "SINGLE_USE",
    //     memo: cardName,
    //     spend_limit: 100,
    //     spend_limit_duration: "TRANSACTION"
    // }    
    // privacyApi
    //     .createCard(createCardParams)
    //     .then((createCardResponse) => {
            
    //         const data = createCardResponse.data
    //         let obj = {}
    //         obj.preferredCreditCardNumber = data.pan
    //         obj.preferredCcnMonth = data.exp_month
    //         obj.preferredCcnYear = data.exp_year
    //         obj.preferredCcnCVV = data.cvv
    //         Object.assign(userBotData, obj)
            
    //         console.log(data)
    //         sendResponse(res, `Virtual Credit Card Created!!!`)
    //         // checkout(userBotData, res)
    //     })
    //     .catch((e) => {
    //         console.log(e)
    //         const message = "Card Error : " + e.response.status + " " + e.response.statusText
    //         sendResponse(res, message)
    //     })


    // const listCardsParams = {
    //     page: 1,
    //     page_size: 50,
    //     begin: "2021-06-01",
    //     end: "2021-07-31"
    // }

    // privacyApi
    //     .hostedCardUi(listCardsParams)
    //     .then((listCards) => {
            
    //         const data = listCards.data
    //         // let obj = {}
    //         // obj.preferredCreditCardNumber = data.pan
    //         // obj.preferredCcnMonth = data.exp_month
    //         // obj.preferredCcnYear = data.exp_year
    //         // obj.preferredCcnCVV = data.cvv
    //         // Object.assign(userBotData, obj)
            
    //         console.log(listCards)
    //         sendResponse(res, `Virtual Credit Card Created!!!`)
    //         // checkout(userBotData, res)
    //     })
    //     .catch((e) => {
    //         console.log(e)
    //         const message = "Card Error : " + e.response.status + " " + e.response.statusText
    //         sendResponse(res, message)
    //     })

}

async function startProfile(userBotData, res){ // Multi Login Settings
    //Replace profileId value with existing browser profile ID.
    let profileId = '2294b154-ceba-4820-ae18-407d2a78862a';
    // let mlaPort = 35000;
    let mlaPort = 5001;
  
    /*Send GET request to start the browser profile by profileId.
    Returns web socket as response which should be passed to puppeteer.connect*/
    http.get(`http://127.0.0.1:${mlaPort}/api/v1/profile/start?automation=true&puppeteer=true&profileId=${profileId}`, (resp) => {
        let data = '';
        let ws = '';
    
        //Receive response data by chunks
        resp.on('data', (chunk) => {
         data += chunk;
        });
    
        /*The whole response data has been received. Handling JSON Parse errors,
        verifying if ws is an object and contains the 'value' parameter.*/
        resp.on('end', () => {
            let ws;
            try {
                ws = JSON.parse(data);
            } catch(err) {
                console.log(err);
            }
            if (typeof ws === 'object' && ws.hasOwnProperty('value')) {
                console.log(`Browser websocket endpoint: ${ws.value}`);
                // run(ws.value);
                run(userBotData, res, ws.value)
            }
        });
  
    }).on("error", (err) => {
      console.log(err.message);
    });
}

async function checkoutCluster(userBotData, res){

        sendResponse(res, 'Connecting to the site!!!') // Return update to client
        const url = siteUrl + userBotData["preferredCategoryName"] // Add Category name to the url to scrape

        const args = ['--no-sandbox']
        const ignoreDefaultArgs = ["--enable-automation", "--enable-blink-features=IdleDetection"]
        const options = {
            slowMo: 50,
            headless: false,
            ignoreHTTPSErrors: true,
            ignoreDefaultArgs: ignoreDefaultArgs,
            args
        }

        const cluster = await Cluster.launch({
            options,
            puppeteer,
            maxConcurrency: 2,
            concurrency: Cluster.CONCURRENCY_CONTEXT
        })
    
        await cluster.task(async ({page, data:url}) => {
            const goto = await page.goto(url, {waitUntil: 'networkidle2', timeout: 0})
        
            if(goto === null){
                sendResponse(res, 'Cant get the site url... Process Stopped!!!')
                await browser.close()
            }else{
                sendResponse(res, 'Succesfully accessed the site url...')
                await page.waitForSelector(".sold_out_tag")
                await removeSoldOutProduct(page, userBotData, res)
            }
        })
    
        // Queue any number of tasks
        cluster.queue(url)
        await cluster.idle()
        await cluster.close()
}

async function checkout(userBotData, res){
    sendResponse(res, 'Connecting to the site!!!') // Return update to client
    const url = siteUrl + userBotData["preferredCategoryName"] // Add Category name to the url to scrape

    const args = ['--no-sandbox']
    const ignoreDefaultArgs = ["--enable-automation", "--enable-blink-features=IdleDetection"]
    const options = {
        slowMo: 50,
        headless: false,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ignoreDefaultArgs,
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
        sendResponse(res, 'Succesfully accessed the site url...')
        await page.waitForSelector(".sold_out_tag")
        await removeSoldOutProduct(page, userBotData, res)
    }
}

async function removeSoldOutProduct(page, userBotData, res){ // Remove sold out items function
    let itemSoldOut = ".sold_out_tag"
    await page.evaluate((itemSoldOut) => {
        var elements = document.querySelectorAll(itemSoldOut);
        for(var i=0; i< elements.length; i++){ 
            elements[i].parentNode.parentNode.parentNode.removeChild(elements[i].parentNode.parentNode);
        }
    }, itemSoldOut)

    sendResponse(res, 'Successfully removed SOLD OUT products...')
    await selectProductByName(page, userBotData, res) // Proceed to function selecting of product
}

async function selectProductByName(page, userBotData, res){ // Select Available Product By Category
    
    let preferredTitle = userBotData["preferredTitle"]
    let preferredColor = userBotData["preferredColor"]
    sendResponse(res, `Searching for the product ${preferredTitle} color ${preferredColor}`)

    await page.waitForSelector("div.product-name > a[class='name-link']") // Wait for selector to appear
    const productElement = await page.$$("div.product-name > a[class='name-link']") // Get all a product link element
    const productColorElement = await page.$$("div.product-style > a[class='name-link']") // Get all a product link element
    
    let found 
    for(var i = 0; i < productElement.length; i++){
        const productName = await (await productElement[i].getProperty('innerText')).jsonValue()
        const productColor = await (await productColorElement[i].getProperty('innerText')).jsonValue();
        productText = productName.replace(/(\r\n|\n|\r)/gm,"")

        if(productText === preferredTitle && productColor === preferredColor){
            let element  = productColorElement[i]
            await mouseMove(element, page)
            await productColorElement[i].click()
            found = true
            break
        }else {
            found = false
        }
    }

    if(found === false){
        sendResponse(res, `Product ${preferredTitle} with the color of ${preferredColor} is no longer available...`)
        sendResponse(res, `Process Stopped...`)
        await page.close()
    }else{
        sendResponse(res, `Successfully selected the product ${preferredTitle}`)
        addToCart(page, userBotData, res)
    }
}

// Bot on Add To Cart Page
async function addToCart(page, userBotData, res){

    let preferredTitle = userBotData["preferredTitle"]
    let preferredColor = userBotData["preferredColor"];
    let preferredSize = userBotData["preferredSize"]
    let preferredQuantity = userBotData["preferredQuantity"]
            
    // If color option exist
    await page.waitForSelector("button[data-style-name='"+preferredColor+"']")
    const colorElement = await page.evaluate((preferredColor) => {
        const element = document.querySelector("button[data-style-name='"+preferredColor+"']");        
        return element;
    }, preferredColor)

    if(colorElement !== null){
        element = await page.$("button[data-style-name='"+preferredColor+"']");
        await mouseMove(element, page)
        await page.$eval("button[data-style-name='"+preferredColor+"']", elem => elem.click()); // color picker
        sendResponse(res, `${preferredColor} color succesfully selected... `)      
    }

    // If sizes Exist
    const sizeElement = await page.evaluate(() => {
        const element = document.querySelector('select[aria-labelledby="select-size"]');        
        return element;
    })
    if(sizeElement !== null){
        await page.waitForSelector('select[aria-labelledby="select-size"]')
        const element = await page.$$('select[aria-labelledby="select-size"] > option')
        await mouseMove(element, page)

        const sizeMapping = element.map(async (element) => {
            const size = await getProperty(element, 'innerText')
            if( size === preferredSize ){
                const value = await getProperty(element, 'value')                
                await page.select('select[aria-labelledby="select-size"]', value)
                sendResponse(res, `${size} size succesfully selected... `)
            }else{
                sendResponse(res, `${size} size not found... Process Stopped!!!`)
                // await page.close()
            }
        })
    }

    // If Quantity Exist
    const qtyElement = await page.evaluate(() => {
        const element = document.querySelector('select#qty');        
        return element;
    })
    if(qtyElement !== null){  
        await page.waitForSelector('select#qty')
        let element = await page.$("select#qty");
        await mouseMove(element, page)    
        await page.select("select#qty", preferredQuantity); // Quantity select
        responseResult = `${preferredQuantity} quantity/ies selected...`
        sendResponse(res, responseResult)
    }

    // If Add To Cart Button Exist
    const addToCartElement = await page.evaluate(() => {
        const element = document.querySelector("input[value='add to cart']");        
        return element;
    })
    if(addToCartElement !== null){
        await page.waitForSelector("input[value='add to cart']")
        let element = await page.$("input[value='add to cart']");
        await mouseMove(element, page)
        await page.$eval("input[value='add to cart']", elem => elem.click()) // add to cart button

        await page.waitForSelector("a[class='button checkout']", {visible: true})
        let checkoutElement  = await page.$("a[class='button checkout']");
        await mouseMove(checkoutElement, page)
        // await page.$eval("a[class='button checkout']", elem => elem.click()) // checkout button

        try {
            sendResponse(res, `${preferredTitle} product successfully added to cart...`)
            await page.waitForSelector('input#order_billing_name');
            checkoutFormPage(page, userBotData, res)
        } catch (e) {
            sendResponse(res, `${preferredTitle} Product Does Not Exist...`)
            sendResponse(res, `End Transaction!!!`)
            await page.close()
        }
    }
}

// Bot on Delivery Page
async function checkoutFormPage(page, userBotData, res){
    let preferredBillingName = userBotData["preferredBillingName"]
    let preferredOrder_email = userBotData["preferredOrder_email"]
    let preferredOrder_number = userBotData["preferredOrder_number"]
    let preferredOrder_billing_address = userBotData["preferredOrder_billing_address"]
    let preferredOrder_billing_address2 = userBotData["preferredOrder_billing_address2"]
    let preferredOrder_billing_zip = userBotData["preferredOrder_billing_zip"]
    let preferredOrder_billing_state = userBotData["preferredOrder_billing_state"]
    let preferredCreditCardNumber = userBotData["preferredCreditCardNumber"]
    let preferredCcnMonth = userBotData["preferredCcnMonth"]
    let preferredCcnYear = userBotData["preferredCcnYear"]
    let preferredCcnCVV = userBotData["preferredCcnCVV"]

    await page.waitForSelector("input[id='order_billing_name']")
    const order_billing_name = await page.evaluate(() => {
        const element = document.querySelector("input[id='order_billing_name']");       
        return element;
    })
    let order_billing_nameelement  = await page.$("input[id='order_billing_name']");
    await mouseMove(order_billing_nameelement, page)
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
    })
    let order_emailelement  = await page.$("input[id='order_email']");
    await mouseMove(order_emailelement, page)
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
    })
    let order_telelement  = await page.$("input[id='order_tel']");
    await mouseMove(order_telelement, page)
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
    })
    let billing_addresselement  = await page.$("input[name='order[billing_address]']");
    await mouseMove(billing_addresselement, page)
    if(billing_address !== null){
        await page.type("input[name='order[billing_address]']", preferredOrder_billing_address); // Write Billing Address        
        await page.waitForTimeout(1000);
        responseResult = `Successfully written Billing Address...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[name='order[billing_address_2]']")
    const billing_address2 = await page.evaluate(() => {
        const element = document.querySelector("input[name='order[billing_address_2]']");        
        return element;
    })
    let billing_addresse2lement  = await page.$("input[name='order[billing_address_2]']");
    await mouseMove(billing_addresse2lement, page)
    if(billing_address2 !== null){
        await page.type("input[name='order[billing_address_2]']", preferredOrder_billing_address2); // Write Billing Address        
        await page.waitForTimeout(1000);
        responseResult = `Successfully written Billing Address 2...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[name='order[billing_zip]']")
    const order_billing_zip = await page.evaluate(() => {
        const element = document.querySelector("input[name='order[billing_zip]']");        
        return element;
    })
    let order_billing_zipelement  = await page.$("input[name='order[billing_zip]']");
    await mouseMove(order_billing_zipelement, page)
    if(order_billing_zip !== null){
        await page.type("input[name='order[billing_zip]']", preferredOrder_billing_zip); // Write Zip Code        
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Zip Code...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[name='order[billing_city]']")
    const selector = 'input[name="order[billing_city]"]'
    await page.waitForFunction(
        selector => document.querySelector(selector).value.length > 0,
        {},
        selector
    )
    let billing_city  = await page.$(selector);
    await mouseMove(billing_city, page)
    await page.waitForSelector("select#order_billing_state")
    const order_billing_state = await page.evaluate(() => {
        const element = document.querySelector("select#order_billing_state");        
        return element;
    });
    
    if(order_billing_state !== null){
        await page.select("select#order_billing_state", preferredOrder_billing_state); // Select State
        await page.waitForTimeout(1000)
        responseResult = `Successfully selected State...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[id='credit_card_number']")
    const rnsnckrn = await page.evaluate(() => {
        const element = document.querySelector("input[id='credit_card_number']");        
        return element;
    })
    let rnsnckrnelement  = await page.$("input[id='credit_card_number']");
    await mouseMove(rnsnckrnelement, page)
    if(rnsnckrn !== null){
        await page.type("input[id='credit_card_number']", preferredCreditCardNumber); // Write Credit Card Number
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Credit Card Number...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("select[id='credit_card_month']")
    const credit_card_month = await page.evaluate(() => {
        const element = document.querySelector("select[id='credit_card_month']");        
        return element;
    })
    let credit_card_monthelement  = await page.$("select[id='credit_card_month']");
    await mouseMove(credit_card_monthelement, page)
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
    })
    let credit_card_yearelement  = await page.$("select[id='credit_card_year']");
    await mouseMove(credit_card_yearelement, page)
    if(credit_card_year !== null){
        await page.type("select[id='credit_card_year']", preferredCcnYear); // Write Credit Card Year
        await page.waitForTimeout(1000)
        responseResult = `Successfully selected Credit Card Year...`
        sendResponse(res, responseResult)
    }

    await page.waitForSelector("input[id='credit_card_verification_value']")
    const orcer = await page.evaluate(() => {
        const element = document.querySelector("input[id='credit_card_verification_value']");        
        return element;
    })
    let orcerelement  = await page.$("input[id='credit_card_verification_value']");
    await mouseMove(orcerelement, page)
    if(orcer !== null){
        await page.type("input[id='credit_card_verification_value']", preferredCcnCVV); // Write Credit Card CVV
        await page.waitForTimeout(1000)
        responseResult = `Successfully written Credit Card CVV...`
        sendResponse(res, responseResult)
    }
    
    await page.waitForSelector('input[id="order_terms"]')
    const order_terms = await page.$('input[id="order_terms"]') // Click Terms and Condition
    await mouseMove(order_terms, page)
    // await order_terms.click(); // Check Order Terms

    await page.waitForTimeout(1000)
    await page.waitForSelector("input[name='commit']")
    let commitElement  = await page.$("input[name='commit']");
    await mouseMove(commitElement, page)
    // await page.$eval("input[name='commit']", elem => elem.click()) // checkout button
    
    await page.waitForTimeout(1000)
    // Final step re captcha solver
    const gReCaptchaElement = await page.evaluate(() => { // Check if gReCaptcha
        const element = document.querySelector(".g-recaptcha");        
        return element;
    });

    const hReCaptchaElement = await page.evaluate(() => { // Check if hReCaptcha
        const element = document.querySelector("div[data-callback='checkoutAfterCaptcha']");        
        return element;
    });

    console.log("gReCaptchaElement : " + gReCaptchaElement)
    console.log("hReCaptchaElement : " + hReCaptchaElement)
    
    await page.waitForTimeout(1000)
    if(gReCaptchaElement){
        await gReCaptchaResolver(page, userBotData, res)
    }else if(hReCaptchaElement){
        await hReCaptchaResolver(page, userBotData, res)
    }
}

async function hReCaptchaResolver(page, userBotData, res){
    sendResponse(res, `Solving hReCaptcha ReCaptcha!!`)
    await page.waitForTimeout(1000)
    await page.waitForSelector("div[data-callback='checkoutAfterCaptcha']")

    const captchaSiteKey = await page.evaluate(() => {
        const element = document.querySelector("div[data-callback='checkoutAfterCaptcha']")        
        let attribute = element.getAttribute('data-sitekey')
        return attribute;
    });

    // const captchaSiteKey = await page.$$eval("div[data-callback='checkoutAfterCaptcha']", el => el.map(x => x.getAttribute("data-sitekey")))

    console.log("captchaSiteKey " + captchaSiteKey)
    await page.waitForSelector("textarea[name='h-captcha-response']")

    if(captchaSiteKey){

        let captchaResponseToken = await ac.solveHCaptchaProxyless( page.url(), captchaSiteKey )
        console.log(captchaResponseToken)

        .then((gresponse) => {
            responseResult = `Captcha Solved! ${gresponse}`
            sendResponse(res, responseResult)
            return gresponse
        })
        .catch((error) => {
            responseResult = `Error ReCaptcha Solving! ${error}`
            sendResponse(res, responseResult)
            return false
        })

        console.log(gresponse)

        // if(captchaResponseToken){
        //     await page.waitForTimeout(1000)
        //     await page.evaluate(`document.querySelector("textarea[name='h-captcha-response']").innerHTML="${captchaResponseToken}"`)            
        //     await page.evaluate(`document.getElementById("checkout_form").submit();`)
        //     responseResult = `ReCaptcha Solved! Finalizing Checkout!! ${captchaResponseToken}`
        //     sendResponse(res, responseResult)
        //     await confirmationPage(page, userBotData, res)
        // }else{
        //     responseResult = `Invalid ReCaptcha... Trying to resolve...`
        //     sendResponse(res, responseResult)
        //     hReCaptchaResolver(page, userBotData, res)
        // }
    }
}


async function gReCaptchaResolver(page, userBotData, res){
    sendResponse(res, `Solving gReCaptcha ReCaptcha!!`)

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
            await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML = "${captchaResponseToken}";`)            
            await page.evaluate(`document.getElementById("checkout_form").submit();`)
            sendResponse(res, `ReCaptcha Solved! Finalizing Checkout!!`)
            await confirmationPage(page, userBotData, res)
        }else{
            sendResponse(res, `Invalid ReCaptcha... Trying to resolve...`)
            gReCaptchaResolver(page, userBotData, res)
        }  

    }
}

async function confirmationPage(page, userBotData, res){    
    let preferredTitle = userBotData['preferredTitle']

    // Check if page redirects to duplicate page
    const duplicate = await page.evaluate(() => {
        const element = document.querySelector('.cart_page');        
        return element;
    })
    if(duplicate !== null){
        sendResponse(res, `You have previously ordered this item ${preferredTitle}. There is a limit of 1 style per product`)
        sendResponse(res, `Continue checking out...`) 
        await page.waitForSelector("a[class='button checkout']")
        await page.$eval("a[class='button checkout']", elem => elem.click())

        await page.waitForSelector('input#order_billing_name');
        checkoutFormPage(page, userBotData, res)
    }
    console.log("DUPLICATE : " + duplicate)

    // Check if page redirects to duplicate page
    const failed = await page.evaluate(() => {
        const element = document.querySelector('.failed');        
        return element;
    })
    if(failed !== null){
        sendResponse(res, `Detected as a bot..`)
        sendResponse(res, `Check Out Failed...`)
        await page.waitForSelector("a[id='back']");
        await page.$eval("a[id='back']", elem => elem.click())
        await page.close()
        checkout(userBotData, res)
    }
    console.log("FAILED : " + failed)

    // Check if page redirects to success page
    const successMessage = await page.evaluate(() => {
        const element = document.querySelector('.success').innerText.includes("Thank you")
        return element
    })
    if(successMessage !== null){
        if(successMessage === true){
            sendResponse(res, `Succeffully Purchased the item ${preferredTitle}...`)
            await page.close()   
        }else{        
            sendResponse(res, `Failed to checkout product ${preferredTitle}...`)
            await page.close()
        }
    }
    console.log("SUCCESS MESSAGE : " + successMessage)
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

async function mouseMove(element, page){
    try {
        let box = await element.boundingBox()
        const x = box.x + (box.width/2)
        const y = box.y + (box.height/2)
        console.log(x + " and " + y)
        await page.mouse.move(x,y)
        await page.mouse.click(x,y)
        return true
    }
    catch(e) {
        return true
    }
}