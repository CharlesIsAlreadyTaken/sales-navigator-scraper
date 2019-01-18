let config = {
  count: 0,
  start: 0,
  page: 1
}
let url = "";
let results = [];
let counter = 0;
let i = 1;
let tabId = 0;
let progressBar = $('div.progress-bar:first');

function parse() {
  chrome.tabs.executeScript({
    file: 'js/jquery.js'
  }, function() {
    chrome.tabs.executeScript({
      file: 'js/parser.js'
    });
  });
}

function scrape() {
  progressBar.show();
  clearTimeout();
  let step = 26;
  let iterations = parseInt(counter/step);
  if(counter%step > 0) {
    iterations ++;
  }
  let last = counter%step;
  config.start = i * step;
  config.page = i;
  if (i === iterations) {
    step = last;
  }
  config.count = step;
  let tempUrl = url + "&page=" + config.page;
  chrome.tabs.update({
    url: tempUrl
  });
  chrome.tabs.onUpdated.addListener(function listener (tab, info) {
    if (info.status === 'complete' && tabId === tab) {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.executeScript({
          file: 'js/jquery.js'
        }, function() {
          chrome.tabs.executeScript({
            code: "config = " + JSON.stringify(config)
          }, function() {
            chrome.tabs.executeScript({
              file: 'js/scraper.js'
            }, function(res) {
              i++;
              if (i <= iterations) {
                progressBar.text(parseInt(((i / iterations) * 100) - 1) + "%");
                progressBar.css("width", parseInt(((i / iterations) * 100) - 1) + "%");
                setTimeout(function() {
                  scrape();
                }, 10000);
              } else {
                i = 0;
                $('#profiles').text("Processing");
                setTimeout(function() {
                  downloadAsCSV(results);
                }, 3000);
              }
            });
          });
      });
    }
  }); 
}

$(document).ready(function() {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    url = tabs[0].url;
    tabId = tabs[0].id;
    cleanUrl();
  });  
  chrome.tabs.executeScript({
    code: "if (!config){let config = '';} if(!start) {let start = 0;} "
  });
  document.getElementById('scrape').addEventListener('click', function() {scrape();});
  document.getElementById('parse').addEventListener('click', function() {parse();});

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.count) {
        if (request.count > 1000) {
          request.count = 1000;
        }
        $('#profiles').text(request.count);
        counter = request.count;
      } else if (request.results) {
        results = results.concat(request.results);
        console.log(results);
      }
    });
});

function downloadAsCSV(peopleList) {
  let csvContent = "data:text/csv;charset=utf-8,";
  peopleList.forEach(function(infoArray, index){
      dataString = infoArray.join(",");
      csvContent += index < peopleList.length ? dataString + "\n" : dataString;
  });
  let encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function cleanUrl() {
  const origin = url.substring(0, url.indexOf('?') + 1);
  const query = url.substring(url.indexOf('?') + 1);
  let vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    if(vars[i].indexOf('page') >= 0) {
      vars.splice(i, 1);
    }
  }
  url = origin;
  for (let i = 0; i < vars.length; i++) {
    url = url + '&' + vars[i];
  }
}