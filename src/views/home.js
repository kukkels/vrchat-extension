import docReady from '../libs/docready';

export default class Home {
	/**
	 * Initializes class and adds docready listener
	 */
	constructor() {
		docReady.then( () => this.docReady() );
	}

	/**
	 * Ran on document ready
	 */
	docReady() {
		$( 'a[title="logout"]>span' ).get( 0 ).nextSibling.nodeValue = ' Logout';
	}
}
