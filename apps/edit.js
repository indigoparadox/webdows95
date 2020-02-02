
(function( $ ) {

function editLineHandler( text, env ) {
    return false;
};

function editCharHandler( text, env ) {
    return false;
};

$.fn.edit95 = function( action, options, env ) {
'use strict';

var settings = $.extend( {
    'caption': 'Edit',
}, options );

switch( action.toLowerCase() ) {

case 'open':
    var winHandle = null;
    if( 'window-parent' in env ) {
        winHandle = env['window-parent'];
    } else {
        // TODO: Open command and use its window.
        //winHandle = 
    }

    winHandle.env95( 'set', 'line-handler', 'editLineHandler' );
    winHandle.env95( 'set', 'char-handler', 'editCharHandler' );
    winHandle.command95( 'reset' );
    var columns =  winHandle.env95( 'get-int', 'columns' );
    var rows =  winHandle.env95( 'get-int', 'rows' );
    for( var y = 0 ; rows > y ; y++ ) {
        for( var x = 0 ; columns > x ; x++ ) {
            if( 0 == y || rows - 1 == y ) {
                winHandle.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '-'} );
            } else if( 0 == x || columns - 1 == x ) {
                winHandle.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '|'} );
            }
        }
    }

    break;

}; }; }( jQuery ) );