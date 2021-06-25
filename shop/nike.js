const puppeteer = require('puppeteer');
const ac = require('@antiadmin/anticaptchaofficial');

const siteUrl = process.env.nikeUrl; // Store URL to siteUrl

ac.setAPIKey(process.env.anticaptchaAPIKey); // Check Anticaptcha if Connected
ac.getBalance()
    .then(balance => console.log('Nike : my balance is: ' + balance))
    .catch(error => console.log("Nike : an error with API key: " + error));

module.exports.checkout = checkout; // Export module to be used on other js files

async function checkout(userBotData){ // The function being called on the bot.js to trigger all functions
    const page = await initBrowser(userBotData);   
}

async function initBrowser(userBotData){ // Initialize Browser

    let preferredProxyServer = userBotData["preferredProxyServer"];
    const args = [        
        '--proxy-server=socks5://' + preferredProxyServer,
        '--disable-features=OutOfBlinkCors'
    ];
    const options = {        
        headless: false,
        // devtools: true,
        // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        ignoreHTTPSErrors: false,
        args
    };

    const browser = await puppeteer.launch(options) // Launch options
    const context = await browser.createIncognitoBrowserContext() // Launch Incognito
    const page = await context.newPage() // Create New Incognito Page

    const pages = await browser.pages(); // Check Pages
    if (pages.length > 1) { await pages[0].close(); } // Close unused page    
    await page.setViewport({ width: 1920, height: 912, deviceScaleFactor: 1, }); // Set page viewport

    page.setDefaultNavigationTimeout(0); // Set page timeout to NULL
    page.setDefaultTimeout(0); // Set page timeout to NULL

    await page.goto(siteUrl, {waitUntil: 'load', timeout: 0}); // Go to URL

    await searchProduct(page, userBotData); // Call searchProduct function to start working 
    await browser.close(); // Close Browser
}

async function getProperty(element, propertyName){ // Get Element property function
    const property = await element.getProperty(propertyName)
    return await property.jsonValue()
}

async function searchProduct(page, userBotData){
    var preferredCategoryName = userBotData['preferredCategoryName']
    var preferredSKU = userBotData['preferredSKU']
    var preferredTitle = userBotData['preferredTitle']
    var preferredGender = userBotData['preferredGender']

    if(preferredTitle){ // if user only added Product Title
        console.log(preferredTitle)
        await page.$eval("a[aria-label='"+preferredCategoryName+"']", elem => elem.click());// Click preferred category
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
            }else{
                return "Item Not Found!!!"
            }
        })
        await Promise.all(productMapping)

    }else if(preferredSKU){ // if user only added Product SKU
        console.log(preferredSKU)
        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            await productElement.click();
        })
        await Promise.all(productMapping)

    }else if(preferredTitle && preferredSKU ){ // if user only added Both Product Title and SKU
        console.log(preferredTitle + " " + preferredSKU)
        await page.type("input[id='VisualSearchInput']", preferredSKU); // Write SKU on the search bar
        await page.waitForTimeout(2000)

        await page.$eval("button[class='pre-search-btn ripple']", elem => elem.click()); // Click the Search button
        await page.waitForTimeout(2000)

        await page.waitForSelector("a[class='product-card__link-overlay']") // Wait for selector to appear
        const productCard = await page.$$("a[class='product-card__link-overlay']") // Get all a product link element
        const productMapping = productCard.map(async (productElement) => { // Map all the product and find matched product
            const productTitle = await getProperty(productElement, 'innerText') // Get element Text
            await productElement.click();
        })
        await Promise.all(productMapping)

    }

    await productPage(page, userBotData)

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