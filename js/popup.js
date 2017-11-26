let config = {
  count: 100,
  start: 0
}
let url = "";
let results = [];
let counter = 0;
let i = 0;
let tabId = 0;
let progressBar = $('div.progress-bar:first');

function parse() {
  console.log('Parsing!');
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
  let step = 100;
  let iterations = parseInt(counter/step);
  let last = counter%step;
  config.start = i * step;
  if (i === iterations) {
    step = last;
  }
  config.count = step;
  let tempUrl = url + "&start=" + config.start + "&count=" + config.count;
  
  chrome.tabs.onUpdated.addListener(function listener (tab, info) {
    if (info.status === 'complete' && tabId === tab) {
        console.log('tab updated');
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
              console.log('Response: ', res);
              i++;
              if (i <= iterations) {
                progressBar.text(parseInt(((i / iterations) * 100) - 1) + "%");
                progressBar.css("width", parseInt(((i / iterations) * 100) - 1) + "%");
                setTimeout(function() {
                  scrape();
                }, 10000);
              } else {
                i = 0;
                downloadAsCSV(results);
              }
            });
          });
      });
    }
  }); 
  chrome.tabs.update({
    url: tempUrl
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
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      console.log("Request: ", request);
      if (request.count) {
        if (request.count > 1000) {
          request.count = 1000;
        }
        $('#profiles').text(request.count);
        counter = request.count;
      } else if (request.results) {
        results = results.concat(request.results);
        console.log("Results: ", results);
      }
    });
});

function downloadAsCSV(peopleList) {
  let csvContent = "data:text/csv;charset=utf-8,";
  peopleList.forEach(function(infoArray, index){
      dataString = infoArray.join(",");
      csvContent += index < peopleList.length ? dataString+ "\n" : dataString;
  });
  let encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function cleanUrl() {
  const origin = url.substring(0, url.indexOf('?') + 1);
  const query = url.substring(url.indexOf('?') + 1);
  console.log('Origin: ', origin);
  console.log('Query: ', query);
  let vars = query.split('&');
  console.log('Vars: ', vars);
  for (let i = 0; i < vars.length; i++) {
    if(vars[i].indexOf('count') >= 0) {
      console.log('Found arg to remove: ', vars[i]);
      vars.splice(i, 1);
    }
    if(vars[i].indexOf('start') >= 0) {
      console.log('Found arg to remove: ', vars[i]);
      vars.splice(i, 1);
    }
  }
  url = origin;
  for (let i = 0; i < vars.length; i++) {
    url = url + '&' + vars[i];
  }
}