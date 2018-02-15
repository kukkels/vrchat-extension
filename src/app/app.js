// This was by far the best way i could get the main script to actually run in the right context
// Because of the interceptor class i needed to get access to the pages window element and because chrome runs extensions in their own context i have to do this
// Other potentially faster approaches include for example loading the whole main.js script into a variable via webpack and just appending that as its own script tag
const main_script_url = chrome.runtime.getURL( 'js/main.js' );
const main = document.createElement( 'script' );
main.src = main_script_url;
document.addEventListener( 'DOMContentLoaded', ( e ) => {
	// In correctly constructed pages the <head> element will always be at index 1
    e.target.all[1].append( main );
});
