
function File95( options ) {
    'use strict';
    Object.assign( this, options );
}

function Folder95( options ) {
    'use strict';
    var children = null;
    if( 'children' in options ) {
        children = options.children;
        delete options.children;
    }
    File95.call( this, options );

    // Add folder-specific functions.
    Object.defineProperty( this, 'addChild', {
        enumerable: false,
        value: function( filename, options ) {
        switch( options.type ) {
        case 'folder':
            this.children[filename] = new Folder95( options );
            break;
        case 'drive':
            this.children[filename] = new Drive95( options );
            break;
        default:
            if( 'children' in options ) {
                // This is a folder not marked as such.
                this.children[filename] = new Folder95( options );
            } else {
                // This is some kind of file.
                this.children[filename] = new File95( options );
            }
        }
    } } );

    // Attach children specified in options to new folder.
    this.children = {};
    if( null != children ) {
        for( var filename in children ) {
            this.addChild( filename, children[filename] );
        }
    }
}

function Drive95( options ) {
    'use strict';
    Folder95.call( this, options );
}

function Filesystem95( options ) {
    'use strict';
    Folder95.call( this, options );
}
