
(function( $ ) {
    $.fn.finder95 = function( action, options, enviro ) {
    
    var settings = $.extend( {
        'caption': 'Explorer',
        'target': null,
        'id': null,
        'x': 10,
        'y': 10,
        'w': 320,
        'h': 260,
        'callback': null,
        'cbData': null,
        'menuContainer': '#desktop',
    }, options );

    var env = $.extend( {
        'working-path': ''
    }, enviro );
    
    switch( action.toLowerCase() ) {
    
    case 'start-clock':
        return this.each( function() {
            if( 0 < $(this).children( '.systray-clock' ).length ) {
                return;
            }
            $(this).append( '<span class="systray-clock"></span>' );
            $(this).children( '.systray-clock' ).finder95( 'update-clock' );
            setInterval( function() { 
                $(this).children( 'systray-clock' ).finder95( 'update-clock' );
            }, 1000 );
        } );
    
    case 'update-clock':
        var now = new Date();
        
        var minuteString = now.getMinutes();
        if( 9 >= minuteString ) {
            minuteString = '0' + minuteString.toString();
        } else {
            minuteString = minuteString.toString();
        }
        
        var amPm = 'AM';
        var hourString = now.getHours();
        if( 12 < hourString ) {
            hourString -= 12;
            amPm = 'PM';
        }
        hourString = hourString.toString();
        
        this.text( hourString + ':' + minuteString + ' ' + amPm );
        return this;
    
    case 'show-menu':
        // Close the menu if it's presently open.
        if( $(this).hasClass( 'menu-caller-active' ) ) {
            $('.logo-menu').menu95( 'close' );
            return; // Stop after closing.
        }
    
        // Build and show the menu.
        var menu = {
            'location': menu95Location.TOP,
            'container': '#desktop',
            'caller': '.button-start',
            'classes': ['logo-menu'],
            'items': [
                {'caption': 'Programs', 'type': menu95Type.EVENTMENU, 'icon': 'programs', 'large': true,
                    'trigger': 'programs'},
                {'caption': 'Documents', 'type': menu95Type.SUBMENU, 'icon': 'documents', 'large': true,
                    'items': documentsMenu95},
                {'caption': 'Settings', 'type': menu95Type.EVENTMENU, 'icon': 'settings', 'large': true,
                    'trigger': 'settings'},
                {'caption': 'Find', 'icon': 'find', 'large': true, 'callback': function( m ) {
                    
                }},
                {'caption': 'Help', 'icon': 'help', 'large': true, 'callback': function( m ) {
                    
                }},
                {'caption': 'Run...', 'icon': 'run', 'large': true, 'callback': function( m ) {
                    
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Shut Down...', 'icon': 'shutdown', 'large': true, 'callback': function( m ) {
                    
                }}
            ]
        };
    
        $(settings.menuContainer).menu95( 'close' );
        var menu = $(settings.menuContainer).menu95( 'open', menu );
    
        var stripe = '<div class="logo-stripe-wrapper"><div class="logo-stripe"></div></div>';
        menu.append( stripe );
    
        menu.show();
        break;
    
    case 'open-taskbar':

        var desktop = $('#desktop');
        for( var key in settings.data ) {
            desktop.attr( 'data-' + key, settings.data[key] );
        }

        var windowMenu = {
            'type': menu95Type.MENUBAR,
            'caller': $('#desktop'),
            'container': $('#desktop'),
            'location': menu95Location.BOTTOM,
            'items': [
                {
                    'caption': 'File', 
                    'type': menu95Type.SUBMENU,
                    'items': [
                        {'caption': 'New Folder'}
                    ]
                },
                {
                    'caption': 'Special',
                    'type': menu95Type.SUBMENU,
                    'items': [
                        {'caption': 'Shut Down'}
                    ]   
                },
            ]
        };
        var menu = $('#desktop').menu95( 'open', windowMenu );

        console.log( menu );
    
        /*
        var taskbar = $('<div id="taskbar" class="taskbar"><div id="tasks" class="tasks"></div></div>');
        $('body').append( taskbar );
    
        var startButton = $('<button class="button-start"><span class="icon-start"></span>Start</button>');
        taskbar.prepend( startButton );
        startButton.on( 'click', function( e ) {
            startButton.finder95( 'show-menu' );
        } );
    */

        menu.append( '<div class="menu-spacer"></div>' );
    
        var notificationArea = $('<div class="tray notification-area"></div>');
        menu.append( notificationArea );
    
        $(notificationArea).finder95( 'start-clock' );

        $('#desktop').trigger( 'desktop-populate' );

        return null;
    
    case 'open-folder':
    
        settings.menu = {
            'type': menu95Type.MENUBAR,
            'items': [
                {'caption': 'File',
                'type': menu95Type.SUBMENU, 'items': [
                    {'caption': 'Close', 'callback': function( m ) {
                        winHandle.window95( 'close' );
                    }}
            ]}
        ]};
        settings.show = false;
        settings.resizable = true;
        settings.icon = 'folder';
    
        var winHandle = $('#desktop').window95( 'open', settings );
    
        winHandle.addClass( 'window-folder' );
    
        winHandle.control95( 'statusbar' );
    
        var container = $('<div class="window-folder-container container"></div>');
        winHandle.find( '.window-form' ).append( container );

        for( var key in env ) {
            container.attr( 'data-' + key, env[key] );
        }
    
        // Mousedown/Mousemove are handled by desktop events.
    
        /*
        container.mouseup( function( e ) {
            $(e.target).desktop95( 'completerect' );
        } );
    
        container.mouseleave( function( e ) {
            $(e.target).desktop95( 'completerect' );
        } );
    
        container.on( 'selectstart', function( e ) {
            return false;
        } );
        */
    
        container.desktop95( 'enable' );
    
        var trayObjects = $('<div class="tray tray-objects"></div>');
        winHandle.children( '.statusbar' ).append( trayObjects );
    
        var trayBytes = $('<div class="tray tray-bytes"></div>');
        winHandle.children( '.statusbar' ).append( trayBytes );
    
        winHandle.addClass( 'window-scroll-contents' );
    
        console.assert( 1 == winHandle.length );
        console.assert( winHandle.hasClass( 'window-hidden' ) );
    
        if( null != settings.target ) {
            winHandle.addClass( 'explore-' + _htmlStrToClass( settings.target ) );
        }
    
        winHandle.removeClass( 'window-hidden' );
    
        console.assert( 1 == winHandle.length );
    
        return winHandle;
    
    case 'open':
    
        if( 0 < $('#taskbar').length ) {
            return this.finder95( 'open-folder', settings );
        } else {
            return this.finder95( 'open-taskbar', settings );
        }
    
    }; }; }( jQuery ) );
    