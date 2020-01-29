
const desktop95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
    'EXECUTABLE': 'executable',
    'SHORTCUT': 'shortcut',
};

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

    incomingFile = resolvePath( d.incoming.data( 'path' ) );
    incomingFilename = d.incoming.data( 'filename' );

    if( d.target.data( 'path' ) == d.source.data( 'path' ) ) {
        return; // Or else we'll just delete the object below!
    }

    destDir = resolvePath( d.target.data( 'path' ) );
    sourceDir = resolvePath( d.source.data( 'path' ) );

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

function resolvePath( pathString=null ) {

    if( null == pathString || '' == pathString ) {
        return fs;
    }
    if( pathString.endsWith( '/' ) || pathString.endsWith( '\\' ) ) {
        pathString = pathString.substring( 0, pathString.length - 1 );
    }
    var path = pathString.split( /\s*[\/\\]\s*/ ); // Split on / or \.
    var file = fs.children[path.shift()]; // Start at the root.
    while( 0 < path.length ) {
        var next = path.shift();
        file = file.children[next];
        file.name = next;
    }
    return file;
}

function loadExe( pathString, callerPath='', caller=null ) {

    // This will resolve once the exe is loaded.
    def = new $.Deferred();

    // This is the beginning of stuff that runs at call time (not define time),
    // so we can start resolving things from keys to dicts.
    if( null == caller ) {
        caller = resolvePath( callerPath );
        caller.path = callerPath;
    }

    // Drill down to the executable.
    var exec = resolvePath( pathString );

    var _exeRunAfterLoad = function() {
    
        // Always have an args object.
        if( !('args' in caller) ) {
            caller.args = {};
        }

        // Use default args baked into exec.
        if( 'args' in exec ) {
            $.extend( caller.args, exec.args );
        }
        
        if(
            !(desktop95Types.EXECUTABLE == caller.type || desktop95Types.SHORTCUT == caller.type) ||
            !('id' in caller.args)
        ) {
            caller.args.id = 'w-' + _htmlStrToClass( callerPath );
        }

        caller.args.target = callerPath;
        caller.args.decorations = platforms[platform_name].decorations;

        // Figure out the entrypoint. Use <script name>95 if none provided.
        if( !('entry' in exec) ) {
            exec.entry = exec.name.split( '.' )[0] + '95';
        }
        var winHandle = $('#desktop')[exec.entry]( 'open', caller.args );

        // Workaround for loading folders using generalized explorer.
        if( null != winHandle ) {
            switch( caller.type ) {
            case desktop95Types.COMPUTER:
                winHandle.attr( 'data-caller-path', '' );
                break;
            default:
                winHandle.attr( 'data-caller-path', callerPath );
                break;
            }
            winHandle.find( '.container' ).on( 'icon-drop', _handleContainerDrop );
            winHandle.find( '.container' ).trigger( 'desktop-populate' );
        }

        def.resolve();
    }

    if( 0 < $('#exe-' + _htmlStrToClass( exec.src )).length ) {
        // We're already loaded.
        _exeRunAfterLoad();
        return def.promise();
    }

    // Load the executable code and resolve the promise when ready.
    $('#desktop').css( 'cursor', 'progress' );
    $.get( exec.src, function( data ) {
        var scriptElement = $('<script id="exe-' + _htmlStrToClass( exec.src ) + '" type="text/javascript">' + data + '</script>');
        $('head').append( scriptElement );
        if( 'stylesrc' in exec ) {
            $.get( exec.stylesrc, function( data ) {
                var cssElement = $('<style id="exe-' + _htmlStrToClass( exec.stylesrc ) + '" type="text/css">' + data + '</style>');
                $('head').append( cssElement );
                $('#desktop').css( 'cursor', 'auto' );
                _exeRunAfterLoad();
            } );
        } else {
            $('#desktop').css( 'cursor', 'auto' );
            _exeRunAfterLoad();
        }
    } );

    return def.promise(); // Hang tight until we're loaded.
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
        for( filename in folder.children ) {
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
        // Open the specified executable with a fake shortcut.
        caller = {
            'type': 'shortcut',
            'exec': winPrompt.data( 'folder-path' ) + '\\' + text,
            'icon': 'prompt',
        };
        loadExe( winPrompt.data( 'folder-path' ) + '\\' + text, '', caller );
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
            localStorage.setItem( "fs", JSON.stringify( data ) );
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

function _iconPropertiesCallback( e ) {
    'use strict';
    var propsCaller = {
        'type': 'shortcut',
        'exec': 'c:\\windows\\props.js',
        'icon': 'mouse',
        'args': {
            'panel': 'file',
            'fileIcon': e.data.icon.icon,
            'fileName': e.data.icon.caption,
            'fileType': e.data.icon.description,
            'fileLocation': e.data.path,
            'caption': e.data.caption,
        }
    };
    loadExe( 'c:\\windows\\props.js', '', propsCaller );
}

function _iconDoubleClickCallback( e ) {
    'use strict';
    e.data.callback( e.data.cbData );
}

function populateFolder( container, folderPath=null ) {

    if( null === folderPath ) {
        folderPath = $(container).data( 'path' );
    }

    // Clear out containers before we start.
    $(container).children( '.desktop-icon' ).remove();
    
    var folder = resolvePath( folderPath );

    $(container).data( 'default-icon-x', 20 );
    $(container).data( 'default-icon-y', 20 );

    $(container).data( 'path', folderPath );

    // Get a list of icons in the requested folder.
    for( var itemName in folder.children ) {
        let itemData = folder.children[itemName];

        if( null == itemData ) {
            // Item was deleted.
            continue;
        }

        var iconPos = [];
        if( !('iconX' in itemData) ) {
            iconPos = getNextIconPosition( container );
        } else {
            iconPos = [itemData.iconX, itemData.iconY];
        }

        var itemPath = folderPath + '\\' + itemName;
        if( null == folderPath || 0 == folderPath.length ) {
            itemPath = itemName;
        }

        var icon = createAssocIcon( itemName, itemPath );
        icon.x = iconPos[0];
        icon.y = iconPos[1];
        var iconWrapper = $(container).desktop95( 'icon', icon );

        // Set these up so _handleContainerDrop works.
        iconWrapper.data( 'path', itemPath );
        iconWrapper.data( 'filename', itemName );

        iconWrapper.on( 'desktop-double-click', {'callback': icon.callback, 'cbData': null }, _iconDoubleClickCallback );

        // Add a level of indirection or else icon will stay in scope and change.
        iconWrapper.on( 'properties', {'path': folderPath, 'icon': icon}, _iconPropertiesCallback );
    }
}

function createAssocIcon( itemName, itemPath ) {
    'use strict';

    var itemData = resolvePath( itemPath );

    // Setup the icon image.
    var iconName = '';
    if(
        itemData.type in associations &&
        ('args' in itemData &&
            ('url' in itemData.args ||
            'contents' in itemData.args)) &&
        'docIcon' in associations[itemData.type]
    ) {
        // This is a document, so use the doc icon.
        iconName = associations[itemData.type].docIcon;

    } else if( 'icon' in itemData ) {
        // Use the icon embedded in the file.
        iconName = itemData.icon;

    } else if( 
        itemData.type in associations &&
        'icon' in associations[itemData.type] ) {
        // Use the association icon.
        iconName = associations[itemData.type].icon;

    } else {
        // Use a generic icon.
        iconName = 'generic';
    }

    var exec = '';
    if( 'exec' in associations[itemData.type] ) {
        exec = associations[itemData.type].exec;
    } else if( 'exec' in itemData ) {
        exec = itemData.exec;
    }

    var contextMenu = null;
    if( 'context' in associations[itemData.type] ) {
        contextMenu = associations[itemData.type].context;
    }

    // Create the icon settings pack.
    if( itemData.type in associations ) {
        return { 'caption': itemName,
            'icon': iconName,
            'x': itemData.iconX, 'y': itemData.iconY,
            'target': itemPath,
            'description': associations[itemData.type].name,
            'context': contextMenu,
            'callback': function() {
                loadExe( exec, itemPath );
            },
        };
    }
}

$(document).ready( function() {
    console.log( 'Loading associations...' );
    $.get( 'json/' + platform_name + '-assoc.json', function( data ) {

        associations = data;
        console.log( 'Associations loaded.' );
        
        //localStorage.setItem( 'fs', JSON.stringify( skel ) );
        if( null != localStorage.getItem( 'fs-' + platform_name ) ) {
            fs = JSON.parse( localStorage.getItem( 'fs-' + platform_name ) );
        }
        //fs = null;
        if( null == fs ) {
            $.get( 'json/' + platform_name + '-fs.json', ( data ) => {
                fs = data;
                console.log( 'Filesystem retrieved, booting...' );
                boot();
            } );
        } else {
            console.log( 'Booting...' );
            boot();
        }
    } );
} );
