let count = $('span.spotlight-result-count:first').text() | 0;
if (count.indexOf('K') >= 0 || count.indexOf('.') >= 0) {
    count = 1000;
}
chrome.runtime.sendMessage({count: count});