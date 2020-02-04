
(function( $ ) {
$.fn.explorer95 = function( action, options, enviro ) {
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
    'targetWindow': 'new',
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

case 'browse-save':
    settings.w = 420;
    settings.h = 260;
    settings.show = false;
    settings.resizable = false;
    settings.icon = null;

    var winHandle = $('#desktop').window95( 'open', settings );

    winHandle.addClass( 'window-browse' );

    var pathRow = $('<div class="browse-path-row"><label>Save in:</label></div>');
    var folderSelect = $('<select class="browse-folder-select input-select"></select>');
    var folderWrapper = $('<div class="select-wrapper browse-folder-select-wrapper"></div>');
    folderWrapper.append( folderSelect );
    pathRow.append( folderWrapper );

    winHandle.find( '.window-form' ).append( pathRow );

    var wrapper = $('<div class="container-wrapper browse-container-wrapper"></div>');
    var container = $('<div class="window-folder-container browse-container container"></div>');
    wrapper.append( container );
    winHandle.find( '.window-form' ).append( wrapper );

    var inputPath = $('<input type="text" class="browse-path input-text" name="browse-path" />');
    var saveButton = $('<button class="browse-button-save">Save</button>');

    saveButton.on( 'click', function( e ) {
        e.preventDefault();
    } );
    
    var filenameRow = $('<div class="browse-filename-row"><label>File name:</label></div>');
    filenameRow.append( inputPath );
    filenameRow.append( saveButton );
    winHandle.find( '.window-form' ).append( filenameRow );

    var typeSelect = $('<select class="browse-select-type input-select" name="browse-select-type"></select>');
    var cancelButton = $('<button class="browse-button-cancel">Cancel</button>');

    cancelButton.on( 'click', function( e ) {
        e.preventDefault();
    } );
    
    var typeRow = $('<div class="browse-type-row"><label>Save as type:</label></div>');
    var typeWrapper = $('<div class="select-wrapper browse-select-type-wrapper"></div>');
    typeWrapper.append( typeSelect );
    typeRow.append( typeWrapper );
    typeRow.append( cancelButton );
    winHandle.find( '.window-form' ).append( typeRow );

    for( var key in env ) {
        container.attr( 'data-' + key, env[key] );
    }

    container.desktop95( 'enable' );

    winHandle.addClass( 'window-scroll-contents' );

    console.assert( 1 == winHandle.length );
    console.assert( winHandle.hasClass( 'window-hidden' ) );

    /* if( null != settings.target ) {
        winHandle.addClass( 'explore-' + _htmlStrToClass( settings.target ) );
    } */

    winHandle.removeClass( 'window-hidden' );

    container.trigger( 'desktop-populate', {'iconSize': 16, 'iconTextPosition': 'right', 'targetWindow': 'same'} );

    console.assert( 1 == winHandle.length );

    return winHandle;

case 'open-taskbar':

    var desktop = null;
    if( 0 >= $('#desktop').length ) {
        desktop = $('<div id="desktop" class="container"></div>');
        this.append( desktop );
        desktop.desktop95( 'enable' );

        for( var key in env ) {
            desktop.attr( 'data-' + key, env[key] );
        }
    }

    var taskbar = $('<div id="taskbar" class="taskbar"><div id="tasks" class="tasks"></div></div>');
    this.append( taskbar );

    var startButton = $('<button class="button-start"><span class="icon-start"></span>Start</button>');
    taskbar.prepend( startButton );
    startButton.on( 'click', function( e ) {
        startButton.explorer95( 'show-menu' );
    } );

    var notificationArea = $('<div class="tray notification-area"></div>');
    taskbar.append( notificationArea );

    $(notificationArea).explorer95( 'start-clock' );

    desktop.trigger( 'desktop-populate' );

    return desktop;

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

    var wrapper = $('<div class="container-wrapper"></div>');

    var container = $('<div class="window-folder-container container"></div>');
    wrapper.append( container );
    winHandle.find( '.window-form' ).append( wrapper );

    for( var key in env ) {
        container.attr( 'data-' + key, env[key] );
    }

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

    container.trigger( 'desktop-populate' );

    console.assert( 1 == winHandle.length );

    return winHandle;

case 'open':

    if( 0 < $('#taskbar').length ) {
        return $('body').explorer95( 'open-folder', settings, env );
    } else {
        return $('body').explorer95( 'open-taskbar', settings, env );
    }

}; }; }( jQuery ) );
