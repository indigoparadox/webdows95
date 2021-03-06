
function handlePromptLine( text, winPrompt ) {
    'use strict';

    var workingPath = winPrompt.env95( 'get', 'working-path' );
    var env = winPrompt.env95( 'get' );

    var cMatch;

    winPrompt.command95( 'newline' );

    if( '' == text ) {
        // Do nothing.
            
    } else if( null != (cMatch = text.match( /^cd (.*)/i )) ) {
        // CD command
        let folder = resolvePath( workingPath );
        if( '..' == cMatch[1] ) {
            var parentPath = dirName( workingPath );
            if( '' != parentPath ) {
                winPrompt.env95( 'set', 'working-path', parentPath );
                winPrompt.env95( 'set', 'prompt-text', parentPath.toUpperCase() + '>' );
            }
        } else if( 
            'children' in folder && cMatch[1] in folder.children
        ) {
            let newDir = workingPath + '\\' + cMatch[1];
            winPrompt.env95( 'set', 'working-path',  newDir );
            winPrompt.env95( 'set', 'prompt-text', newDir.toUpperCase() + '>' );
        } else {
            winPrompt.command95( 'enter', {'text': 'Invalid directory'}, env );
        }
    } else if( null != (cMatch = text.match( /^dir ?(.*)?/i )) ) {
        // DIR command
        // TODO: Targeted DIR
        winPrompt.command95( 'puts', {'text': 'Volume in drive C is WEBDOWS95\n'} );
        winPrompt.command95( 'puts', {'text': 'Volume Serial Number is DEAD-BEEF\n'} );
        winPrompt.command95( 'puts', {'text': 'Directory of ' + workingPath + '\n\n'} );
        var fileCt = 0;
        // XXX Resolve folder at command time.
        let folder = resolvePath( workingPath );
        for( var filename in folder.children ) {
            var filedata = folder.children[filename];

            if( null == filedata ) {
                continue;
            }

            if( File95Types.FOLDER == filedata.type ) {
                winPrompt.command95( 'puts', {'text': filename.toUpperCase() + '\t' + '<DIR>\t01-01-95\t04:20a\n'} );
            } else {
                winPrompt.command95( 'puts', {'text': filename.toUpperCase() + '\n'} );
            }
            fileCt += 1;
        }
        winPrompt.command95( 'puts', {'text': fileCt.toString() + ' file(s)\t0 bytes\n'} );
        winPrompt.command95( 'puts', {'text': '0 bytes free\n\n'} );
    } else if(
        text in resolvePath( workingPath ).children &&
        resolvePath( workingPath + '\\' + text ).type == File95Types.EXECUTABLE
    ) {
        // TODO: Handle args.
        // TODO: Use ID for winPrompt.
        env['window-parent'] = winPrompt;
        execVE( workingPath + '\\' + text, {}, env );
    } else {
        winPrompt.command95( 'puts', {'text': 'Sad command or file name\n'} )
    }
    
    // Print the prompt.
    winPrompt.command95( 'puts', {'text': winPrompt.env95( 'get', 'prompt-text' ), 'addToLine': false} );
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

    execVE( 'c:\\windows\\explorer.js', {}, {'working-path': 'c:\\windows\\desktop'} );
    //var winPrompt = execV( 'c:\\windows\\command.js' );

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
            if( File95Types.FOLDER == iter.type ) {
                settings.items.push( {
                    'caption': iter.name,
                    'type': menu95Type.EVENTMENU,
                    'icon': 'programs'
                } );
            } else if( File95Types.SHORTCUT == iter.type ) {
                var target = iter.resolve();
                console.log( iter );
                settings.items.push( {
                    'caption': iter.name,
                    'type': menu95Type.ITEM,
                    'icon': iter.icon,
                    'callback': function() {
                        let itemPath = menuPath + '\\' + iter.caption;
                        var itemObject = resolvePath( itemPath ).resolve();
                        execVE( itemObject.exec, itemObject.args, itemObject.env );
                    }
                } );
            } else {
                settings.items.push( {
                    'caption': iter.name,
                    'type': menu95Type.ITEM,
                    'icon': iter.icon,
                    'callback': function() {
                        let itemPath = menuPath + '\\' + iter.caption;
                        var itemObject = resolvePath( itemPath ).resolve();
                        execVE( itemObject.exec, itemObject.args, itemObject.env );
                    }
                } );
            }
        } );

        $('#desktop').menu95( 'open', settings );
    } );
}
