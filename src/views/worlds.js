import interceptor from '../libs/interceptor';
import docReady from '../libs/docready';
import $ from 'jquery';
import Url from 'domurl';
import _ from 'lodash';

export default class Worlds {

	/**
	 * An object of retrieved user data
	 *
	 * @type {Object}
	 */
	users = {};

	/**
	 * Initializes class and adds friends api call and docready listeners
	 */
	constructor() {
		// When a friends api call is detected display worlds and also fix possible errors in it
		interceptor( '/auth/user/friends', ( ret, xhr ) => {
			let data = JSON.stringify( this.fixUserData( JSON.parse( ret ) ) );
			docReady.then( () => this.showWorlds( JSON.parse( data ) ) );
			return data;
		});
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
	 * Show worlds for all friends that are not in private worlds
	 *
	 * @param {object} friends Friend list.
	 */
	showWorlds( friends ) {
		// Group friends by world and sortby friend amount
		const groups = _.sortBy( this.parseFriends( friends ), 'friends.length' );

		// When all data retrieval is done start the render
		Promise.all([
			...( _.map( groups, 'world' ) ),
			...( _.map( groups, 'instance' ) ),
			...( _.map( groups, 'owner' ) ),
		]).then( ( data ) => {
			// Collapse the promises into their values
			groups.forEach( ( group, i ) => {
				group.world    = data[ data.length / 3 * 0 + i ];
				group.instance = data[ data.length / 3 * 1 + i ];
				group.owner    = data[ data.length / 3 * 2 + i ];

				if ( group.instance ) {
					// Store all users that are retrieved
					this.users = _.assign( this.users, _.zipObject( _.map( group.instance.users, 'id' ), group.instance.users ) );

					// Filter friends from others
					group.instance.users = _.differenceWith( group.instance.users, group.friends, ( a, b ) => {
						return a.id === b.id;
					});
				}
			});

			// this.users = Object.assign( this.users, _.zipObject( group.friends, group.friends.map( ( user ) => user.id; ) ) );

			// Sort and render the groups
			this.renderGroups( this.sortGroups( groups ) );
		});
	}

	/**
	 * Sort groups by friend count and private worlds always at the bottom
	 *
	 * @param  {array} groups An array of groups
	 * @return {array}        Sorted groups
	 */
	sortGroups( groups ) {
		// Sort by friend count
		groups = groups.sort( ( a, b ) => {
			return a.friends.length < b.friends.length;
		});
		// Move private worlds to the bottom
		groups = groups.sort( ( a, b ) => {
			return ! a.world;
		});

		// Sort users in groups
		groups.map( ( group ) => {
			return this.sortGroupUsers( group );
		});

		return groups;
	}

	/**
	 * Sort users in group by name
	 *
	 * @param  {object} group Group data.
	 * @return {object}       Sorted group data.
	 */
	sortGroupUsers( group ) {
		// Sort friends & instance users by name
		group.friends = _.sortBy( group.friends, 'displayName' );
		if ( group.instance ) {
			group.instance.users = _.sortBy( group.instance.users, 'displayName' );
		}

		return group;
	}

	/**
	 * Render the friend groups
	 *
	 * @param {array} groups An array of friend groups.
	 */
	renderGroups( groups ) {
		// Store the friends element container
		const $cont = $( '.user, .group' ).parent().empty().addClass( 'groups' );

		for( const group of groups ) {
			const $group      = $( '<div>' ).addClass( 'group' );
			const $users      = $( '<div>' ).addClass( 'users' );
			const $friends    = $( '<div>' ).addClass( 'friends' );

			// Render friends
			for( const friend of group.friends ) {
				$friends.append( this.renderUser( friend ) );
			}

			if ( group.world && group.instance ) {
				const $world_data = $( '<div>' ).addClass( 'world_data' );

				// Render non friends
				if ( group.instance.users.length ) {
					const $other = $( '<div>' ).addClass( 'other' );

					for( const user of group.instance.users ) {
						$other.append( this.renderUser( user ) );
					}

					$users.append( $other );
				}

				// Render world info
				const $name          = $( '<p>' ).text( group.world.name );
				const $img           = $( '<img>' ).addClass( 'world_img' ).prop( 'src', group.world.thumbnailImageUrl );
				const $instance_type = $( '<p>' ).addClass( 'instance_type' ).text();

				$world_data.append( $name, $img, $instance_type );
				$group.append( $world_data );

				// Collect instance metadata
				const table_data = [
					[
						'players',
						$( '<span>' ).text( ( group.friends.length + group.instance.users.length ) + '/' + group.world.capacity ).prop( 'title', 'Actual max: (' + group.world.capacity * 2 + ')' ),
					],
					[
						'type',
						this.getInstanceType( group.location ),
					],
				];
				if ( group.owner ) {
					table_data.push([
						'owner',
						this.renderUser( group.owner ),
					]);
				}

				// Show instance metadata
				const $table = $( '<table>' );
				for( const data of table_data ) {
					const $row = $( '<tr>' );
					for( const item of data ) {
						$row.append( $( '<td>' ).html( item ) );
					}
					$table.append( $row );
				}
				$world_data.append( $table );
			}

			// Finally construct whole group and add it
			$group.append( $users );
			$users.prepend( $friends );
			$cont.append( $group );
		}
	}

	/**
	 * Get instance type from location
	 *
	 * @param  {string} location Location to parse.
	 * @return {string}          Instance type.
	 */
	getInstanceType( location ) {
		if ( location.includes( 'hidden' ) ) {
			return 'friends+';
		}
		else if ( location.includes( 'friends' ) ) {
			return 'friends';
		}
		else if ( location.includes( 'wrld' ) ) {
			return 'public';
		}
		else {
			return 'private';
		}
	}

	/**
	 * Get instance owner from location data
	 *
	 * @param  {string} location      Instance location.
	 * @return {object|Promise|false} User data.
	 */
	getInstanceOwner( location ) {
		// This only works for friends+ & friends instances
		if ( [ 'friends+', 'friends' ].includes( this.getInstanceType( location ) ) ) {
			const userId = _.get( /\((.+)\)~nonce/.exec( location ), '[1]', null );

			if ( userId ) {
				if ( userId in this.users ) {
					return this.users[ userId ];
				}
				else {
					return this.apiGet( '/api/1/users/' + userId );
				}

			}
		}

		return false;
	}

	/**
	 * Render a single user
	 *
	 * @param  {object} user User object.
	 * @return {jQuery}      A jquery element.
	 */
	renderUser( user ) {
		const $user_cont = $( '<div>' ).addClass( 'user_cont' );
		const $name      = $( '<p>' ).text( user.displayName );
		const $img       = $( '<img>' ).addClass( 'user_img' ).prop( 'src', user.currentAvatarThumbnailImageUrl );

		$user_cont.append( $name, $img );
		return $user_cont;
	}

	/**
	 * Parse friends into groups by instance
	 *
	 * @param  {array} friends An array of friends.
	 * @return {array}         An array of instance, world & friend data.
	 */
	parseFriends( friends ) {
		const groups = [];

		for( const friend of friends ) {
			const { location } = friend;

			// If a group already exists for this location then add user to it
			let found = false;
			for( const group of groups ) {
				if ( group.location === location ) {
					group.friends.push( friend );
					found = true;
					break;
				}
			}

			// Only create a new group if user wasnt added to one
			if ( ! found ) {
				const worldId = location.split( ':' )[0] || null;
				// Check for worldId validity
				if ( worldId !== 'offline' ) {
					const instanceId = location.split( ':' )[1] || null;
					const world      = worldId !== 'private' ? this.apiGet( '/api/1/worlds/' + worldId ) : null;
					const instance   = worldId !== 'private' ? this.apiGet( '/api/1/worlds/' + worldId + '/' + instanceId ) : null;
					const owner      = this.getInstanceOwner( location );
					const friends    = [
						friend,
					];

					groups.push({
						friends,
						location,
						instance,
						world,
						owner,
					});
				}
			}
		}

		return groups;
	}

	/**
	 * Send a get request to api url
	 *
	 * @param  {String} url Api url.
	 * @return {Promise}    Promise with result.
	 */
	apiGet( url ) {
		return new Promise( ( resolve, reject ) => {
			fetch( url, {
				credentials: 'same-origin',
			}).then( ( resp ) => {
				return resp.json();
			}).then( ( resp ) => {
				resolve( resp );
			});
		});
	}
}
