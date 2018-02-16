// This was by far the best way i could get the main script to actually run in the right context
// Because of the interceptor class i needed to get access to the pages window element and because chrome runs extensions in their own context i have to do this
// We need to load the compiled main.js
import main_script from 'raw-loader!../dist/build/main.js';
const main = document.createElement( 'script' );
main.text = main_script;
document.addEventListener( 'DOMContentLoaded', ( e ) => {
	// In correctly constructed pages the <head> element will always be at index 1
	e.target.all[1].append( main );
});
