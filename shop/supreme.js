const puppeteer = require('puppeteer');
const ac = require('@antiadmin/anticaptchaofficial');

const siteUrl = process.env.supremeUrl; // Store URL to siteUrl
// const siteUrl = 'https://supremenewyork.com/shop/all/';

ac.setAPIKey(process.env.anticaptchaAPIKey); // Check Anticaptcha if Connected
ac.getBalance()
    .then(balance => console.log('Supreme : my balance is: ' + balance))
    .catch(error => console.log("Supreme : an error with API key: " + error));

module.exports.checkout = checkout; // Export module to be used on other js files

async function checkout(userBotData){  // The function being called on the bot.js to trigger all functions
    const page = await initBrowser(userBotData);
}

async function initBrowser(userBotData){
    const url = siteUrl + userBotData["preferredCategoryName"];
    let preferredProxyServer = userBotData["preferredProxyServer"];
    const args = [
        '--proxy-server=socks5://'+preferredProxyServer,
    ];
    const options = {      
        headless: false,
        ignoreHTTPSErrors: true,
        args
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const pages = await browser.pages(); if (pages.length > 1) { await pages[0].close(); } // Close unused page    
    await page.setViewport({ width: 1920, height: 912, deviceScaleFactor: 1, }); // Set page viewport
    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    await removeSoldOutProduct(page, userBotData); // Remove Sold out function
    // return page;
}

// Remove sold out items function
async function removeSoldOutProduct(page, userBotData){
    let itemSoldOut = ".sold_out_tag";
    await page.evaluate((itemSoldOut) => {
        var elements = document.querySelectorAll(itemSoldOut);
        for(var i=0; i< elements.length; i++){ 
            elements[i].parentNode.parentNode.parentNode.removeChild(elements[i].parentNode.parentNode);
        }
    }, itemSoldOut);
    selectProductByName(page, userBotData); // Proceed to function
}

async function getProperty(element, propertyName){
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}

// Select Available Product By Category
async function selectProductByName(page, userBotData){
    let preferredTitle = userBotData["preferredTitle"];

    await page.waitForSelector("div.product-name > a[class='name-link']") // Wait for selector to appear
    const productElement = await page.$$("div.product-name > a[class='name-link']") // Get all a product link element
    const productMapping = productElement.map(async (element) => { // Map all the product and find matched product
        const productTitle = await getProperty(element, 'innerText') // Get element Text
        productText = productTitle.replace(/(\r\n|\n|\r)/gm,"");
        if( productText === preferredTitle){ // If title is equal to PreferredTitle proceed
            await element.click()            
        }else{
            return "Item Not Found!!!"
        }
    })
    await Promise.all(productMapping)
    await addToCart(page, userBotData)
}

// async function selectProductAttribute(page, userBotData){
//     let preferredColor = userBotData['preferredColor']
//     let preferredSize = userBotData['preferredSize']

//     // Select Color    
//     await page.waitForSelector("#details > ul > button > img")
//     const colorElement = await page.$$("#details > ul > button > img")
//     const colorMapping = colorElement.map(async (element) => { 
//         const color = await getProperty(element, 'alt')
//         if( color === preferredColor ){
//             console.log(color + "===" + preferredColor)
//         }else{
//             return "Color Not Found!!!"
//         }
//     })
//     await Promise.all(colorMapping)

//     // // Select Size
//     // await page.waitForSelector('select[aria-labelledby="select-size"] > option')
//     // const sizeElement1 = await page.$$('select[aria-labelledby="select-size"] > option') 
//     // const sizeMapping = sizeElement1.map(async (element) => { 
//     //     const size = await getProperty(element, 'innerText')
//     //     console.log(size)
//     //     if( size === preferredSize ){
//     //         console.log(size + "===" + preferredSize)
//     //         await element.click()
//     //     }else{
//     //         return "Color Not Found!!!"
//     //     }
//     // })
//     // await Promise.all(sizeMapping)

//     // // Select Quantity
//     // await page.select("select#qty", preferredQuantity) // Quantity select

//     // await addToCart(page, userBotData)
// }

// Bot on Add To Cart Page
async function addToCart(page, userBotData){

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
    }

    // If sizes Exist
    await page.waitForSelector('select[aria-labelledby="select-size"]') 
    const sizeElement = await page.evaluate(() => {
        const element = document.querySelector('select[aria-labelledby="select-size"]');        
        return element;
    });
    if(sizeElement !== null){
        const sizeElement1 = await page.$$('select[aria-labelledby="select-size"] > option') 
        const sizeMapping = sizeElement1.map(async (element) => { 
            const size = await getProperty(element, 'innerText')
            if( size === preferredSize ){
                const value = await getProperty(element, 'value')                
                await page.select('select[aria-labelledby="select-size"]', value)
                console.log(value)            
            }else{
                return "Color Not Found!!!"
            }
        })
        await Promise.all(sizeMapping)      
    }

    // If Quantity Exist
    await page.waitForSelector('select#qty') 
    const qtyElement = await page.evaluate(() => {
        const element = document.querySelector('select#qty');        
        return element;
    });
    if(qtyElement !== null){        
        await page.select("select#qty", preferredQuantity); // Quantity select
        console.log(preferredQuantity)
    }

    // If Add To Cart Button Exist
    await page.waitForSelector("input[type='submit']") 
    const addToCartElement = await page.evaluate(() => {
        const element = document.querySelector("input[type='submit']");        
        return element;
    });
    if(addToCartElement !== null){
        await page.$eval("input[value='add to cart']", elem => elem.click()); // add to cart button
        await page.waitForSelector("a[class='button checkout']", {visible: true});
        await page.$eval("a[class='button checkout']", elem => elem.click()); // checkout button
        try {
            await page.waitForSelector('input#order_billing_name');
            checkoutFormPage(page, userBotData); 
        } catch (e) {
            await page.waitForSelector('input#order_billing_name');
            checkoutFormPage(page, userBotData); 
            console.log('Element Does Not Exist');
        }
    }
}

