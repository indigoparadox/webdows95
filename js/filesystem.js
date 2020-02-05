
const File95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
    'EXECUTABLE': 'executable',
    'SHORTCUT': 'shortcut',
};

function File95( options ) {
    'use strict';
    Object.assign( this, options );
    //console.log( 'New file:' );
    //console.log( options );

    if( null != this.filesystem && options.type in this.filesystem.associations ) {
        //console.log( 'Assocation:' );
        //console.log( this.filesystem.associations[options.type] );
        //Object.assign( this, this.filesystem.associations[options.type] );
        var assoc = this.filesystem.associations[options.type];
        if( null == this.icon ) {
            this.icon = assoc.icon;
        }
    }

    if( !('type' in options) ) {
        this.type = 'generic';
    }

    if( !('args' in this) ) {
        this.args = {};
    }

    // Build the path of this file to the root.
    this.path = this.name;
    var pathIter = this.parent;
    while( null != pathIter && null != pathIter.name ) {
        this.path = pathIter.name + '\\' + this.path;
        pathIter = pathIter.parent;
    }
    
    Object.defineProperty( this, 'opener', { enumerable: false, value: function() {
        if( File95Types.EXECUTABLE == this.type ) {
            return this;
        } else if( this.type in this.filesystem.associations ) {
            var assoc = this.filesystem.associations[this.type];
            opener = resolvePath( assoc.exec );
            return opener;
        } else {
            return null;
        }
    } } );
    
    Object.defineProperty( this, 'contents', { enumerable: false, value: function( callback ) {
        var deferred = new $.Deferred();
        var url = this.src;

        // Handle old "URL" contents.
        if( 'url' in this ) {
            url = this.url;
        }

        if( 'body' in this ) {
            callback( this.body );
            deferred.resolve();
            return deferred.promise();
        }
        
        $.get( url, function( data ) {
            callback( data );
            deferred.resolve();
        } );

        return deferred.promise();
    } } );

    if( File95Types.COMPUTER == this.type ) {
        this.args['item-path'] = '';
    } else {
        this.args['item-path'] = this.path;
    }
}

function Executable95( options ) {
    'use strict';
    File95.call( this, options );

    if( !('args' in options) ) {
        this.args = {};
    }
}

function Folder95( options ) {
    'use strict';

    var children = null;
    if( 'children' in options ) {
        children = options.children;
        delete options.children;
    }

    var filesystem = null;
    if( 'filesystem' in options ) {
        filesystem = options.filesystem;
        delete options.filesystem;
    }

    File95.call( this, options );

    // Add folder-specific functions.
    Object.defineProperty( this, 'addChild', { enumerable: false, value: function( filename, options ) {
        options.filesystem = this.filesystem;
        options.parent = this;
        switch( options.type ) {
        case File95Types.FOLDER:
            options.name = filename;
            options.icon = this.filesystem.associations[File95Types.FOLDER].icon;
            this.children[filename] = new Folder95( options );
            break;

        case File95Types.DRIVE:
            options.name = filename;
            options.icon = this.filesystem.associations[File95Types.DRIVE].icon;
            this.children[filename] = new Drive95( options );
            break;
        
        case File95Types.SHORTCUT:
            options.name = filename;
            this.children[filename] = new Shortcut95( options );
            break;

        case File95Types.EXECUTABLE:
            options.name = filename;
            this.children[filename] = new Executable95( options );
            break;

        default:
            options.name = filename;
            if( 'children' in options ) {
                // This is a folder not marked as such.
                this.children[filename] = new Folder95( options );
            } else {
                // This is some kind of file.
                this.children[filename] = new File95( options );
            }
        }
    } } );

    this.filesystem = filesystem;

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
    options.filesystem = this;
    options.name = null;
    Folder95.call( this, options );
}

function Shortcut95( options ) {
    'use strict';
    File95.call( this, options );

    if( !('target' in options) ) {
        this.target = '';
    }

    // Add folder-specific functions.
    Object.defineProperty( this, 'resolve', { enumerable: false, value: function() {
        return resolvePath( this.target );
    } } );
}
