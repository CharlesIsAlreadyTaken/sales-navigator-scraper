if (typeof count === undefined) {
    let count = 0;
}
count = $('span.artdeco-tab-primary-text:first').text();
if (count.indexOf('K') >= 0 || count.indexOf('.') >= 0) {
    count = 1000;
}
chrome.runtime.sendMessage({count: count});