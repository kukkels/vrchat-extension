import interceptor from '../libs/interceptor';
import docReady from '../libs/docready';
import $ from 'jquery';
import Url from 'domurl';

export default class Worlds {
	/**
	 * Cached world data
	 *
	 * @type {Object}
	 */
	cachedWorlds = {};

	/**
	 * Initializes class and adds friends api call and docready listeners
	 */
	constructor() {
		// When a friends api call is detected display worlds and also fix possible errors in it
		interceptor( '/auth/user/friends', ( ret, xhr ) => {
			let data = JSON.stringify( this.fixUserData( JSON.parse( ret ) ) );
			docReady.then( () => this.displayWorlds() );
			return data;
		});

		docReady.then( () => this.docReady() );
	}

	/**
	 * Fix friends api call private location as the vrchat website cant handle it
	 *
	 * @param  {Array} data User friends as an array.
	 * @return {Array}      Possibly modified user friends as an array.
	 */
	fixUserData( data ) {
		for( const user of data ) {
			if ( user.location === 'private' ) {
				user.location += ':0';
			}
		}

		return data;
	}

	/**
	 * Ran on document ready
	 */
	docReady() {
		this.displayWorlds();
	}

	/**
	 * Function to run on first load or when refreshing friends
	 */
	displayWorlds() {
		const $links = $( '.user a' );
		this.showWorlds( $links );
		this.showColors( $links );
	}

	/**
	 * Show worlds for all friends that are not in private worlds
	 *
	 * @param  {jQuery} $links A jquery object of links
	 */
	showWorlds( $links ) {
		$links.each( ( i, el ) => {
			const $user = $( el ).parent();
			// Get data from link
			const url = new Url( el.href );
			if ( url.query.worldId !== 'private' ) {
				// Get world data with world id
				this.getWorld( url.query.worldId ).then( ( resp ) => {
					// Construct container like this so we don't generate more if one already exists
					let $cont = $user.children( '.user_world' ).empty();
					if ( ! $cont.length ) {
						$cont = $( '<div>' ).addClass( 'user_world' );
					}

					// Finally display world data below user
					const $title = $( '<h4>' ).text( resp.name );
					const $img = $( '<img>' ).prop( 'src', resp.thumbnailImageUrl );
					$cont.append( $title, $img );
					$user.append( $cont );
				});
			} else {
				// Remove the world div if user is in a private world
				$user.children( '.user_world' ).remove();
			}
		});
	}

	/**
	 * Show a color on each player that is in the same world
	 *
	 * @param  {jQuery} $links A jquery object of links
	 */
	showColors( $links ) {
		const locations = [];
		// First pass that collects all instanceId's so we can check if more than one user is in a particular instance
		$links.each( ( i, el ) => {
			const url = new Url( el.href );
			const { worldId, instanceId } = url.query;

			if ( worldId !== 'private' ) {
				if ( ! locations[ instanceId ] ) {
					locations[ instanceId ] = [];
				}

				locations[ instanceId ].push( $( el ).parent() );
			}
		});

		// Second pass to apply box shadow to those that are in the same world and remove box shadow from all others
		$links.each( ( i, el ) => {
			const $user = $( el ).parent();
			const url = new Url( el.href );
			const { worldId, instanceId } = url.query;

			// If user is in a private world or the location has only this user then remove box shadow
			if ( worldId !== 'private' && locations[ instanceId ].length > 1 ) {
				// Generate a semi random color from the instanceId
				const color = this.stringToColor( instanceId );
				for( const $user of locations[ instanceId ] ) {
					$user.css({
						'box-shadow': '0 0 1.5rem .5rem ' + color,
					});
				}
			} else {
				$user.css( { 'box-shadow': '' } );
			}
		});
	}

	/**
	 * Get world data with world id
	 *
	 * @param  {String} world World id.
	 * @return {Promise}      Promise with world data as an object.
	 */
	getWorld( world ) {
		// Don't retrieve a world that is already being retrieved
		if ( world in this.cachedWorlds ) {
			return this.cachedWorlds[ world ];
		}

		// Store the retrieval request
		this.cachedWorlds[ world ] = new Promise( ( resolve, reject ) => {
			fetch( '/api/1/worlds/' + world, {
				credentials: 'same-origin',
			}).then( ( resp ) => {
				return resp.json();
			}).then( ( resp ) => {
				resolve( resp );
			});
		});

		// Return the promise
		return this.cachedWorlds[world];
	}

	/**
	 * Turn arbitary string into a hex color
	 * https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript#answer-16348977
	 *
	 * @param  {String} str String to calculate color from.
	 * @return {String}     Hex color.
	 */
	stringToColor( str ) {
		let hash = 0;
		for ( const chr of str ) {
			hash = chr.charCodeAt() + ( ( hash << 5 ) - hash );
		}
		let color = '#';
		for ( let i = 0; i < 3; i++ ) {
			const val = ( hash >> ( i * 8 ) ) & 0xFF;
			color += ( '00' + val.toString( 16 ) ).substr( -2 );
		}
		return color;
	}
}
