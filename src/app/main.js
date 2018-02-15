import Fixes from './fixes';

switch( window.location.pathname ) {
	case '/home/worlds':
		Fixes.friendsFix();
		break;
}
