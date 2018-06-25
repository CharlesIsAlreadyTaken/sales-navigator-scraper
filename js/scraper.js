count = config.count;
start = config.start;
let resultsList = [];
let nextButton = $('a.next-pagination');
let hasNextPage = false;

function scrapeSearch(callback) {
    let curatedList = [];
    let results = $('ul#results-list');
    $(results).children().each(function(index, element) {
        let company = $(element).find('.company-name').text();
        let name = $(element).find('.name-link').text();
        let curatedName = name.split(" ");
        let firstName = curatedName[0];
        let middleName = "";
        let lastName = "";
        if (curatedName.length < 3) {
            lastName = curatedName[1];
        } else {
            middleName = curatedName[1];
            lastName = curatedName[2];
        }
        let link = $(element).find('.name-link').attr('href');
        link = "https://www.linkedin.com" + link;
        let position = $(element).find('.info-value').first().text();
        curatedList.push([firstName, middleName, lastName, company, position]);
    });
    resultsList = resultsList.concat(curatedList);
    hasNextPage = false;
};

function scrapeAll() {
    clearTimeout();
    scrapeSearch();
    chrome.runtime.sendMessage({results: resultsList});
}

var checkExist = setInterval(function() {
    if ($('ul#results-list').find('.name-link:first').attr('href')) {
        clearInterval(checkExist);
        setTimeout(function(){
            scrapeAll();
        }, 1000);
        
    }
 }, 100);
