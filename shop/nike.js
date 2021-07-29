const http = require('http')
const puppeteer = require('puppeteer')
const ac = require('@antiadmin/anticaptchaofficial')
const { PrivacyApi } = require('privacy.com')
const express = require('express')
let router = express.Router()

// Production
const antiCaptchaKey = process.env.ANTICAPTCHA_API_KEY || '1d0f98f50be1aa14f3b726b3ffdd2ffb'
const siteUrl = process.env.NIKE_URL || 'https://www.nike.com/launch/t/' // Store URL

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
    startProfile(req.query, res)
    next()
})
module.exports = router

async function startProfile(userBotData, res){
    const profileId = userBotData['profileId']
    console.log(profileId)
    let mlaPort = 5001;
    sendResponse(res, `Starting MLA Profile ${profileId}`)

    http.get(`http://127.0.0.1:${mlaPort}/api/v1/profile/start?automation=true&puppeteer=true&profileId=${profileId}`, (resp) => {
    let data = '';
    let ws = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      let ws;
      try {
        ws = JSON.parse(data);
      } catch(err) {
        sendResponse(res, `MLA Error : ${err}...`)
        startProfile(userBotData, res)
      }
      if (typeof ws === 'object' && ws.hasOwnProperty('value')) {        
        sendResponse(res, `Succesfully Opened Browser with Profile Id : ${profileId}...`)
        initBrowser(userBotData, res, ws.value)
      }
    });  
    }).on("error", (err) => {
      sendResponse(res, 'MLA Error : ' + err.message)
    });
}

async function initBrowser(userBotData, res, ws){ // Initialize Browser
    sendResponse(res, 'Connecting to the site!!!') // Return update to client
    let preferredTitle = userBotData['preferredTitle']
    const url = siteUrl + preferredTitle.split(' ').join('-').toLowerCase()

    const args = ['--proxy-server=zproxy.lum-superproxy.io:22225']
    const options = {
        browserWSEndpoint: ws,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        args
    }
    const browser = await puppeteer.connect(options);
    const page = await browser.newPage()
    await page.authenticate({
        username: 'lum-customer-c_35009731-zone-dnashoebot-country-us',
        password: 'jiv2w#%o42of'
    })
    
    
    await page.setDefaultTimeout(0) // Set timeout to 0
    await page.setViewport({ width: 1366, height: 691, deviceScaleFactor: 1, })
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
    })

    const goto = await page.goto(url, {waitUntil: 'networkidle2', timeout: 0})
    if(goto === null){
        sendResponse(res, 'Cant get the site url... Process Stopped!!!')
        await browser.close()
    }else{
        sendResponse(res, 'Connected to the site...')
        await productPage(page, userBotData, res)
        // await searchProduct(page, userBotData, res)
    }

}

