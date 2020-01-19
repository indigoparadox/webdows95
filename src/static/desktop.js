
const desktop95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
    'EXECUTABLE': 'executable',
};

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
                                populateFolder( winFolder, '' );
                            } else {
                                populateFolder( winFolder, shortcut.path );
                            }
                        }
                    },
                    'browser.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/browser.js',
                        'entry': 'browser95'
                    },
                    'cdplayer.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/cdplayer.js'
                    },
                    'command.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/command.js',
                        'onOpen': function( winCommand, shortcut ) {
                            winCommand.data( 'folder', fs.children['c:'] );
                            winCommand.data( 'folder-path', 'c:' );
                            winCommand.data( 'folder-parent', fs.children['c:'] );
                            winCommand.data( 'folder-parent-path', 'c:' );
                        }
                    },
                    'notepad.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/notepad.js',
                    },
                    'wordpad.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/wordpad.js'
                    },
                    'mpvideo.js': {
                        'type': desktop95Types.EXECUTABLE,
                        'src': 'src/static/desktop-1995/apps/mpvideo.js'
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
                                                        'args': {
                                                            'archiveEnd':'19991200000000',
                                                            'archiveStart':'19990100000000',
                                                            'url': 'http://google.com',
                                                            'id': 'w-browser',
                                                        },
                                                        'type': 'browser',
                                                    },
                                                }
                                            },
                                            'Multimedia': {
                                                'type': desktop95Types.FOLDER,
                                                'children': {
                                                    'CD Player': {
                                                        'type': 'cdplayer',
                                                        'args': {
                                                            'playlist': [
                                                                {
                                                                    'url': 'finalizing.mp3',
                                                                    'artist': '</body>',
                                                                    'album': 'Initializing...',
                                                                    'title': 'Finalizing...'
                                                                }
                                                            ],
                                                            'id': 'w-cd-player',
                                                        }
                                                    },
                                                }
                                            },
                                            'Notepad':{
                                                'type':'notepad'
                                            },
                                            'WordPad':{
                                                'type':'wordpad'
                                            },
                                        }
                                    },
                                    'Prompt': {
                                        'type':'prompt',
                                        'args': {
                                            'id': 'w-command',
                                            'lineHandler': handlePromptLine,
                                        }
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
                                'args': {
                                    'archiveEnd':'19991200000000',
                                    'archiveStart':'19990100000000',
                                    'url': 'http://google.com',
                                    'id': 'w-browser',
                                },
                                'type':'browser'},
                            'Prompt':{
                                'type':'prompt',
                                'args': {
                                    'id': 'w-command',
                                    'lineHandler': handlePromptLine,
                                }
                            },
                            'CD Player':{
                                'type': 'cdplayer',
                                'args': {
                                    'playlist': [
                                        {
                                            'url': 'finalizing.mp3',
                                            'artist': '</body>',
                                            'album': 'Initializing...',
                                            'title': 'Finalizing...'
                                        }
                                    ],
                                    'id': 'w-cd-player',
                                },
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

function loadExe( pathString, callerPath ) {

    // This will resolve once the exe is loaded.
    def = new $.Deferred();

    // This is the beginning of stuff that runs at call time (not define time),
    // so we can start resolving things from keys to dicts.
    caller = resolvePath( callerPath );
    caller.path = callerPath;

    // Drill down to the executable.
    file = resolvePath( pathString );

    var _exeRunAfterLoad = function() {
        // Always have an args object.
        if( !('args' in caller) ) {
            caller.args = {};
        }
        
        if( !('id' in caller.args) ) {
            caller.args.id = 'w-' + _htmlStrToClass( callerPath );
        }

        if( !('entry' in file) ) {
            file.entry = file.name.split( '.' )[0] + '95';
        }
        var winHandle = $('#desktop')[file.entry]( 'open', caller.args );
        if( 'onOpen' in file ) {
            file.onOpen( winHandle, caller );
        }
        def.resolve();
    }

    if( 0 < $('#exe-' + _htmlStrToClass( file.src )).length ) {
        // We're already loaded.
        _exeRunAfterLoad();
        return def.promise();
    }

    // Load the executable code and resolve the promise when ready.
    $('#desktop').css( 'cursor', 'progress' );
    $.get( file.src, function( data ) {
        var scriptElement = $('<script id="exe-' + _htmlStrToClass( file.src ) + '" type="text/javascript">' + data + '</script>');
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
    } else {
        winPrompt.command95( 'enter', {'text': 'Sad command or file name'} )
    }
}

var associations = {
    'executable': {
        'icon': 'exe',
        'opener': function( path ) {
        },
    },
    'computer': {
        'icon': 'computer',
        'opener': function( path ) {
            loadExe( 'c:/windows/explorer.js', path );
        }
    },
    'drive': {
        'icon': 'drive',
        'opener': function( path ) {
            loadExe( 'c:/windows/explorer.js', path );
        }
    },
    'folder': {
        'icon': 'folder',
        'opener': function( path ) {
            loadExe( 'c:/windows/explorer.js', path );
        }
    },
    'notepad': {
        'icon': 'notepad',
        'docIcon': 'txt',
        'opener': function( path ) {
            loadExe( 'c:/windows/notepad.js', path );
        }
    },
    'wordpad': {
        'icon': 'wordpad',
        'docIcon': 'rtf',
        'opener': function( path ) {
            loadExe( 'c:/windows/wordpad.js', path );
        }
    },
    'prompt': {
        'icon': 'prompt',
        'opener': function( path ) {
            loadExe( 'c:/windows/command.js', path );
        }
    },
    'browser': {
        'icon': 'browser',
        'opener': function( path ) {
            loadExe( 'c:/windows/browser.js', path );
        }
    },
    'cdplayer': {
        'icon': 'cdplayer',
        'opener': function( path ) {
            loadExe( 'c:/windows/cdplayer.js', path );
        }
    },
    'video': {
        'icon': 'avi',
        'docIcon': 'avi',
        'opener': function( path ) {
            loadExe( 'c:/windows/mpvideo.js', path );
        }
    }
};

function populateFolder( parentWinHandle, folderPath ) {

    // Clear out containers before we start.
    $(parentWinHandle).children( '.icon' ).remove();
    $(parentWinHandle).children( '.window-form' ).children( '.container' ).children( '.icon' ).remove();

    var folder = resolvePath( folderPath );

    var defIconX = 20;
    var defIconY = 20;

    // Get a list of icons in the requested folder.
    for( var itemName in folder.children ) {
        itemData = folder.children[itemName];

        // Setup the icon's position on the folder window/desktop.
        if( defIconY >= $(container).height() - 70 ) {
            defIconY = 20;
            defIconX += 70;
        }

        if( !('iconX' in itemData) ) {
            itemData.iconX = defIconX;
        }
        if( !('iconY' in itemData) ) {
            itemData.iconY = defIconY;
            defIconY += 70;
        }

        // Figure out where the container is (e.g. if asked to populate a window).
        var container = $(parentWinHandle).find( '.container' );
        if( 0 == container.length ) {
            container = $(parentWinHandle);
        }

        var itemPath = folderPath + '/' + itemName;
        if( null == folderPath || 0 == folderPath.length ) {
            itemPath = itemName;
        }

        var icon = createAssocIcon( itemName, itemPath );
        container.desktop95( 'icon', icon );
    }
}

function createAssocIcon( itemName, itemPath ) {
    var itemData = resolvePath( itemPath );

    // Setup the icon image.
    var iconName = '';
    if(
        itemData.type in associations &&
        ('args' in itemData) &&
        'docIcon' in associations[itemData.type]
    ) {
        // This is a document, so use the doc icon.
        iconName = associations[itemData.type].docIcon;

    } else if( itemData.type in associations && 'icon' in associations[itemData.type] ) {
        // Use the association icon.
        iconName = associations[itemData.type].icon;

    } else if( 'icon' in itemData ) {
        // Use the icon embedded in the file.
        iconName = itemData.icon;

    } else {
        // Use a generic icon.
        iconName = 'generic';
    }

    // Create the icon settings pack.
    if( itemData.type in associations ) {
        return { 'caption': itemName,
            'icon': iconName,
            'x': itemData.iconX, 'y': itemData.iconY,
            'callback': associations[itemData.type].opener,
            'cbData': itemPath };
    }
}

$(document).ready( function() {
    
    fs = JSON.parse( localStorage.getItem( 'fs' ) );
    if( null == fs ) {
        fs = skel;
    }

    populateFolder( '#desktop', 'c:/windows/desktop' );

    $('#desktop').desktop95( 'enable' );

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
