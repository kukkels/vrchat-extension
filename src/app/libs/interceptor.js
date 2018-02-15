export default function interceptor( request, cb ) {
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
            if ( xhr.responseURL.includes( request ) ) {
                if ( ! ( 'ret' in xhr ) ) {
                    xhr.ret = cb( ret, xhr );
                }
                ret = xhr.ret;
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
}