async function searchProduct(page, userBotData, res){
    var preferredCategoryName = userBotData['preferredCategoryName']
    var preferredSKU = userBotData['preferredSKU']
    var preferredTitle = userBotData['preferredTitle']
    var preferredGender = userBotData['preferredGender']

    if(preferredTitle){ // if user added Product Title
        sendResponse(res, `Searching Product ${preferredTitle}...`)

        await page.waitForSelector("a[aria-label='"+preferredCategoryName+"']") // Wait for preferred Category selector
        // await page.$eval("a[aria-label='"+preferredCategoryName+"']", elem => elem.click()) // Click preferred category
        preferredCategoryNameElement = await page.$("a[aria-label='"+preferredCategoryName+"']") // get preferred category selector and assign to variable
        await mouseMove(preferredCategoryNameElement, page) // move mouse to element and click
        sendResponse(res, `${preferredCategoryName} Category Selected...`)
        await page.waitForTimeout(2000)

        // await page.waitForSelector("a[aria-label='Filter for "+preferredGender+"']") // Wait for preferred Gender selector
        // preferredGenderElement = await page.$("a[aria-label='Filter for "+preferredGender+"']") // get preferred category selector and assign to variable
        // await mouseMove(preferredGenderElement, page) // move mouse to element and click
        // await page.click("a[aria-label='Filter for "+preferredGender+"']")
        // sendResponse(res, `${preferredGender} Gender Selected...`)
        // await page.waitForTimeout(2000)


        // await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for preffered product title selector
        // const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        // const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product

        //     const productTitle = await getProperty(productElement, 'innerText') // Get element Text
        //     if( productTitle === preferredTitle){ // If title is equal to PreferredTitle proceed                
        //         await mouseMove(productElement, page) // move mouse to element and click
        //         sendResponse(res, `${preferredTitle} Product Found and selected...`)
        //         // await productElement.click();
        //         await productPage(page, userBotData, res)
        //     }else{
        //         sendResponse(res, `${preferredTitle} != ${productTitle} Product Not Found!!!`)
        //         // await page.close()
        //     }
        // })
        // await Promise.all(productMapping)        

     }
     //else if(preferredSKU){ // if user added Product SKU
    //     sendResponse(res, `Searching Product ${preferredSKU}...`)
        
    //     preferredSKUElement = await page.$("input[id='VisualSearchInput']") // get preferred SKU selector and assign to variable
    //     await mouseMove(preferredSKUElement, page) // move mouse to element and click
    //     await page.type("input[id='VisualSearchInput']", preferredSKU) // Write SKU on the search bar
    //     sendResponse(res, `${preferredSKU} SKU written...`)
    //     await page.waitForTimeout(2000)

    //     preferredSKUSearchElement = await page.$("button[class='pre-search-btn ripple']") // get preferred search button selector and assign to variable
    //     await mouseMove(preferredSKUSearchElement, page) // move mouse to element and click
    //     sendResponse(res, `Search Button Clicked...`)
    //     // await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()) // Click the Search button
    //     await page.waitForTimeout(2000)


    //    await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for preffered product title selector
    //     const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
    //     const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
    //         const productTitle = await getProperty(productElement, 'innerText') // Get element Text
    //         if( productTitle === preferredTitle){ // If title is equal to PreferredTitle proceed
    //             await mouseMove(productElement, page) // move mouse to element and click
    //             sendResponse(res, `${productTitle} Product Found and selected...`)
    //             // await productElement.click();
    //             await productPage(page, userBotData, res)
    //         }else{
    //             sendResponse(res, `${productTitle} Product Not Found!!!`)
    //             // await page.close()
    //         }
    //     })
    //     await Promise.all(productMapping)  

    // }else if(preferredTitle && preferredSKU ){ // if user added Both Product Title and SKU
    //     sendResponse(res, `Searching Product ${preferredTitle}/${preferredSKU}...`)

    //     preferredSKUElement = await page.$("input[id='VisualSearchInput']") // get preferred SKU selector and assign to variable
    //     await mouseMove(preferredSKUElement, page) // move mouse to element and click
    //     await page.type("input[id='VisualSearchInput']", preferredSKU) // Write SKU on the search bar
    //     sendResponse(res, `${preferredSKU} SKU written...`)
    //     await page.waitForTimeout(2000)

    //     preferredSKUSearchElement = await page.$("button[class='pre-search-btn ripple']") // get preferred search button selector and assign to variable
    //     await mouseMove(preferredSKUSearchElement, page) // move mouse to element and click
    //     sendResponse(res, `Search Button Clicked...`)
    //     // await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()) // Click the Search button
    //     await page.waitForTimeout(2000)


    //    await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for preffered product title selector
    //     const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
    //     const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
    //         const productTitle = await getProperty(productElement, 'innerText') // Get element Text
    //         if( productTitle === preferredTitle){ // If title is equal to PreferredTitle proceed
    //             await mouseMove(productElement, page) // move mouse to element and click
    //             sendResponse(res, `${productTitle} Product Found and selected...`)
    //             // await productElement.click();
    //             await productPage(page, userBotData, res)
    //         }else{
    //             sendResponse(res, `${productTitle} Product Not Found!!!`)
    //             // await page.close()
    //         }
    //     })
    //     await Promise.all(productMapping)

    // }  

}

