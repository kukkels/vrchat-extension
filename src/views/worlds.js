import interceptor from '../libs/interceptor';
const $ = jQuery;

export default class Worlds {
	constructor() {
		this.cachedWorlds = {};
		// When a friends api call is detected display stuff
		interceptor( '/auth/user/friends', ( ret, xhr ) => {
			let data = JSON.parse( ret );
			for( const user of data ) {
				if ( user.location === 'private' ) {
					user.location += ':0';
				}
			}
			data = JSON.stringify( data );
			this.docReady();
			return data;
		});
		$( () => this.docReady() );
	}

	docReady() {
		$( '.user a' ).each( ( i, el ) => {
			// Get world id from link
			const href = el.href.match( /(wrld.+?)\&/ );
			if ( href ) {
				const world = href[1];
				// Generate a unique color from the link
				const color = this.stringToColor( el.href );

				// Get world data with world id
				this.getWorld( world ).then( ( resp ) => {
					const $user = $( el ).parent();

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

					// This is just so you can easily see who is in the same location as someone else
					$user.css({
						boxShadow: '0 0 1.5rem .5rem ' + color,
					});
				});
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
