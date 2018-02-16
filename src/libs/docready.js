import $ from 'jquery';

/**
 * Create a promise version of the docready event here so it can be utilized more easily in different calls
 */
const docReady = new Promise( ( resolve, reject ) => {
	$( ( e ) => resolve( e ) );
});

export default docReady;
