
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

    console.log( winHandle );

    winHandle.env95( 'set', 'line-handler', 'editLineHandler' );
    winHandle.env95( 'set', 'char-handler', 'editCharHandler' );
    winHandle.command95( 'reset' );
    var columns =  winHandle.env95( 'get-int', 'columns' );
    var rows =  winHandle.env95( 'get-int', 'rows' );

    winHandle.command95( 'draw-box', {'x': 0, 'y': 0, 'w': columns, 'h': rows})

    break;

}; }; }( jQuery ) );