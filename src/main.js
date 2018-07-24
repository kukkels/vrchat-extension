import './styles/main.scss';
import 'dustjs-helpers';
import Worlds from './views/worlds';
import Login from './views/login';
import Home from './views/home';

// View specific scripts
switch( window.location.pathname ) {
	case '/home/worlds':
		new Worlds();
		break;
	case '/login':
		new Login();
		break;
}

// Include home class in all pages under home
if ( window.location.pathname.includes( '/home' ) ) {
	new Home();
}