// Bot on Delivery Page
async function checkoutFormPage(page, userBotData){
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

    await page.type("input[id='order_billing_name']", preferredBillingName); // Write Full Name
    await page.waitForTimeout(1500);

    await page.type("input[id='order_email']", preferredOrder_email); // Write Email
    await page.waitForTimeout(1500);

    await page.type("input[id='order_tel']", preferredOrder_number); // Write Phone Number
    await page.waitForTimeout(1500);

    await page.type('input[name="order[billing_address]"]', preferredOrder_billing_address); // Write Address
    await page.waitForTimeout(1500);

    await page.type("input[id='order_billing_zip']", preferredOrder_billing_zip); // Write Zip Code
    await page.waitForTimeout(1500);

    const order_billing_city = await page.evaluate(() => {
        const element = document.querySelector("input[id='order_billing_city']");        
        return element;
    });
    if(order_billing_city !== null){
        await page.type("input[id='order_billing_city']", preferredOrder_billing_city); // Write City
        await page.waitForTimeout(1500);
    }
    
    const order_billing_state = await page.evaluate(() => {
        const element = document.querySelector("select#order_billing_state");        
        return element;
    });
    if(order_billing_state !== null){
        await page.select("select#order_billing_state", preferredOrder_billing_state); // Select State
        await page.waitForTimeout(1500);
    }   

    /* Save address for future use | not usefull
        const store_address = await page.$('input[id="store_address"]');
        console.log(await (await store_address.getProperty('checked')).jsonValue());
        await store_address.click(); // Check Store Address Checkbox
    */
    // await page.select("select#credit_card_type", "Credit Card"); // Select Credit Card Type > visa, american_express, master, jcb, cod
    // await page.waitForTimeout(1500);

    await page.type("input[id='rnsnckrn']", preferredCreditCardNumber); // Write Credit Card Number
    await page.waitForTimeout(1500);

    await page.select("select#credit_card_month", preferredCcnMonth); // Select Month
    await page.waitForTimeout(1500);

    await page.select("select#credit_card_year", preferredCcnYear); // Select Year
    await page.waitForTimeout(1500);

    await page.type("input[id='orcer']", preferredCcnCVV); // Write Credit Card CVV
    await page.waitForTimeout(1500);
    
    const order_terms = await page.$('input[id="order_terms"]');
    console.log(await (await order_terms.getProperty('checked')).jsonValue());
    await order_terms.click(); // Check Order Terms

    await page.$eval("input[name='commit']", elem => elem.click()); // checkout button
    await page.waitForTimeout(1500);

    // Final step re captcha solver
    await page.waitForSelector("div[data-callback='checkoutAfterCaptcha']")
    const captchaSiteKey = await page.evaluate(() => {
        // const element = document.querySelector(".g-recaptcha"); // Changed
        const element = document.querySelector("div[data-callback='checkoutAfterCaptcha'")
        let attribute = element.getAttribute('data-sitekey')
        return attribute;
    });
    
    await page.waitForSelector("textarea[name='h-captcha-response']")

    if(captchaSiteKey){
        console.log(page.url());
        console.log(captchaSiteKey)
        let captchaResponseToken = await ac.solveRecaptchaV2Proxyless( page.url(), captchaSiteKey )
        .then(gresponse => {
            console.log('Solving ReCaptcha!')
            return gresponse;
        })
        .catch(error => 
            console.log('Error ReCaptcha Solving ' + error)
        );

        if(captchaResponseToken){
            // await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${captchaResponseToken}";`); // Changed
            await page.evaluate(`document.querySelector("textarea[name='h-captcha-response']").innerHTML="${captchaResponseToken}"`)
            console.log('ReCaptcha Solved! Finalizing Checkout!')
            page.evaluate(`document.getElementById("checkout_form").submit();`);
        }else{
            console.log("Invalid ReCaptcha");
        }  

    }
    
}
