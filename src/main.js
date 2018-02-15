import Fixes from './fixes';
import './styles/main.scss';

switch( window.location.pathname ) {
	case '/home/worlds':
		Fixes.friendsFix();
		break;
}
