if (!count) {
    let count = 0;
}
count = $('span.spotlight-result-count:first').text();
console.log('Count is: ', count);
if (count.indexOf('K') >= 0 || count.indexOf('.') >= 0) {
    count = 1000;
}
chrome.runtime.sendMessage({count: count});