
(function( $ ) {
$.fn.command95 = function( action, options, env ) {
'use strict';

var settings = $.extend( {
    'caption': 'Prompt',
    'id': null,
    'resizable': true,
    'menu': null,
    'x': 10,
    'y': 10,
    'w': 480,
    'h': 260,
    'lineHandler': null,
    'text': '',
    'curX': null,
    'curY': null,
    'addToLine': true,
}, options );

switch( action.toLowerCase() ) {

case 'getwidth':

    return this.width();

case 'drawpx':

    return;

case 'reset':
    var cmdTable = this.find( 'tbody' );
    cmdTable.empty();
    var rows = this.env95( 'get-int', 'rows' );
    console.assert( NaN != rows );
    for( var y = 0 ; rows > y ; y++ ) {
        settings.curY = y;
        this.command95( 'add-row', settings );
    }
    return this;

case 'add-row':
    var cmdTable = this.find( 'tbody' );
    var curY = this.find( '.prompt-row' ).length;
    var row = $('<tr class="prompt-row" data-text=""></tr>');
    for( var x = 0 ; this.env95( 'get-int', 'columns' ) > x ; x++ ) {
        var td = $('<td class="prompt-char prompt-char-empty">X</td>');
        td.attr( 'data-coord-x-y', x.toString() + ',' + curY.toString() );
        row.append( td );
    }
    cmdTable.append( row );
    return this;

case 'cell-at':
    return this.find( '[data-coord-x-y="' + settings.curX.toString() + ',' + settings.curY.toString() + '"]' );

case 'putc':
    console.assert( 1 == settings.text.length );
    var curCell = this.command95( 'cursor-cell' );

    if( '\n' == settings.text ) {
        this.command95( 'newline' );
    } else if( '\t' == settings.text ) {
        var curX = this.command95( 'cursor-x' );

        var tabWidth = this.env95( 'get-int', 'tab-width' );
        var nearestX = (Math.ceil(curX / tabWidth) * tabWidth);
        if( nearestX < curX + 1 ) {
            nearestX += tabWidth;
        }

        console.assert( nearestX > curX );

        this.command95( 'cursor-x', {'curX': nearestX} );
    } else {
        var curX = this.command95( 'cursor-x' );
        curCell.text( settings.text );
        curCell.removeClass( 'prompt-char-empty' );
        if( settings.addToLine ) {
            curCell.parent().attr( 'data-text',
                curCell.parent().attr( 'data-text' ) + settings.text );
        }
        curCell.removeClass( '.input-caret' );
        settings.curX = curX + 1;
        this.command95( 'cursor-x', settings );
        curCell = this.command95( 'cursor-cell' );
        curCell.addClass( '.input-caret' );
    }
    return this;

case 'puts':

    for( var i = 0 ; settings.text.length > i ; i++ ) {
        var cSettings = $.extend( {}, settings );
        cSettings.text = settings.text.substring( i, i + 1 );
        this.command95( 'putc', cSettings );
    }

    return this;

case 'printf':

    for( var i = 0 ; settings.text.length > i ; i++ ) {
        var cSettings = $.extend( {}, settings );
        cSettings.text = settings.text.substring( i, i + 1 );
        this.command95( 'putc', settings );
    }

    return this;

case 'newline':
    /*
    return this.each( function( idx, winHandle ) {
        // Put the old line in the backbuffer.
        var line = $('<span class="input-line">' + settings.text + '</span>');
        var cmd = $(winHandle).children( '.window-form' );
        cmd = cmd.children( '.input-prompt' );
        cmd.children( '.backbuffer' ).append( line );
        cmd.children( '.backbuffer' ).append( '<br />' );
        cmd.scrollTop( cmd[0].scrollHeight );
    } );
    */

    var curY = this.command95( 'cursor-y' ) + 1;

    if( this.find( '.prompt-row' ).length <= curY ) {
        this.command95( 'add-row', settings );
    }

    settings.curX = 0;
    settings.curY = curY;
    this.command95( 'cursor-x', settings );
    this.command95( 'cursor-y', settings );

    this.find( 'tbody' ).scrollTop( this.find( 'tbody' )[0].scrollHeight );

    return this;

case 'cursor-x':
    if( null === settings.curX ) {
        return parseInt( this.children( '.window-form' ).attr( 'data-cursor-pos-x' ) );
    } else {
        this.children( '.window-form' ).attr( 'data-cursor-pos-x', settings.curX.toString() );
    }
    
case 'cursor-y':
    if( null === settings.curY ) {
        return parseInt( this.children( '.window-form' ).attr( 'data-cursor-pos-y' ) );
    } else {
        this.children( '.window-form' ).attr( 'data-cursor-pos-y', settings.curY.toString() );
    }

case 'cursor-cell':
    var curX = this.command95( 'cursor-x' );
    var curY = this.command95( 'cursor-y' );
    var curCell = this.command95( 'cell-at', {'curX': curX, 'curY': curY} );
    return curCell;

case 'open':

    // Create the command prompt.
    var cmdWrapper = $('<table class="input-prompt"><tbody></tbody></table>');

    // Hidden text field to gather input.
    var cmdInput = $('<input type="text" class="input-textarea" size="1" />');

    // Create the window or go full-screen.
    settings.icon = 'prompt';
    settings.resizable = false;
    settings.w = null;
    settings.h = null;
    var winHandle = null;
    if( 0 < $('#desktop').length || true == this.env95( 'get-bool', 'full-screen' ) ) {
        winHandle = this.window95( 'open', settings );
    } else {
        winHandle = $('body');
        winHandle.append( '<form class="window-form"></form>' );
    }

    for( var key in env ) {
        winHandle.env95( 'set', key, env[key] );
    }

    winHandle.children( '.window-form' ).append( cmdWrapper );
    winHandle.children( '.window-form' ).append( cmdInput );
    winHandle.children( '.window-form' ).attr( 'data-cursor-pos-x', 0 );
    winHandle.children( '.window-form' ).attr( 'data-cursor-pos-y', 0 );

    winHandle.command95( 'reset', settings );

    // Setup/display prompt.
    // TODO: Get rid of this and have handler launch once, probably...
    if( null != winHandle.env95( 'get', 'prompt-text' ) ) {
        winHandle.command95( 'puts', {'text': winHandle.env95( 'get', 'prompt-text' ), 'addToLine': false} );
    }

    winHandle.click( function() {
        $(cmdInput).focus();
    } );

    // Handle line input.
    $(cmdInput).on( 'keypress', function( e ) {
        if( 13 == e.keyCode ) {
            // Enter was pressed.
            e.preventDefault();

            // Process line input.
            var curCell = winHandle.command95( 'cursor-cell', settings );
            var lineText = curCell.parent().attr( 'data-text' );
            winHandle.command95( 'newline' );
            if( null != settings.lineHandler ) {
                window[settings.lineHandler]( lineText, env, winHandle );
            }

            // Print the prompt.
            var promptText = winHandle.env95( 'get', 'prompt-text' );
            if( null != promptText ) {
                winHandle.command95( 'puts', {'text': promptText, 'addToLine': false} );
            }

        } else {
            var keyIn = String.fromCharCode( e.keyCode );
            var curX = winHandle.command95( 'cursor-x' );
            winHandle.command95( 'putc', {'text': keyIn} );
            $(this).val( '' );
            
        }
    } );

    $(cmdInput).on( 'keydown', function( e ) {
        if( 8 == e.keyCode ) {
            // Backspace
            
            var curCell = winHandle.command95( 'cursor-cell' );
            var lineText = curCell.parent().attr( 'data-text' );

            if( 0 < lineText.length ) {
                var curX = winHandle.command95( 'cursor-x' ) - 1;
                var curY = winHandle.command95( 'cursor-y' );
                curCell = winHandle.command95( 'cell-at', {'curX': curX, 'curY': curY} );

                // Mark the current cell empty.
                curCell.text( 'X' );
                curCell.addClass( 'prompt-char-empty' );

                winHandle.command95( 'cursor-x', {'curX': curX} );
                    
                curCell.parent().attr( 'data-text', lineText.substring( 0, lineText.length - 1 ) );

            }
        }
    } );

    winHandle.on( 'activate', function( e ) {
        $(cmdInput).focus();
    } );

    winHandle.addClass( 'window-command' );
    winHandle.removeClass( 'window-hidden' );
    winHandle.window95( 'activate' );

    var cmd = cmdWrapper.children( 'tbody' );
    var cWidth = cmd.width();
    var cHeight = cmd.height();
    cmd.css( 'width', cWidth.toString() + 'px' );
    cmd.css( 'height', cHeight.toString() + 'px' );
    winHandle.control95( 'scrollable', 'create', {'pane': cmd})

    return winHandle;
}; }; }( jQuery ) );
