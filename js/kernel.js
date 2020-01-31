
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

const desktop95DesktopFolder = 'c:\\windows\\desktop';

var fs = null;
var associations = null;

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

    if( !('data' in file) ) {
        file.data = {};
    }

    if( !('working-path' in file.data) && kernel95FolderTypes.includes( file.type ) ) {
        file.data['working-path'] = pathString;
    } else if( !('working-path' in file.data) && !kernel95FolderTypes.includes( file.type ) ) {
        file.data['working-path'] = dirName( pathString );
    }

    return file;
}

function handlePromptLine( data, text, winPrompt ) {
    'use strict';

    var cMatch;
    if( null != (cMatch = text.match( /^cd (.*)/i )) ) {
        // CD command
        let folder = resolvePath( winPrompt.data( 'folder-path' ) );
        if( 
            'children' in folder && cMatch[1] in folder.children
        ) {
            winPrompt.data( 'folder-parent-path', winPrompt.data( 'folder-path' ) );
            winPrompt.data( 'folder-path',  winPrompt.data( 'folder-path' ) + '\\' + cMatch[1] );
            winPrompt.command95( 'setPrompt', {'promptText': winPrompt.data( 'folder-path' ).toUpperCase() + '>'})
        } else {
            winPrompt.command95( 'enter', {'text': 'Invalid directory'} );
        }
    } else if( null != (cMatch = text.match( /^dir ?(.*)?/i )) ) {
        // DIR command
        // TODO: Targeted DIR
        winPrompt.command95( 'enter', {'text': 'Volume in drive C is WEBDOWS95'} );
        winPrompt.command95( 'enter', {'text': 'Volume Serial Number is DEAD-BEEF'} );
        winPrompt.command95( 'enter', {'text': 'Directory of ' + winPrompt.data( 'folder-path' )} );
        winPrompt.command95( 'enter', {'text': ''} );
        var fileCt = 0;
        // XXX Resolve folder at command time.
        let folder = resolvePath( winPrompt.data( 'folder-path' ) );
        for( var filename in folder.children ) {
            var filedata = folder.children[filename];

            if( null == filedata ) {
                continue;
            }

            if( desktop95Types.FOLDER == filedata.type ) {
                winPrompt.command95( 'enter', {'text': filename.toUpperCase() + '\t' + '&lt;DIR&gt;\t01-01-95\t04:20a'} );
            } else {
                winPrompt.command95( 'enter', {'text': filename.toUpperCase()} );
            }
            fileCt += 1;
        }
        winPrompt.command95( 'enter', {'text': fileCt.toString() + ' file(s)\t0 bytes'} );
        winPrompt.command95( 'enter', {'text': '0 bytes free'} );
        winPrompt.command95( 'enter', {'text': ''} );
    } else if(
        text in resolvePath( winPrompt.data( 'folder-path' ) ).children &&
        resolvePath( winPrompt.data( 'folder-path' ) + '\\' + text ).type == desktop95Types.EXECUTABLE
    ) {
        // TODO: Handle args.
        exec( winPrompt.data( 'folder-path' ) + '\\' + text );
    } else {
        winPrompt.command95( 'enter', {'text': 'Sad command or file name'} )
    }
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

function resolveItem( itemPath ) {
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
    
    // Package the filename inside of the data.
    itemData.caption = baseName( itemPath );

    // Package the path to the file inside of the data.
    itemData.data['item-path'] = itemPath;
    itemData.data['item-type'] = origType;

    if( !('type' in itemData) || !(itemData.type in associations) ) {
        itemData.type = 'generic';
    }

    switch( itemData.type ) {
    case 'folder':
    case 'drive':
        itemData.args.data = {};
        itemData.args.data['path'] = itemPath;
        break;
    case 'computer':
        itemData.args.data = {};
        itemData.args.data['path'] = '';
        break;
    }

    if( itemData.type in associations ) {
        // Fill in missing data with associations.
        itemData = $.extend( {}, associations[itemData.type], itemData );
    }

    return itemData;
}

function resolveExec( itemPath ) {
    var itemObject = resolveItem( itemPath );
    execV( itemObject.exec, itemObject.args );
}

function exec( execPath ) {
    return execV( execPath, {} );
}

function execV( execPath, args ) {
    return execVE( execPath, args, {} )
}

function execVE( execPath, args, env ) {
    'use strict';

    var deferred = new $.Deferred();

    var execObject = resolvePath( execPath );

    // Add specified args to exec args.
    execObject.args = $.extend( {}, execObject.args, args );

    // Callback to start the executable once its code is loaded.
    var onExec = function() {
        console.log( 'Launching executable:' );
        console.log( execObject );

        var entryPoint = execObject.name.split( '.' )[0] + '95';
        var winHandle = $('#desktop')[entryPoint]( 'open', execObject.args );

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
    } catch {
        return null;
    }
}

function genericBoot() {
    'use strict';

    // Handle populating icon containers.
    $('body').on( 'desktop-populate', '.container', function( e ) {
        let listing = listFolder( $(this).attr( 'data-path' ) );
        let nextPos = getNextIconPosition( $(this), true );

        // Get rid of existing icons.
        $(this).children( '.desktop-icon' ).remove();

        for( var idx in listing ) {
            // Setup the icon position if none is set.
            if( !('x' in listing[idx] ) && !('y' in listing[idx]) ) {
                listing[idx].x = nextPos[0];
                listing[idx].y = nextPos[1];
                nextPos = getNextIconPosition( $(this), false );
            }

            // Creat the icon and append it.
            var iconElement = $(this).desktop95( 'icon', listing[idx] );
            $(this).append( iconElement );
        }
        e.stopPropagation();
    } );

    // Handle icon double-clicks/openings.
    $('body').on( 'desktop-run-icon', '.desktop-icon', function( e ) {
        var iconTarget = $(e.target).closest( '.desktop-icon' ).attr( 'data-item-path' );
        resolveExec( iconTarget );
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
