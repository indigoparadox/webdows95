
const desktop95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
    'EXECUTABLE': 'executable',
    'SHORTCUT': 'shortcut',
};

const desktop95FileException = {
    'FILEEXISTS': 'fileexists',
};

const desktop95DesktopFolder = 'c:\\windows\\desktop';

var fs = null;

var skel = {
'type': desktop95Types.COMPUTER,
'children':{
    'c:': {
        'type': desktop95Types.DRIVE,
        'overlay': null,
        'children': {
            'windows': {
                'type': desktop95Types.FOLDER,
                'children': {
                    'explorer.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/explorer.js',
                        'entry': 'explorer95',
                        'onOpen': function( winFolder, shortcut ) {            
                            if( desktop95Types.COMPUTER == shortcut.type ) {
                                populateFolder( winFolder.find( '.container' ), '' );
                            } else {
                                populateFolder( winFolder.find( '.container' ), shortcut.path );
                            }
                        }
                    },
                    'mousetray.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/mousetray.js',
                        'entry': 'mousetray95',
                        'onOpen': function( winFolder, shortcut ) {
                        }
                    },
                    'browser.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/browser.js',
                        'entry': 'browser95',
                        'args': {
                            'archiveEnd':'19991200000000',
                            'archiveStart':'19990100000000',
                            'url': 'http://google.com',
                            'id': null, // Always allow new windows.
                        },
                    },
                    'cdplayer.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/cdplayer.js',
                        'args': {
                            'playlist': [
                                {
                                    'url': 'finalizing.mp3',
                                    'artist': '</body>',
                                    'album': 'Initializing...',
                                    'title': 'Finalizing...'
                                }
                            ],
                            'id': 'w-cdplayer',
                        },
                    },
                    'command.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/command.js',
                        'onOpen': function( winCommand, shortcut ) {
                            winCommand.data( 'folder', fs.children['c:'] );
                            winCommand.data( 'folder-path', 'c:' );
                            winCommand.data( 'folder-parent', fs.children['c:'] );
                            winCommand.data( 'folder-parent-path', 'c:' );
                        },
                        'args': {
                            'id': null, // Always allow new windows.
                            'lineHandler': handlePromptLine,
                        }
                    },
                    'notepad.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/notepad.js',
                        'args': {
                            'id': null, // Always allow new windows.
                        }
                    },
                    'wordpad.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/wordpad.js',
                        'args': {
                            'id': null, // Always allow new windows.
                            'w': 600,
                            'h': 400,
                        }
                    },
                    'mpvideo.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/mpvideo.js',
                        'args': {
                            'id': 'w-mpvideo',
                        }
                    },
                    'start menu': {
                        'type': desktop95Types.FOLDER,
                        'children': {
                            'programs': {
                                'type': desktop95Types.FOLDER,
                                'children': {
                                    'Accessories': {
                                        'type': desktop95Types.FOLDER,
                                        'children': {
                                            'Internet Tools': {
                                                'type': desktop95Types.FOLDER,
                                                'children': {
                                                    'Browser': {
                                                        'type': 'shortcut',
                                                        'exec': 'c:\\windows\\browser.js',
                                                        'icon': 'browser',
                                                    },
                                                }
                                            },
                                            'Multimedia': {
                                                'type': desktop95Types.FOLDER,
                                                'children': {
                                                    'CD Player': {
                                                        'type': 'shortcut',
                                                        'exec': 'c:\\windows\\cdplayer.js',
                                                        'icon': 'cdplayer',
                                                    },
                                                }
                                            },
                                            'Notepad':{
                                                'type': 'shortcut',
                                                'exec': 'c:\\windows\\notepad.js',
                                                'icon': 'notepad',
                                            },
                                            'WordPad':{
                                                'type': 'shortcut',
                                                'exec': 'c:\\windows\\wordpad.js',
                                                'icon': 'wordpad',
                                            },
                                        }
                                    },
                                    'Prompt': {
                                        'type': 'shortcut',
                                        'exec': 'c:\\windows\\command.js',
                                        'icon': 'prompt',
                                    },
                                },
                            }
                        },
                    },
                    'desktop': {
                        'type': desktop95Types.FOLDER,
                        'children': {
                            'My Computer':{
                                'type':'computer',
                            },
                            'A Folder':{
                                'children':{
                                    'A Text File':{
                                        'args': {
                                            'contents':'This is a text file.',
                                        },
                                        'type':'notepad'}
                                    },
                                'type':desktop95Types.FOLDER},
                            'Browser':{
                                'exec': 'c:\\windows\\browser.js',
                                'icon': 'browser',
                                'type': 'shortcut'
                            },
                            'Prompt':{
                                'type': 'shortcut',
                                'exec': 'c:\\windows\\command.js',
                                'icon': 'prompt',
                            },
                            'CD Player':{
                                'type': 'shortcut',
                                'exec': 'c:\\windows\\cdplayer.js',
                                'icon': 'cdplayer',
                            },
                            'VGuide.avi':{
                                'args': {
                                    'ytube': 'fXpfdq3WYu4',
                                    'w': 300, 'h': 275
                                },
                                'type':'video'
                            },
                            'ReadMe.rtf':{
                                'args': {
                                    'url':'README.md',
                                },
                                'type':'wordpad'
                            },
                        },
                    }
                
                }
            }
        }
    }
} };

