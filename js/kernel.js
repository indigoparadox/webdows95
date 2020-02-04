
const desktop95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
    'EXECUTABLE': 'executable',
    'SHORTCUT': 'shortcut',
};

const kernel95FolderTypes = [
    'folder', 'computer', 'drive'
];

const platforms = {
    'system7': {
        'decorations': [
            window95Decorations.CLOSE,
            window95Decorations.TITLE,
            window95Decorations.RESTORE,
        ],
    },
    'win95': {
        'decorations': [
            window95Decorations.ICON,
            window95Decorations.TITLE,
            window95Decorations.MIN,
            window95Decorations.MAX,
            window95Decorations.RESTORE,
            window95Decorations.CLOSE
        ],
    }
};

const desktop95FileException = {
    'FILEEXISTS': 'fileexists',
};

var fs = null;
var associations = null;

(function( $ ) {
    $.fn.env95 = function( action, key, value ) {
    'use strict';
    
    switch( action.toLowerCase() ) {

    case 'set':
        this.attr( 'data-' + key, value );
        return this;
        
    case 'get':
        if( null != key ) {
            return this.attr( 'data-' + key );
        } else if( 0 < this.length ) {
            var out = {};
            $.each( this[0].attributes, function() {
                if( this.name.startsWith( 'data-' ) ) {
                    // Start from after the data- portion.
                    out[this.name.substr( 5 )] = this.value;
                }
            } );
            return out;
        }

    case 'get-int':
        if( null != key ) {
            return parseInt( this.attr( 'data-' + key ) );
        } else {
            return {}; // XXX
        }
    
    }; }; }( jQuery ) );

function _handleContainerDrop( e, d ) {
    'use strict';

    var incomingFile = resolvePath( d.incoming.data( 'path' ) );
    var incomingFilename = d.incoming.data( 'filename' );
``
    if( d.target.data( 'path' ) == d.source.data( 'path' ) ) {
        return; // Or else we'll just delete the object below!
    }

    var destDir = resolvePath( d.target.data( 'path' ) );
    var sourceDir = resolvePath( d.source.data( 'path' ) );

    // Move the file to the destination folder.
    destDir.children[incomingFilename] = incomingFile;
    sourceDir.children[incomingFilename] = null;

    localStorage.setItem( 'fs-' + platform_name, JSON.stringify( fs ) );

    // Refresh the folder views.
    populateFolder( d.source );
    populateFolder( d.target );
}

function newFolder( parent, name ) {
    'use strict';

    if( name in parent.children ) {
        throw { 'type': desktop95FileException.FILEEXISTS };
    }

    parent.children[name] = {
        'type': desktop95Types.FOLDER,
        'children': {},
    }

    return parent.children[name];
}

function resolvePath( pathString ) {
    'use strict';
    if( null == pathString || '' == pathString ) {
        return fs;
    }
    if( pathString.endsWith( '/' ) || pathString.endsWith( '\\' ) ) {
        pathString = pathString.substring( 0, pathString.length - 1 );
    }
    if( pathString.startsWith( '/' ) || pathString.startsWith( '\\' ) ) {
        pathString = pathString.substring( 1, pathString.length );
    }
    var path = pathString.split( /\s*[\/\\]\s*/ ); // Split on / or \.
    var file = fs.children[path.shift()]; // Start at the root.
    while( 0 < path.length ) {
        var next = path.shift();
        if( '' != next ) {
            file = file.children[next];
            file.name = next;
        }
    }

    if( !('env' in file) ) {
        file.env = {};
    }

    if( !('working-path' in file.env) && kernel95FolderTypes.includes( file.type ) ) {
        file.env['working-path'] = pathString;
    } else if( !('working-path' in file.env) && !kernel95FolderTypes.includes( file.type ) ) {
        file.env['working-path'] = dirName( pathString );
    }

    return file;
}

function formatFS() {
    'use strict';

    var formatDialog = null;
    var formatDialogOptions = {
        "caption": "Format Session",
        "icon": "warning",
        "message": "This will erase all persistant data from your session. Continue?",
        "buttons": {
            "Yes": "yes",
            "No": "no",
        }
    };
    formatDialog = $("#desktop").window95( "dialog", formatDialogOptions );
    formatDialog.on( "button-no", function() {
        formatDialog.window95( "close" );
    } );
    formatDialog.on( "button-yes", function() {
        $.get( 'json/' + platform_name + '-fs.json', function( data ) {
            localStorage.setItem( "fs-" + platform_name, JSON.stringify( data ) );
            document.location.reload( true );
        } );
    } );
}