async function productPage(page, userBotData, res){
    const preferredSize = userBotData['preferredSize']

    await page.waitForSelector("button[data-qa='size-dropdown']") // Wait for selector to appear
    const sizeCard = await page.$$("button[data-qa='size-dropdown']") // Get all a size link element

    const sizeMapping = sizeCard.map(async (sizeElement) => { // Map all the sizes and find matched size
        const productSize = await getProperty(sizeElement, 'innerText') // Get element Text
        if( productSize === preferredSize){ // If size is equal to preferredSize proceed
            sendResponse(res, `Size ${preferredSize} Selected...`)
            await mouseMove(sizeElement, page)
            await sizeElement.click() // move mouse to element and click
        }else{
            sendResponse(res, `Size ${preferredSize} not match...`)
        }
    })
    await Promise.all(sizeMapping)
    await page.waitForTimeout(2000)

    await page.waitForSelector(".ncss-btn-primary-dark") // wait for add to cart button
    const addToCartElement = await page.$(".ncss-btn-primary-dark") // get add to cart button element and assign to variable
    await mouseMove(addToCartElement, page) // move to element and click
    // await addToCartElement.click()
    sendResponse(res, `Product Successfully Added to Cart...`)
    await page.waitForTimeout(2000)

    await page.waitForSelector("button[data-qa='checkout-link']"); // Wait for checkout button
    const buttonCheckoutElement = await page.$("button[data-qa='checkout-link']") // get preferred search button selector and assign to variable
    await mouseMove(buttonCheckoutElement, page) // move mouse to element and click
    // await buttonCheckoutElement.click()
    sendResponse(res, `Already on checkout page...`)
    await page.waitForTimeout(5000)

    // await page.waitForNavigation()
    await page.waitForSelector("#qa-guest-checkout") // Wait for checkout button
    const qaguestcheckoutElement = await page.$("#qa-guest-checkout") // get preferred search button selector and assign to variable
    await mouseMove(qaguestcheckoutElement, page) // move mouse to element and click
    sendResponse(res, `Entered Guest Checkout Page...`)
    await page.waitForTimeout(2000)
    await checkout(page, userBotData, res)
}

