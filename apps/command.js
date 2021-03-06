
(function( $ ) {
$.fn.command95 = function( action, options, env ) {
'use strict';

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 14;

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
    'scrollbackEnabled': false,
    'fullScreen': false,
    'columns': 80,
    'rows': 20,
    'allowHTML': false,
}, options );

switch( action.toLowerCase() ) {

case 'getwidth':

    return this.width();

case 'draw-box':
    var rows = settings.h;
    var columns = settings.w;
    var left = settings.x;
    var top = settings.y;
    var right = columns + left - 1
    var bottom = rows + top - 1;

    for( var y = top ; top + rows > y ; y++ ) {
        for( var x = left ; left + columns > x ; x++ ) {
            if( top == y && left == x ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x2554;', 'allowHTML': true} );
            } else if( top == y && right == x ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x2557;', 'allowHTML': true} );
            } else if( bottom == y && right == x ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x255d;', 'allowHTML': true} );
            } else if( bottom == y && left == x ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x255a;', 'allowHTML': true} );
            } else if( top == y || bottom == y ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x2550;', 'allowHTML': true} );
            } else if( left == x || right == x ) {
                this.command95( 'putc-at', {'curX': x, 'curY': y, 'text': '&#x2551;', 'allowHTML': true} );
            }
        }
    }

    return this;

case 'reset':
    var cmdTable = this.find( 'tbody' );
    cmdTable.empty();
    var rows = this.env95( 'get-int', 'rows' );
    console.assert( NaN != rows );
    for( var y = 0 ; rows > y ; y++ ) {
        //settings.curY = y;
        this.command95( 'add-row' );
    }
    /* this.children( '.window-form' ).attr( 'data-cursor-pos-x', 0 );
    this.children( '.window-form' ).attr( 'data-cursor-pos-y', 0 ); */
    this.command95( 'cursor-x', {'curX': 0, 'curY': 0} );
    this.command95( 'cursor-y', {'curX': 0, 'curY': 0} );
    return this;

case 'add-row':
    var cmdTable = this.find( 'tbody' );
    var curY = this.find( '.prompt-row' ).length;
    var row = $('<tr class="prompt-row" data-text=""></tr>');
    row.attr( 'data-coord-y', curY.toString() );
    var columns = this.env95( 'get-int', 'columns' );
    for( var x = 0 ; columns > x ; x++ ) {
        var td = $('<td class="prompt-char prompt-char-empty">&nbsp;</td>');
        td.attr( 'data-coord-x', x.toString() );
        row.append( td );
    }
    cmdTable.append( row );
    return this;

case 'cell-at':
    return this.find( '[data-coord-y="' + settings.curY.toString() + '"] > ' +
        '[data-coord-x="'+ settings.curX.toString() + '"]' );

case 'putc-at':
    // Note that we do NOT add the char to the line's text attribute.
    var curCell = this.command95( 'cell-at', settings );
    if( settings.allowHTML ) {
        curCell.html( settings.text );
    } else {
        curCell.text( settings.text );
    }
    curCell.removeClass( 'prompt-char-empty' );
    return this;

case 'putc':
    console.assert( 1 == settings.text.length );
    var curCell = this.command95( 'cursor-cell' );
    curCell.removeClass( 'input-caret' );

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
        var curY = this.command95( 'cursor-y' );
        this.command95( 'putc-at', {'curX': curX, 'curY': curY, 'text': settings.text, 'allowHTML': settings.allowHTML} );
        if( settings.addToLine ) {
            curCell.parent().attr( 'data-text',
                curCell.parent().attr( 'data-text' ) + settings.text );
        }
        settings.curX = curX + 1;
        this.command95( 'cursor-x', settings );
    }

    curCell = this.command95( 'cursor-cell' );
    curCell.addClass( 'input-caret' );

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
    // Remove the caret from the current cell.
    var curCell = this.command95( 'cursor-cell' );
    curCell.removeClass( 'input-caret' );

    var curY = this.command95( 'cursor-y' );

    if( this.find( '.prompt-row' ).length - 1 <= curY ) {
        // Add a new row and scroll down to it.
        this.command95( 'add-row', settings );
        this.find( 'tbody' ).scrollTop( this.find( 'tbody' )[0].scrollHeight );

        if( !this.hasClass( 'window-scroll-contents' ) ) {
            // Roll the top rows out of the table and renumber remaining rows.
            this.find( '.prompt-row' ).first().remove();
            this.find( '.prompt-row' ).each( function() {
                var iterY = parseInt( $(this).attr( 'data-coord-y' ) ) - 1;
                $(this).attr( 'data-coord-y', iterY.toString() )
            } );

        } else {
            curY += 1;
        }
    } else {
        curY += 1;
    }

    // Enact the new cursor coordinates decided above.
    settings.curX = 0;
    settings.curY = curY;
    this.command95( 'cursor-x', settings );
    this.command95( 'cursor-y', settings );

    var curCell = this.command95( 'cursor-cell' );
    curCell.addClass( 'input-caret' );

    return this;

case 'resize':
    var newCols = Math.floor( this.outerWidth() / CHAR_WIDTH ) - 2;
    var newRows = Math.floor( this.outerHeight() / CHAR_HEIGHT ) - 2;

    this.env95( 'set', 'columns', newCols.toString() );
    this.env95( 'set', 'rows', newRows.toString() );

    this.command95( 'reset', settings );

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

    if( 0 >= $('#desktop').length ) {
        settings.fullScreen = true;
    }

    var winHandle = null;
    if(!settings.fullScreen ) {
        winHandle = this.window95( 'open', settings );
    } else {
        settings.scrollbackEnabled = false;
        winHandle = $('body');
        winHandle.append( '<form class="window-form"></form>' );
    }

    for( var key in env ) {
        winHandle.env95( 'set', key, env[key] );
    }

    winHandle.children( '.window-form' ).append( cmdWrapper );
    winHandle.children( '.window-form' ).append( cmdInput );

    if( settings.fullScreen ) {
        winHandle.command95( 'resize' );
    } else {
        winHandle.env95( 'set', 'columns', settings.columns );
        winHandle.env95( 'set', 'rows', settings.rows );
    }

    winHandle.command95( 'reset', settings );

    // Setup/display prompt.
    winHandle.command95( 'puts', {'text': winHandle.env95( 'get', 'prompt-text' ), 'addToLine': false} );
    
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
            var handlerName = winHandle.env95( 'get', 'line-handler' );
            if( handlerName in window ) {
                window[handlerName]( lineText, winHandle );
            }

        } else {
            var processCharHere = true;
            var charHandler = winHandle.env95( 'get', 'char-handler' );
            if( null != charHandler ) {
                processCharHere = window[charHandler]( lineText, winHandle );
            } 
            
            if( processCharHere ) {
                var keyIn = String.fromCharCode( e.keyCode );
                winHandle.command95( 'putc', {'text': keyIn} );
            }
            $(this).val( '' );
            
        }
    } );

    $(cmdInput).on( 'keydown', function( e ) {
        if( 8 == e.keyCode ) {
            // Backspace
            
            var curCell = winHandle.command95( 'cursor-cell' );
            var lineText = curCell.parent().attr( 'data-text' );

            var processCharHere = true;
            var charHandler = winHandle.env95( 'get', 'char-handler' );
            if( null != charHandler ) {
                processCharHere = window[charHandler]( lineText, winHandle );
            } 
            
            if( processCharHere && 0 < lineText.length ) {
                curCell.removeClass( 'input-caret' );

                var curX = winHandle.command95( 'cursor-x' ) - 1;
                var curY = winHandle.command95( 'cursor-y' );
                curCell = winHandle.command95( 'cell-at', {'curX': curX, 'curY': curY} );

                // Mark the current cell empty.
                curCell.html( '&nbsp;' );
                curCell.addClass( 'prompt-char-empty' );

                curCell.addClass( 'input-caret' );

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

    if( settings.scrollbackEnabled ) {
        winHandle.control95( 'scrollable', 'create', {'pane': cmd});
    }

    return winHandle;
}; }; }( jQuery ) );
