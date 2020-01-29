
function boot() {
    'use strict';

    // Setup file icon population.
    $('body').on( 'desktop-populate', '.container', function( e ) {
        populateFolder( this, $(this).attr( 'data-caller-path' ) );
        e.stopPropagation();
    } );

    $('body').on( 'properties', '.desktop-icon', function( e ) {
        var icon = $(e.target).data( 'icon' );
        var propsCaller = {
            'type': 'shortcut',
            'exec': 'c:\\windows\\props.js',
            'args': {
                'panel': 'file',
                'fileIcon': icon.icon,
                'fileName': icon.caption,
                'fileType': icon.description,
                'fileLocation': $(e.target).data( 'path' ),
                'caption': icon.caption,
            }
        };
        loadExe( 'c:\\windows\\props.js', '', propsCaller );
        e.stopPropagation();
    } );

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

    for( var typeIter in associations ) {
        var contextMenu = {
            'items': [
                {
                    // Just a caption should send an appropriately-named event to the target.
                    'caption': 'Properties'
                }
            ]
        };
        if( 'context' in associations[typeIter] ) {
            contextMenu = associations[typeIter].context;
        }
        $('body').on( 'contextmenu', '.icon-' + typeIter, function( e ) {
            e.preventDefault();
            contextMenu.caller = $(e.target).parents( '.desktop-icon' );
            contextMenu.container = '#desktop';
            contextMenu.location = {'x': e.pageX, 'y': e.pageY};
            $(this).menu95( 'open', contextMenu );
        } );
    }

    // Setup root desktop events.
    $('#desktop').desktop95( 'enable' );
    $('#desktop').attr( 'data-caller-path', 'c:\\windows\\desktop' );
    $('#desktop').on( 'icon-drop', _handleContainerDrop );
    $('#desktop').on( 'new-folder', function( e ) {
        newFolder( resolvePath( desktop95DesktopFolder ), 'New Folder' );
        $(this).trigger( 'populate-folder' );
    } );
    $('#desktop').on( 'arrange-icons', function( e, data ) {
        var desktopFolder = resolvePath( desktop95DesktopFolder );
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
    } );
    $('body').on( 'properties', '#desktop', function( e ) {
        var propsCaller = {
            'type': 'shortcut',
            'exec': 'c:\\windows\\props.js',
            'icon': 'mouse',
            'args': {
                'panel': 'display',
                'caption': 'Display Properties',
            }
        };
        loadExe( 'c:\\windows\\props.js', '', propsCaller );
    } );

    $('#desktop').on( 'icon-drag', function( e, icon ) {
        //console.log( icon.source.data( 'path' ) + ' to ' + icon.target.data( 'path' ) );
    } );

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

    $('#desktop').on( 'click', '.window > .titlebar > .titlebar-icon', _handleWindowMenu );
    $('#desktop').on( 'contextmenu', '.window > .titlebar > .titlebar-icon', _handleWindowMenu );
    $('#desktop').on( 'click', '.window > .titlebar', function( e ) { $(e.target).parents( '.window' ).menu95( 'close' ); } );
    $('#desktop').on( 'contextmenu', '.window > .titlebar', _handleWindowMenu );

    // Load up the mouse/tray icon tester (optional).
    // TODO: Put this in startup folder.
    /* var mouseCaller = {
        'type': 'shortcut',
        'exec': 'c:\\windows\\mousetray.js',
        'icon': 'mouse',
    };
    loadExe( 'c:\\windows\\mousetray.js', '', mouseCaller ); */

    var smCaller = {
        'type': 'shortcut',
        'exec': 'c:\\windows\\explorer.js',
        'icon': 'start',
    };
    loadExe( 'c:\\windows\\explorer.js', '', smCaller );

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
}