async function checkout(page, userBotData, res){
    let preferredFirstName = userBotData['preferredFirstName']
    let preferredLastName = userBotData['preferredLastName']
    let preferredOrder_email = userBotData['preferredOrder_email']
    let preferredOrder_number = userBotData['preferredOrder_number']
    let preferredOrder_billing_address = userBotData['preferredOrder_billing_address']
    let preferredOrder_billing_city = userBotData['preferredOrder_billing_city']
    let preferredOrder_billing_state = userBotData['preferredOrder_billing_state']
    let preferredOrder_billing_zip = userBotData['preferredOrder_billing_zip']

    await page.waitForSelector("#togglehomeOffice")
    let toggleHomeOfficeElement = await page.$("#togglehomeOffice")
    await mouseMove(toggleHomeOfficeElement, page) // move mouse to element and click
    await page.waitForTimeout(1000)

    await page.waitForSelector("#firstName")
    let firstNameElement = await page.$("#firstName") 
    await mouseMove(firstNameElement, page) // move mouse to element and click
    await page.type('#firstName', preferredFirstName)
    sendResponse(res, `Successfully typed First Name...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#lastName")
    let LastNameElement = await page.$("#lastName") // get preferred search button selector and assign to variable
    await mouseMove(LastNameElement, page) // move mouse to element and click
    await page.type('#lastName', preferredLastName)
    sendResponse(res, `Successfully typed Last Name...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#addressSuggestionOptOut")
    let addressSuggestionOptOutElement = await page.$("#addressSuggestionOptOut")
    await mouseMove(addressSuggestionOptOutElement, page)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#address1")
    let address1Element = await page.$("#address1")
    await mouseMove(address1Element, page) // move mouse to element and click
    await page.type('#address1', preferredOrder_billing_address)
    sendResponse(res, `Successfully typed Address...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#city")
    let cityElement = await page.$("#city")
    await mouseMove(cityElement, page) // move mouse to element and click
    await page.type('#city', preferredOrder_billing_city)
    sendResponse(res, `Successfully typed City...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#state")
    let stateElement = await page.$("#state");
    await mouseMove(stateElement, page)
    await page.select('#state', preferredOrder_billing_state); // Select State
    sendResponse(res, `Successfully selected State...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#postalCode")
    let postalCodeElement = await page.$("#postalCode")
    await mouseMove(postalCodeElement, page) // move mouse to element and click
    await page.type('#postalCode', preferredOrder_billing_zip)
    sendResponse(res, `Successfully typed Postal Code...`)
    await page.waitForTimeout(1000)    
    
    await page.waitForSelector("#email")
    let emailElement = await page.$("#email")
    await mouseMove(emailElement, page) // move mouse to element and click
    await page.type('#email', preferredOrder_email)
    sendResponse(res, `Successfully typed Email Address...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#phoneNumber")
    let phoneNumberElement = await page.$("#phoneNumber")
    await mouseMove(phoneNumberElement, page) // move mouse to element and click
    await page.type('#phoneNumber', preferredOrder_number)
    sendResponse(res, `Successfully typed Phone Number...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector(".saveAddressBtn")
    let saveAddressBtnElement = await page.$(".saveAddressBtn")
    await mouseMove(saveAddressBtnElement, page) // move mouse to element and click
    await saveAddressBtnElement.click()
    sendResponse(res, `Successfully Saved Personal Details...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector(".continuePaymentBtn")
    let continuePaymentBtnElement = await page.$(".continuePaymentBtn")
    await mouseMove(continuePaymentBtnElement, page) // move mouse to element and click
    await continuePaymentBtnElement.click()
    sendResponse(res, `Successfully Continued to Payment Section...`)
    await page.waitForTimeout(1000)

    // await page.waitForSelector("#creditDebit")
    // let creditDebit = await page.$("#creditDebit")
    // await mouseMove(creditDebit, page) // move mouse to element and click
    // sendResponse(res, `Successfully Selected Pay Via Credit/Debit Card...`)
    // await page.waitForTimeout(1000)

    await payment(page, userBotData, res)
}

async function payment(page, userBotData, res){

    let preferredCreditCardNumber = userBotData['preferredCreditCardNumber']
    let expirationDate = userBotData['preferredCcnMonth'] + userBotData['preferredCcnYear']
    let preferredCcnCVV = userBotData['preferredCcnCVV']

    await page.waitForSelector("#creditCardNumber")
    let creditCardNumberElement = await page.$("#creditCardNumber")
    await mouseMove(creditCardNumberElement, page) // move mouse to element and click
    await page.type('#creditCardNumber', preferredCreditCardNumber)
    sendResponse(res, `Successfully typed Credit Card Number...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#expirationDate")
    let expirationDateElement = await page.$("#expirationDate")
    await mouseMove(expirationDateElement, page) // move mouse to element and click
    await page.type('#expirationDate', expirationDate)
    sendResponse(res, `Successfully typed Expiration Date...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("#cvNumber")
    let cvNumberElement = await page.$("#cvNumber")
    await mouseMove(cvNumberElement, page) // move mouse to element and click
    await page.type('#cvNumber', preferredCcnCVV)
    sendResponse(res, `Successfully typed CVV number...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("button[data-attr='continueToOrderReviewBtn']")
    let continueToOrderReviewBtnElement = await page.$("button[data-attr='continueToOrderReviewBtn']")
    await mouseMove(continueToOrderReviewBtnElement, page) // move mouse to element and click
    sendResponse(res, `Successfully continued to order review...`)
    await page.waitForTimeout(1000)

    await page.waitForSelector("//button[contains(., 'Place Order')]") // wait for add to cart button
    const PlaceOrderElement = await page.$x("//button[contains(., 'Place Order')]") // get add to cart button element and assign to variable
    await mouseMove(PlaceOrderElement, page) // move to element and click
    await page.waitForTimeout(2000)
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