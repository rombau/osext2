// TODO injecting the color (theme)
// allows switching to different css
// disabled due to flickering
if (false) {

	let link = document.createElement('link');

	link.href = chrome.extension.getURL('style/colors.css');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	
	document.documentElement.appendChild(link);

}
