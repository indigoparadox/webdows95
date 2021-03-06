
(function( $ ) {
$.fn.notepad95 = function( action, options ) {

var settings = $.extend( {
    'caption': 'Notepad',
    'id': null,
    'resizable': true,
    'menu': null,
    'x': 10,
    'y': 10,
    'w': 480,
    'h': 260,
    'url': null,
    'contents': null,
    'path': null,
}, options );

switch( action.toLowerCase() ) {
case 'readurl':
    return this.each( function( idx, winHandle ) {
        $.get( settings.url, function( data ) {
            $(winHandle).find( '.input-textarea' ).text( data );
        } );
    } );

case 'readcontents':
    return this.each( function( idx, winHandle ) {
        $(winHandle).find( '.input-textarea' ).text( settings.contents );
    } );

case 'save-as':

    return this;

case 'save-contents':
    this.trigger( 'save-document', settings.path, this.find( '.input-textarea' ).text() );
    return this;

case 'open':

    settings.menu = null;
    settings.show = false;
    settings.icon = 'txt';

    var winHandle = this.window95( 'open', settings );
    
    menu = {
        'type': menu95Type.MENUBAR,
        'caller': winHandle,
        'container': winHandle,
        'items': [
            {'caption': 'File', 'type': menu95Type.SUBMENU, 'items': [
                {'caption': 'New', 'callback': function( m ) {
                }},
                {'caption': 'Open...', 'callback': function( m ) {
                }},
                {'caption': 'Save', 'callback': function( m ) {
                    winHandle.notepad95( 'save-document', {'path': winHandle.attr( 'document-path')} );
                }},
                {'caption': 'Save As...', 'callback': function( m ) {
                    winHandle.explorer95( 'browse-save' );
                }},
                {'type': menu95Type.DIVIDER},
                {'group': true, 'id': 'browser-recent'},
                {'caption': 'Exit', 'callback': function( m ) {
                    winHandle.window95( 'close' );
                }}
            ]},
            {'caption': 'Edit', 'type': menu95Type.SUBMENU, 'items': [
                {'caption': 'Undo', 'callback': function( m ) {
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Cut', 'callback': function( m ) {
                }},
                {'caption': 'Copy', 'callback': function( m ) {
                }},
                {'caption': 'Paste', 'callback': function( m ) {
                }},
                {'caption': 'Delete', 'callback': function( m ) {
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Select All', 'callback': function( m ) {
                }},
                {'caption': 'Time/Date', 'callback': function( m ) {
                }},
                {'type': menu95Type.DIVIDER},
                {'caption': 'Word Wrap', 'callback': function( m ) {
                }}
            ]},
            {'text': 'View', 'children': [
            ]},
            {'text': 'Search', 'children': [
            ]},
            {'text': 'Help', 'children': [
            ]}
        ]
    };

    // Add the menu now, once winHande is defined, so callbacks above have it
    // in scope.
    winHandle.menu95( 'open', menu );

    winHandle.addClass( 'window-notepad' );

    // This window type still uses wrappers because the pseudo-elements are 
    // rather prone to yet-unexplainable misbehaviors.
    var wrapper = $('<div class="textarea-wrapper"></div>');
    winHandle.children( '.window-form' ).append( wrapper );

    var text = $('<textarea class="input-textarea"></textarea>');
    wrapper.append( text );

    winHandle.addClass( 'window-scroll-contents' );
    winHandle.removeClass( 'window-hidden' );

    if( null != settings.url ) {
        winHandle.notepad95( 'readurl', settings );
    } else if( null != settings.contents ) {
        winHandle.notepad95( 'readcontents', settings );
    }

    winHandle.window95( 'activate' );

    return winHandle;
}; }; }( jQuery ) );
