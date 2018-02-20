import docReady from '../libs/docready';
import Cookie from 'js-cookie';

export default class Home {
	/**
	 * Cached elements
	 *
	 * @type {Object}
	 */
	cached = {};

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
		this.cache();
		this.setupLogout();
	}

	/**
	 * Cache relevant elements
	 */
	cache() {
		this.cached.$nav_pills = $( '.nav-pills' );
	}

	/**
	 * Setup logout button
	 */
	setupLogout() {
		// Construct the button html
		const $li   = $( '<li>' ).addClass( 'logout_btn' );
		const $a    = $( '<a>' ).prop( 'href', '/login' ).prop( 'title', 'logout' );
		const $span = $( '<span>' ).prop( 'aria-label', 'logout' ).addClass( 'glyphicon glyphicon-remove' );

		$li.append( $a.append( $span ) );
		this.cached.$nav_pills.append( $li );

		// Remove auth cookie when user is logging out so the logout actually happens
		$a.on( 'click', () => Cookie.remove( 'auth' ) );
	}
}
