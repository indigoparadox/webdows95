
(function( $ ) {
$.fn.explorer95 = function( action, options ) {
    'use strict';

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

switch( action.toLowerCase() ) {

case 'start-clock':
    return this.each( function() {
        if( 0 < $(this).children( '.systray-clock' ).length ) {
            return;
        }
        $(this).append( '<span class="systray-clock"></span>' );
        $(this).children( '.systray-clock' ).explorer95( 'update-clock' );
        setInterval( function() { 
            $(this).children( 'systray-clock' ).explorer95( 'update-clock' );
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

    var taskbar = $('<div id="taskbar" class="taskbar"><div id="tasks" class="tasks"></div></div>');
    $('body').append( taskbar );

    var startButton = $('<button class="button-start"><span class="icon-start"></span>Start</button>');
    taskbar.prepend( startButton );
    startButton.on( 'click', function( e ) {
        startButton.explorer95( 'show-menu' );
    } );

    var notificationArea = $('<div class="tray notification-area"></div>');
    taskbar.append( notificationArea );

    $(notificationArea).explorer95( 'start-clock' );

    this.trigger( 'desktop-populate' );

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

    /*
    var folderMenu = {
        'items': [
            {'caption': 'Arrange Icons', 'type': menu95Type.SUBMENU, 'items': [
                {'caption': 'By Name', 'callback': function( m ) {
                    container.trigger( 'arrange-icons', [{'criteria': 'name'}] );
                }},
                {'caption': 'By Type', 'callback': function( m ) {
                    container.trigger( 'arrange-icons', [{'criteria': 'type'}] );
                }},
                {'caption': 'By Size', 'callback': function( m ) {
                    container.trigger( 'arrange-icons', [{'criteria': 'size'}] );
                }},
                {'caption': 'By Date', 'callback': function( m ) {
                    container.trigger( 'arrange-icons', [{'criteria': 'date'}] );
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Auto Arrange', 'callback': function( m ) {
                    container.trigger( 'arrange-icons', [{'criteria': 'auto'}] );
                }}
            ]},
            {'caption': 'Line up Icons', 'callback': function( m ) {
                container.trigger( 'line-up-icons' );
            }},
            {'type': menu95Type.DIVIDER},
            {'caption': 'Paste', 'callback': function( m ) {
                container.trigger( 'paste', [{'reference': 'shortcut'}] );
            }},
            {'caption': 'Paste Shortcut', 'callback': function( m ) {
                container.trigger( 'paste', [{'reference': 'shortcut'}] );
            }},
            {'type': menu95Type.DIVIDER},
            {'caption': 'New', 'type': menu95Type.SUBMENU, 'items': [
                {'caption': 'Folder', 'icon': 'folder', 'callback': function( m ) {
                    container.trigger( 'new-folder' );
                }}
            ]},
            {'type': menu95Type.DIVIDER},
            {'caption': 'Properties', 'callback': function( m ) {
                container.props95( props95Panel.DISPLAY );
            }}
        ]
    };

    container.menu95( 'context', {'menu': folderMenu, 'context': _htmlStrToClass( settings.target )} );
    */

    winHandle.removeClass( 'window-hidden' );

    console.assert( 1 == winHandle.length );

    return winHandle;

case 'open':

    if( 0 < $('#taskbar').length ) {
        return this.explorer95( 'open-folder', settings );
    } else {
        return this.explorer95( 'open-taskbar', settings );
    }

}; }; }( jQuery ) );