function newFolder( parent, name ) {
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

        if( !('entry' in exec) ) {
            exec.entry = exec.name.split( '.' )[0] + '95';
        }
        var winHandle = $('#desktop')[exec.entry]( 'open', caller.args );
        if( 'onOpen' in exec ) {
            exec.onOpen( winHandle, caller );
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
        $('#desktop').css( 'cursor', 'auto' );
        _exeRunAfterLoad();
    } );

    return def.promise(); // Hang tight until we're loaded.
}

function handlePromptLine( data, text, winPrompt ) {
    var cMatch;
    if( null != (cMatch = text.match( /^cd (.*)/i )) ) {
        // CD command
        if( 
            'children' in winPrompt.data( 'folder' ) &&
            cMatch[1] in winPrompt.data( 'folder' ).children
        ) {
            winPrompt.data( 'folder-parent', winPrompt.data( 'folder' ) );
            winPrompt.data( 'folder-parent-path', winPrompt.data( 'folder-path' ) );
            winPrompt.data( 'folder', winPrompt.data( 'folder' ).children[cMatch[1]] );
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
        for( filename in winPrompt.data( 'folder' ).children ) {
            var filedata = winPrompt.data( 'folder' ).children[filename];
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
        text in winPrompt.data( 'folder' ).children &&
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

var associations = {
    'executable': {
        'name': 'Executable',
        'icon': 'exe',
    },
    'shortcut': {
        'name': 'Shortcut',
        'icon': 'lnk',
    },
    'computer': {
        'name': 'Computer',
        'icon': 'computer',
        'exec': 'c:/windows/explorer.js',
    },
    'drive': {
        'name': 'Drive',
        'icon': 'drive',
        'exec': 'c:/windows/explorer.js',
        'context': {
            'items': [
                {'caption': 'Format', 'callback': function( m ) {
                    var formatDialog = {
                        'caption': 'Format Session',
                        'icon': 'warning',
                        'message': 'This will erase all persistant data from your session. Continue?',
                        'buttons': {
                            'Yes': function() {

                            },
                            'No': function() {

                            }
                        }
                    };
                    $('#desktop').window95( 'dialog', formatDialog );
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Properties', 'callback': function( m ) {
                    console.log( m );
                }}
            ]
        }
    },
    'folder': {
        'name': 'Folder',
        'icon': 'folder',
        'exec': 'c:/windows/explorer.js',
    },
    'notepad': {
        'name': 'Text Document',
        'icon': 'notepad',
        'docIcon': 'txt',
        'exec': 'c:/windows/notepad.js',
    },
    'wordpad': {
        'name': 'Rich Text Document',
        'icon': 'wordpad',
        'docIcon': 'rtf',
        'exec': 'c:/windows/wordpad.js',
    },
    'prompt': {
        'name': 'Prompt',
        'icon': 'prompt',
        'exec': 'c:/windows/command.js',
    },
    'browser': {
        'name': 'Internet Shortcut',
        'icon': 'browser',
        'docIcon': 'url',
        'exec': 'c:/windows/browser.js',
    },
    'cdplayer': {
        'name': 'Music CD',
        'icon': 'cdplayer',
        'docIcon': 'cda',
        'exec': 'c:/windows/cdplayer.js',
    },
    'video': {
        'name': 'Video File',
        'icon': 'avi',
        'docIcon': 'avi',
        'exec': 'c:/windows/mpvideo.js',
    }
};

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
    $('#desktop').properties95( 'file', {
        'fileIcon': e.data.icon.icon,
        'fileName': e.data.icon.caption,
        'fileType': e.data.icon.description,
        'fileLocation': e.data.path,
        'caption': e.data.caption,
    } );
}

function _iconDoubleClickCallback( e ) {
    e.data.callback( e.data.cbData );
}

function populateFolder( container, folderPath ) {

    // Clear out containers before we start.
    $(container).children( '.desktop-icon' ).remove();
    
    var folder = resolvePath( folderPath );

    $(container).data( 'default-icon-x', 20 );
    $(container).data( 'default-icon-y', 20 );

    // Get a list of icons in the requested folder.
    for( var itemName in folder.children ) {
        let itemData = folder.children[itemName];

        var iconPos = [];
        if( !('iconX' in itemData) ) {
            iconPos = getNextIconPosition( container );
        } else {
            iconPos = [itemData.iconX, itemData.iconY];
        }

        var itemPath = folderPath + '/' + itemName;
        if( null == folderPath || 0 == folderPath.length ) {
            itemPath = itemName;
        }

        var icon = createAssocIcon( itemName, itemPath );
        icon.x = iconPos[0];
        icon.y = iconPos[1];
        var iconWrapper = $(container).desktop95( 'icon', icon );

        iconWrapper.mousedown( function( e ) {
            $(this).desktop95( 'select' );
        } );

        //iconWrapper.on( 'desktop-double-click', {'callback': icon.callback, 'cbData': null }, _iconDoubleClickCallback );

        // Add a level of indirection or else icon will stay in scope and change.
        iconWrapper.on( 'properties', {'path': folderPath, 'icon': icon}, _iconPropertiesCallback );
    }
}

function createAssocIcon( itemName, itemPath ) {
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
    
    fs = JSON.parse( localStorage.getItem( 'fs' ) );
    if( null == fs ) {
        fs = skel;
    }

    populateFolder( '#desktop', desktop95DesktopFolder );

    $('#desktop').desktop95( 'enable' );
    $('#desktop').on( 'new-folder', function( e ) {
        newFolder( resolvePath( desktop95DesktopFolder ), 'New Folder' );
        populateFolder( this, desktop95DesktopFolder );
    } );
    $('#desktop').on( 'arrange-icons', function( e, data ) {
        desktopFolder = resolvePath( desktop95DesktopFolder );
        switch( data.criteria ) {
        case 'name':
            desktopItemsNew = {};
            Object.keys( desktopFolder.children ).sort().forEach( function( key ) {
                desktopItemsNew[key] = desktopFolder.children[key];
            } );
            desktopFolder.children = desktopItemsNew;
            break;
        }
        populateFolder( this, desktop95DesktopFolder );
    } );

    var mouseCaller = {
        'type': 'shortcut',
        'exec': 'c:\\windows\\mousetray.js',
        'icon': 'mouse',
    };
    loadExe( 'c:\\windows\\mousetray.js', '', mouseCaller );

    //$('#desktop').window95( 'dialog', {'icon': 'info', 'caption': 'Test Message', 'message': 'This is a test.'});

    $('.button-start').startmenu95( 'enable' );
    $('.button-start').on( 'menu', function( e, menuElement, settings ) { 
        if( !settings.path.startsWith( '/Programs' ) ) {
            return;
        }

        var menuPath = settings.path.split( '/' );
        menuPath.shift(); // Remove root.
        menuPath.shift(); // Remove Programs.
        if( 0 == menuPath.length ) {
            menuPath = 'c:/windows/start menu/programs';
        } else {
            menuPath = 'c:/windows/start menu/programs/' + menuPath.join( '/' );
        }

        // Drill down to the submenu subfolder.
        var start_menu_progs = resolvePath(  menuPath );
        
        // Build the menu from items in the folder.
        settings.items = [];
        for( itemName in start_menu_progs.children ) {
            var itemPath = menuPath + '/' + itemName;
            var itemData = start_menu_progs.children[itemName];
            if( desktop95Types.FOLDER == itemData.type ) {
                settings.items.push( {'caption': itemName, 'type': menu95Type.EVENTMENU, 'icon': 'programs'} );
            } else {
                var icon = createAssocIcon( itemName, itemPath );
                icon.type = menu95Type.ITEM;
                settings.items.push( icon );
            }
        }

        $('#desktop').menu95( 'open', settings );
    } );

    $('.tray.notification-area').systray95( 'enable' );
} );
