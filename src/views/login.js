import docReady from '../libs/docready';
import Cookie from 'js-cookie';
import $ from 'jquery';

export default class Login {
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
		this.checkLogin();
		this.cache();
		this.setupLoginForm();
	}

	/**
	 * If user is already logged in then we don't need to so the login page again to them so just redirect to /home
	 */
	checkLogin() {
		if ( Cookie.get( 'auth' ) ) {
			// If we were referred here then the auth cookie has expired
			if ( document.referrer ) {
				Cookie.remove( 'auth' );
			}
			else {
				window.location.href = '/home';
			}
		}
	}

	/**
	 * Cache relevant elements
	 */
	cache() {
		this.cached.$form = $( 'form[action="/login"]' );
		this.cached.$user = this.cached.$form.find( 'input[name="username_email"]' );
		this.cached.$pass = this.cached.$form.find( 'input[name="password"]' );
	}

	/**
	 * Make the login form act a bit better by adding focus and other parameters
	 */
	setupLoginForm() {
		// Add useful attributes to relevant fields
		this.cached.$user.prop( 'autocomplete', 'username email' ).prop( 'autofocus', true ).prop( 'required', true );
		this.cached.$pass.prop( 'autocomplete', 'current-password' ).prop( 'autofocus', true ).prop( 'required', true );

		// Focus on the relevant fields automatically
		const $field_to_focus = ! this.cached.$user.val() ? this.cached.$user : this.cached.$pass;
		$field_to_focus.focus();

		// Move the cursor to the end of the input
		const val = $field_to_focus.val();
		$field_to_focus.val( '' ).val( val );
	}
}
