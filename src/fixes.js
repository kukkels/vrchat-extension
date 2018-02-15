import interceptor from './libs/interceptor';

export default class Fixes {

	/**
	 * Fixes an annoying bug when loading friends that are on private worlds
	 */
	static friendsFix() {
		// Intercept the friends load ajax call and modify all friends locations who are in 'private' worlds to be in 'private:0'
		// Vrchat devs literally didn't code in handling for if somebody is in a private world
		interceptor( '/auth/user/friends', ( ret, xhr ) => {
			let data = JSON.parse( ret );
			for( const user of data ) {
				if ( user.location === 'private' ) {
					user.location += ':0';
				}
			}
			data = JSON.stringify( data );
			return data;
		});
	}
}
