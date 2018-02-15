import './styles/main.scss';
import Worlds from './views/worlds';

switch( window.location.pathname ) {
	case '/home/worlds':
		new Worlds();
		break;
}
