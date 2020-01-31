
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

function boot() {
    'use strict';

    // Handle: Icon Properties
    $('body').on( 'properties', '.desktop-icon', function( e ) {
        var iconPath = $(e.target).closest( '.desktop-icon' ).attr( 'data-item-path' );
        var iconData = resolvePath( iconPath );

        if( iconData.type in associations ) {
            iconData = $.extend( {}, associations[iconData.type], iconData );
        }

        execV( 'c:\\windows\\props.js', {
            'panel': 'file',
            'fileIcon': iconData.icon,
            'fileName': iconData.name,
            'fileType': iconData.description,
            'fileLocation': iconPath,
            'caption': iconData.name,
        } );
        e.stopPropagation();
    } );

    // Handle: Folder Context Menu
    $('body').on( 'contextmenu', '.container', function( e ) {
        e.preventDefault();

        if( !$(e.target).hasClass( 'container' ) ) {
            return;
        }

        var desktopMenu = {
            'type': menu95Type.SUBMENU,
            //'caller': $(e.target),
            'container': '#desktop',
            'location': {'x': e.pageX, 'y': e.pageY},
            'items': [
                {'caption': 'Arrange Icons', 'type': menu95Type.SUBMENU, 'items': [
                    {'caption': 'By Name', 'callback': function( m ) {
                        $(e.target).trigger( 'arrange-icons', [{'criteria': 'name'}] );
                    }},
                    {'caption': 'By Type', 'callback': function( m ) {
                        $(e.target).trigger( 'arrange-icons', [{'criteria': 'type'}] );
                    }},
                    {'caption': 'By Size', 'callback': function( m ) {
                        $(e.target).trigger( 'arrange-icons', [{'criteria': 'size'}] );
                    }},
                    {'caption': 'By Date', 'callback': function( m ) {
                        $(e.target).trigger( 'arrange-icons', [{'criteria': 'date'}] );
                    }},
                    {'type': menu95Type.DIVIDER},
                    {'caption': 'Auto Arrange', 'callback': function( m ) {
                        $(e.target).trigger( 'arrange-icons', [{'criteria': 'auto'}] );
                    }}
                ]},
                {'caption': 'Line up Icons', 'callback': function( m ) {
                    $(e.target).trigger( 'line-up-icons' );
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Paste', 'callback': function( m ) {
                    $(e.target).trigger( 'paste', [{'reference': 'shortcut'}] );
                }},
                {'caption': 'Paste Shortcut', 'callback': function( m ) {
                    $(e.target).trigger( 'paste', [{'reference': 'shortcut'}] );
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'New', 'type': menu95Type.SUBMENU, 'items': [
                    {'caption': 'Folder', 'icon': 'folder', 'callback': function( m ) {
                        $(e.target).trigger( 'new-folder' );
                    }}
                ]},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Properties', 'callback': function( m ) {
                    $(e.target).trigger( 'properties' );
                }}
            ]
        };
        
        $(e.target).menu95( 'open', desktopMenu );

        e.stopPropagation();
    } );

    // Handle: Icon Context Menus
    $.each( associations, function( typeIter ) {
        var contextMenu = {
            'items': [
                {
                    // Just a caption should send an appropriately-named event to the target.
                    'caption': 'Properties'
                }
            ]
        };
        if( 'contextMenu' in associations[typeIter] ) {
            contextMenu = associations[typeIter].contextMenu;
        }
        $('body').on( 'contextmenu', '[data-item-type="' + typeIter + '"]', function( e ) {
            e.preventDefault();
            contextMenu.caller = $(e.target).parents( '.desktop-icon' );
            contextMenu.container = '#desktop';
            contextMenu.location = {'x': e.pageX, 'y': e.pageY};
            $('#desktop').menu95( 'close' );
            $(this).menu95( 'open', contextMenu );
        } );
    } );

    // Setup root desktop events.
    $('body').on( 'icon-drop', '.container', _handleContainerDrop );
    $('body').on( 'new-folder', '.container', function( e ) {
        newFolder( resolvePath( $(this).attr( 'data-path' ) ), 'New Folder' );
        $(this).trigger( 'populate-folder' );

        // Or else we'll make a folder on the desktop, too...
        e.stopPropagation();
    } );
    $('body').on( 'arrange-icons', '.container', function( e, data ) {
        //var desktopFolder = resolvePath( desktop95DesktopFolder );
        var desktopFolder = resolvePath( $(this).attr( 'data-path' ) );
        switch( data.criteria ) {
        case 'name':
            var desktopItemsNew = {};
            Object.keys( desktopFolder.children ).sort().forEach( function( key ) {
                desktopItemsNew[key] = desktopFolder.children[key];
            } );
            desktopFolder.children = desktopItemsNew;
            break;
        }
        $(this).trigger( 'populate-folder' );

        e.stopPropagation();
    } );
    $('body').on( 'properties', '#desktop', function( e ) {
        execV( 'c:\\windows\\props.js', {'panel': 'display', 'caption': 'Display Properties'} );
    } );

    /* $('#desktop').on( 'icon-drag', function( e, icon ) {
        //console.log( icon.source.data( 'path' ) + ' to ' + icon.target.data( 'path' ) );
    } ); */

    // Setup window icon menus.
    var _handleWindowMenu = ( e ) => {
        e.preventDefault();
        var winHandle = $(e.target).parents( '.window' );
        var titlebar = $(e.target).parents( '.titlebar' );
        var windowMenu = {
            'type': menu95Type.SUBMENU,
            'caller': titlebar,
            'container': winHandle,
            'location': menu95Location.BOTTOM,
            'items': [
                {'caption': 'Restore', 'callback': function( m ) {
                    $(winHandle).window95( 'restore' );
                }},
                {'caption': 'Move', 'callback': function( m ) {
                    
                }},
                {'caption': 'Size', 'callback': function( m ) {
                    
                }},
                {'caption': 'Minimize', 'callback': function( m ) {
                    $(winHandle).window95( 'minimize' );
                }},
                {'caption': 'Maximize', 'callback': function( m ) {
                    $(winHandle).window95( 'maximize' );
                }},
                {'caption': 'Close', 'callback': function( m ) {
                    $(winHandle).window95( 'close' );
                }}
            ]
        };
        //winHandle.menu95( 'close' );
        winHandle.menu95( 'open', windowMenu );
    };

    $('body').on( 'click', '.window > .titlebar > .titlebar-icon', _handleWindowMenu );
    $('body').on( 'contextmenu', '.window > .titlebar > .titlebar-icon', _handleWindowMenu );
    $('body').on( 'click', '.window > .titlebar', function( e ) { $(e.target).parents( '.window' ).menu95( 'close' ); } );
    $('body').on( 'contextmenu', '.window > .titlebar', _handleWindowMenu );

    // Load up the mouse/tray icon tester (optional).
    // TODO: Put this in startup folder.
    /* var mouseCaller = {
        'type': 'shortcut',
        'exec': 'c:\\windows\\mousetray.js',
        'icon': 'mouse',
    };
    loadExe( 'c:\\windows\\mousetray.js', '', mouseCaller ); */

    execV( 'c:\\windows\\explorer.js', {'data': {'path': 'c:\\windows\\desktop'}} );
    //execV( 'c:\\windows\\command.js', {'data': {'path': 'c:\\windows\\desktop'}} );

    //$('#desktop').window95( 'dialog', {'icon': 'info', 'caption': 'Test Message', 'message': 'This is a test.'});

    $('body').on( 'menu', '.button-start', function( e, menuElement, settings ) { 
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
        let listing = listFolder( menuPath );
        listing.forEach( function( iter ) {
            if( desktop95Types.FOLDER == iter.type ) {
                settings.items.push( {
                    'caption': iter.name,
                    'type': menu95Type.EVENTMENU,
                    'icon': 'programs'
                } );
            } else {
                settings.items.push( {
                    'caption': iter.caption,
                    'type': menu95Type.ITEM,
                    'icon': iter.icon,
                    'callback': function() {
                        let itemPath = menuPath + '\\' + iter.caption;
                        resolveExec( itemPath );
                    }
                } );
            }
        } );

        $('#desktop').menu95( 'open', settings );
    } );
}
