let count = $('span.spotlight-result-count:first').text() | 0;
chrome.runtime.sendMessage({count: count});