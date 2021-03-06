import test from 'ava';
import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import {Eyes, ConsoleLogHandler, Target} from '../index';

const testName = "Eyes.Selenium.JavaScript - check-interface";
let driver = null, eyes = null;

test.before(() => {
    driver = new webdriver.Builder()
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/wd/hub')
        .build();

    eyes = new Eyes();
    eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
    eyes.setLogHandler(new ConsoleLogHandler(true));
    eyes.setStitchMode(Eyes.StitchMode.CSS);
    eyes.setForceFullPageScreenshot(true);
});

test('TestHtmlPages using new check interface', t => {
    return eyes.open(driver, testName, t.title, {width: 1000, height: 700}).then(function (driver) {
        driver.get('https://astappev.github.io/test-html-pages/');

        // Entire window
        eyes.check("Entire window", Target.window()
            .ignore(webdriver.By.id("overflowing-div"))
            .ignore({element: driver.findElement(webdriver.By.name("frame1"))})
            .ignore({left: 400, top: 100, width: 50, height: 50}, {left: 400, top: 200, width: 50, height: 100})
            .floating({left: 500, top: 100, width: 75, height: 100, maxLeftOffset: 25, maxRightOffset: 10, maxUpOffset: 30, maxDownOffset: 15})
            .floating({element: webdriver.By.id("overflowing-div-image"), maxLeftOffset: 5, maxRightOffset: 25, maxUpOffset: 10, maxDownOffset: 25})
            .floating({element: driver.findElement(webdriver.By.tagName("h1")), maxLeftOffset: 10, maxRightOffset: 10, maxUpOffset: 10, maxDownOffset: 10})
        );

        // Region by rect
        eyes.check("Region by rect", Target.region({left: 50, top: 50, width: 200, height: 200})
            .floating({left: 50, top: 50, width: 60, height: 50, maxLeftOffset: 10, maxRightOffset: 10, maxUpOffset: 10, maxDownOffset: 10})
            .floating({left: 150, top: 75, width: 60, height: 50, maxLeftOffset: 10, maxRightOffset: 10, maxUpOffset: 10, maxDownOffset: 10}));

        // Region by element
        eyes.check("Region by element", Target.region(driver.findElement(webdriver.By.id("overflowing-div"))));

        // Entire content of element
        eyes.check("Entire element", Target.region(webdriver.By.id("overflowing-div")).fully());

        // Entire region in frame
        eyes.check("Entire region in frame", Target.region(webdriver.By.id("inner-frame-div"), "frame1").fully());

        // Entire frame content
        eyes.check("Entire frame", Target.frame("frame1"));

        return eyes.close();
    }).catch(function (err) {
        t.fail(err.message);
    });
});

test.after.always(() => {
    return driver.quit().then(function () {
        return eyes.abortIfNotClosed();
    });
});
