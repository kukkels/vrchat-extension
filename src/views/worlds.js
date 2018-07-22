import interceptor from '../libs/interceptor';
import docReady from '../libs/docready';
import $ from 'jquery';
import Url from 'domurl';
import _ from 'lodash';

export default class Worlds {
	/**
	 * Current promise queue
	 *
	 * @type {Object}
	 */
	queue = {};

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
		]).then( ( data ) => {
			// Collapse the promises into their values
			groups.forEach( ( group, i ) => {
				group.world    = data[ i ]; // Everything before half of the data array is world data
				group.instance = data[ data.length / 2 + i ]; // Everything after half of the data array is instance data
			});

			// Render the groups
			this.renderGroups( groups );
		});
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

				// Filter friends from others
				group.instance.users = _.differenceWith( group.instance.users, group.friends, ( a, b ) => {
					return a.id === b.id;
				});
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

				const table_data = [
					[
						'players',
						( group.friends.length + group.instance.users.length ) + '/' + group.world.capacity,
					],
					/*
					[
						'type',
						'asd', // Most likely get from location
					],
					[
						'owner',
						'asd', // Get from instance data (store every retrieved user data first)
					]
					*/
				];

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
					const friends    = [
						friend,
					];

					groups.push({
						friends,
						location,
						instance,
						world,
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
