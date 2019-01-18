count = config.count;
start = config.start;
let fullResults = [];
let resultsList = [];
let nextButton = $('a.next-pagination');
let hasNextPage = false;

function scrapeSearch(callback) {
    let curatedList = [];
    let results = $('ol.search-results__result-list:first');
    let deferredResults = $('ol.search-results__result-list:first div.deferred-area:first');
    $(results).children().each(function(index, element) {
        curatedList = addElement(element, curatedList);
    });
    $(deferredResults).children().each(function(index, element) {
        curatedList = addElement(element, curatedList);
    });
    resultsList = resultsList.concat(curatedList);
}

function addElement(element, list) {
    let company = $(element).find('.result-lockup__position-company a span:first').text();
        company = company.trim();
        let name = $(element).find('.result-lockup__name a:first').text();
        name = name.trim();
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
        let link = $(element).find('.result-lockup__position-company a:first').attr('href');
        link = "https://www.linkedin.com" + link;
        let position = $(element).find('.result-lockup__highlight-keyword span:first').text();
        list.push([firstName, middleName, lastName, company, position]);
        return list;
}

function scrapeAll() {
    clearTimeout();
    scrapeSearch();
    chrome.runtime.sendMessage({results: resultsList});
}



var checkExist = function() {
    setTimeout(function(){
        if($('body').scrollTop() !== ($(document).height()-$(window).height())) {
            $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
        } else {
            clearTimeout();
        }
    }, 1000);
    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
    if ($('ol.search-results__result-list:first').find('.result-lockup__name')) {
        clearInterval(checkExist);
        setTimeout(function(){
            scrapeAll();
        }, 1000);
        
    }
}

checkExist();