function getNextIconPosition( container, reset=false ) {

    if( reset || undefined == $(container).data( 'default-icon-x' ) ) {
        $(container).data( 'default-icon-x', 20 );
    }
    if( reset || undefined == $(container).data( 'default-icon-y' ) ) {
        $(container).data( 'default-icon-y', 20 );
    }

    // Setup the icon's position on the folder window/desktop.
    if( 
        $(container).data( 'default-icon-y' ) >= $(container).height() - 70 &&
        $(container).data( 'default-icon-x' ) < $(container).width() - 70
    ) {
        $(container).data( 'default-icon-x',
            $(container).data( 'default-icon-x' ) + 70 );
        $(container).data( 'default-icon-y', 20 );
    }

    var iconX = $(container).data( 'default-icon-x' );
    var iconY = $(container).data( 'default-icon-y' );
    $(container).data( 'default-icon-y',
        $(container).data( 'default-icon-y' ) + 70 );
    return [iconX, iconY];
}

function baseName( path ) {
    return path.split( /[\/\\]/g ).pop();
}

function dirName( path ) {
    path = path.split( /[\/\\]/g );
    path.pop();
    path = path.join( '\\' );
    return path;
}

function resolveContentsP( filePath, callback ) {
    'use strict';

    var fileObject = resolvePath( filePath );

    return resolveContentsO( fileObject, callback );
}

function resolveContentsO( fileObject, callback ) {
    'use strict';

    var deferred = new $.Deferred();

    // Handle old "URL" contents.
    if( 'url' in fileObject ) {
        fileObject.src = fileObject.url;
    }

    if( 'contents' in fileObject ) {
        callback( fileObject.contents );
        deferred.resolve();
        return deferred.promise();
    }
    
    $.get( fileObject.src, function( data ) {
        callback( data );
        deferred.resolve();
    } );

    return deferred.promise();
}

function resolveItem( itemPath, iconElement ) {
    'use strict';

    var itemData = resolvePath( itemPath );
    var origType = itemData.type;

    if( 'shortcut' == origType ) {
        var targetData = resolvePath( itemData.target );
        itemData = $.extend( {}, itemData, targetData );
        itemData.exec = itemData.target;
    }

    if( !('args' in itemData) ) {
        itemData.args = {};
    }

    console.assert( null != iconElement );
    console.trace();
    
    if( null != iconElement && 0 < iconElement.parent( '.container' ).length ) {
        var iconEnv = iconElement.parent( '.container' ).env95( 'get' );
        itemData.env = $.extend( itemData.env, iconEnv );
    }

    // Package the filename inside of the data.
    itemData.caption = baseName( itemPath );

    if( !('data' in itemData) ) {
        itemData.data = {};
    }

    // Package the path to the file inside of the data for resolving the icon
    // later.
    itemData.data['item-path'] = itemPath;
    itemData.data['item-type'] = origType;

    if( !('type' in itemData) || !(itemData.type in associations) ) {
        itemData.type = 'generic';
    }

    // Package the working path for running the process the icon points to.
    switch( itemData.type ) {
    case 'folder':
    case 'drive':
        itemData.env = {};
        itemData.env['working-path'] = itemPath;
        break;
    case 'computer':
        itemData.env = {};
        itemData.env['working-path'] = '';
        break;
    }

    if( itemData.type in associations ) {
        // Fill in missing data with associations.
        itemData = $.extend( {}, associations[itemData.type], itemData );
    }

    return itemData;
}

function exec( execPath ) {
    return execV( execPath, {} );
}

function execV( execPath, args ) {
    return execVE( execPath, args, {} )
}

