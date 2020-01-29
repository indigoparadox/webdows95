
function boot() {
    'use strict';
    
    // Setup events delegated down from desktop.
    $('#desktop').on( 'desktop-populate', '.container', function( e ) {
        populateFolder( this, $(this).parents( '.window' ).attr( 'data-caller-path' ) );
        e.stopPropagation();
    } );

    // Setup root desktop events.
    $('#desktop').on( 'desktop-populate', function() {
        populateFolder( this, $(this).data( 'caller-path' ) );
    } );
    $('#desktop').desktop95( 'enable' );
    $('#desktop').attr( 'data-caller-path', 'c:\\windows\\desktop' );
    $('#desktop').on( 'icon-drop', _handleContainerDrop );
    $('#desktop').trigger( 'desktop-populate' );
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
    $('#desktop').on( 'properties', function( e ) {
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
        winHandle.menu95( 'close' );
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
