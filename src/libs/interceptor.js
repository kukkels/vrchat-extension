const interceptors = [];

export default function interceptor( request, cb ) {
	interceptors.push( { request, cb } );

	const origOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function() {
		if ( ! this._hooked ) {
			this._hooked = true;
			setupHook( this );
		}
		origOpen.apply( this, arguments );
	}

	function setupHook( xhr ) {
		function getter() {
			delete xhr.responseText;
			let ret = xhr.responseText;

			if ( ! ( 'done' in xhr ) ) {
				for( const inst of interceptors ) {
					if ( xhr.responseURL.includes( inst.request ) ) {
						ret = inst.cb( ret, xhr );
					}
				}
				xhr.done = ret;
			} else {
				ret = xhr.done;
			}

			setup();
			return ret;
		}

		function setup() {
			Object.defineProperty(xhr, 'responseText', {
				get: getter,
				configurable: true
			});
		}
		setup();
	}

	return interceptors;
}