function execVE( execPath, args, env ) {
    'use strict';

    console.log( 'Exec env:' );
    console.log( env );
    console.trace();

    var deferred = new $.Deferred();

    var execObject = resolvePath( execPath );

    // Add specified args to exec args.
    execObject.args = $.extend( {}, execObject.args, args );
    execObject.env = $.extend( {}, execObject.env, env );

    // Callback to start the executable once its code is loaded.
    var onExec = function() {
        console.log( 'Launching executable:' );
        console.log( execObject );

        var entryPoint = execObject.name.split( '.' )[0] + '95';
        var winHandle = $('#desktop')[entryPoint]( 'open', execObject.args, execObject.env );

        // Env is both passed to the entrypoint and set on the window handle
        // (if one is returned) as a convenience to the called program.
        if( null != winHandle ) {
            for( var key in execObject.env ) {
                winHandle.attr( 'data-' + key, execObject.env[key] );
            }
        }

        // Exectuable is loaded and started; resolve the promise.
        deferred.resolve();
    };

    if( 0 < $('#exe-' + _htmlStrToClass( execObject.src )).length ) {
        // We're already loaded.
        onExec();
        return deferred.promise();
    }

    // Load the executable code.
    $('#desktop').css( 'cursor', 'progress' );
    resolveContentsO( execObject, function( data ) {
        var scriptElement = $('<script id="exe-' + _htmlStrToClass( execObject.src ) + '" type="text/javascript">' + data + '</script>');
        $('head').append( scriptElement );
    } ).then( function() {
        if( !('styleSrc' in execObject) ) {
            // No styleSrc, so skip loading.
            let styleDeferred = new $.Deferred();
            styleDeferred.resolve();
            return styleDeferred;
        }

        // Create a fake file object, resolve its contents, and insert it as a stylesheet.
        var styleObject = {'src': execObject.styleSrc};
        return resolveContentsO( styleObject, function( data ) {
            var cssElement = $('<style id="exe-' + _htmlStrToClass( execObject.styleSrc ) + '" type="text/css">' + data + '</style>');
            $('head').append( cssElement );
        } );
    } ).done( function() {
        $('#desktop').css( 'cursor', 'auto' );
        onExec();
    } );

    return deferred;
}

function listFolder( path ) {
    try {
        var items = resolvePath( path ).children;
        var itemsList = [];
        for( var itemName in items ) {
            // We really only need enough info to make the icon. We'll get
            // all the runtime stuff again on execute.
            var itemData = resolveItem( path + '\\' + itemName );

            // No association available.
            itemsList.push( itemData );
        }
        return itemsList;
    } catch( e ) {
        console.warn( 'While listing path: ' + path );
        console.warn( e );
        return null;
    }
}

function genericBoot() {
    'use strict';

    // Handle populating icon containers.
    $('body').on( 'desktop-populate', '.container', function( e, options ) {
        let listing = listFolder( $(this).attr( 'data-working-path' ) );
        let nextPos = getNextIconPosition( $(this), true );
        var settings = $.extend( {
            'iconSize': 32,
            'iconTextPosition': 'bottom',
            'targetWindow': 'new'
        }, options );

        // Get rid of existing icons.
        $(this).children( '.desktop-icon' ).remove();

        $(this).env95( 'set', 'icon-target-window', settings.targetWindow );

        for( var idx in listing ) {
            // Pass the settings as part of the icon constructor object to make
            // sure it's the right size/layout on populate.
            var itemIter = $.extend( {}, listing[idx], settings );

            // Setup the icon position if none is set.
            if( !('x' in itemIter ) && !('y' in itemIter) ) {
                itemIter.x = nextPos[0];
                itemIter.y = nextPos[1];
                nextPos = getNextIconPosition( $(this), false );
            }

            // Create the icon and append it.
            var iconElement = $(this).desktop95( 'icon', itemIter );
            $(this).append( iconElement );
        }
        e.stopPropagation();
    } );

    // Handle icon double-clicks/openings.
    $('body').on( 'desktop-run-icon', '.desktop-icon', function( e ) {
        var icon = $(e.target).closest( '.desktop-icon' );
        var iconTargetPath = icon.attr( 'data-item-path' );
        console.assert( 1 == icon.length );
        var itemObject = resolveItem( iconTargetPath );
        execVE( itemObject.exec, itemObject.args, itemObject.env );
    } );

}

$(document).ready( function() {
    console.log( 'Loading associations...' );
    $.get( 'json/' + platform_name + '-assoc.json', function( data ) {

        associations = data;
        console.log( 'Associations loaded.' );
        
        //localStorage.setItem( 'fs', JSON.stringify( skel ) );
        //localStorage.setItem( 'fs-' + platform_name, null );
        if( null != localStorage.getItem( 'fs-' + platform_name ) ) {
            fs = JSON.parse( localStorage.getItem( 'fs-' + platform_name ) );
        }
        //fs = null;
        if( null == fs ) {
            $.get( 'json/' + platform_name + '-fs.json', ( data ) => {
                fs = data;
                console.log( 'Filesystem retrieved, booting...' );
                genericBoot();
                boot();
            } );
        } else {
            console.log( 'Booting...' );
            genericBoot();
            boot();
        }
    } );
} );
