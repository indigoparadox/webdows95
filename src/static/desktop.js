
var associations = {
    'folder': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 288,
        'opener': function( e ) {
            /* Only open the window if it's not already open. */
            if( 0 >= $('#' + e.data.winID).length ) {
                var winFolder = windowOpenFolder( e.data.name, e.data.winID, 'icons-w95-16x16.png', 112, 144 );
                winFolder.data( 'folder-path', e.data.parentPath + '/' + e.data.name );
            }
            windowActivate( '#desktop', '#' + e.data.winID );
            populateFolder( '#' + e.data.winID );
        }
    },
    'notepad': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 864,
        'iconY': 544,
        'opener': function( e ) {
        }
    }
};

function populateFolder( parentWinHandle ) {
    var folderPath = $(parentWinHandle).data( 'folder-path' );

    $(parentWinHandle).children( '.icon' ).remove();
    $(parentWinHandle).children( '.window-form' ).children( '.container' ).children( '.icon' ).remove();

    var noCache = Math.random().toString( 36 ).substring( 2, 15 ) + 
        Math.random().toString( 36 ).substring( 2, 15 );

    /* Get a list of icons in the requested folder. */
    $.get( '/ajax/folders/' + folderPath + '?nc=' + noCache, function( data ) {
        for( var iconIter in data.children ) {
            folderData = data.children[iconIter];

            // TODO: Handle nesting in IDs.
            var folderIconId = 'icon-' + iconIter.replace( / /g, '-' );
            var folderWindowId = 'window-' + iconIter.replace( / /g, '-' );

            var container = $(parentWinHandle).find( '.container' );
            if( 'desktop' == data.type ) {
                container = '#desktop';
            }

            createAssocIcon(
                container, folderPath, iconIter,
                folderIconId, folderWindowId,
                folderData.iconX, folderData.iconY );
        }
    } );
}

function createAssocIcon( container, parentPath, name, iconID, winID, x, y ) {

    console.assert( $(container).length == 1 );
    
    var noCache = Math.random().toString( 36 ).substring( 2, 15 ) + 
        Math.random().toString( 36 ).substring( 2, 15 );

    /* Get more information on the icon requested individually. */
    $.get( '/ajax/folders/' + parentPath + '/' + name + '?nc=' + noCache, function( data ) {
        var iconData = {
            'name': name,
            'parentPath': parentPath,
            'winID': winID,
        };
    
        if( data.type in associations ) {
            var icon = desktopCreateIcon(
                name,
                associations[data.type].iconImg,
                associations[data.type].iconX,
                associations[data.type].iconY,
                x, y, associations[data.type].opener, container, iconData );
        }
    } );
}

$(document).ready( function() {
    //var win_folder = windowOpenFolder( 'Foo', 'foo', 'icons-w95-16x16.png', 112, 144 );
    /*desktopCreateIcon( "Test.txt", 'icons-w95-32x32.png', 800, 544, 10, 10, function() {

    }, win_folder.find( '.container' ) );*/

    /*
    var ico_foo = desktopCreateIcon( "Foo", 'icons-w95-32x32.png', 800, 544, 10, 10, function() {
        // Only open the window if it's not already open.
        if( 0 >= $('#window-foo').length ) {
            var win_foo = windowOpen( 'Foo', 'window-foo', true, 'icons-w95-16x16.png', 400, 272 );
            var input_txt = windowCreateInputText( win_foo, 'Date', '', '10px', '10px' );
        }
    } );
    */
    
   populateFolder( '#desktop' );

    //var win_cmd = windowOpenCommand( 'Command', 'cmd', 'icons-w95-16x16.png', 128, 256 );

    /*
    var win_props = windowOpenProperties( 'Properties', 'props' );
    var tab_general = windowPropertiesAddTab( win_props, "General" );
    tab_general.append( '<p>This is the general tab.</p>', 'tab-general' );
    var tab_other = windowPropertiesAddTab( win_props, "Other", 'tab-other' );
    tab_other.append( '<p>This is the other tab.</p>' );
    win_props.find( '.window-properties-tabs' ).tabs();
    */

    $('#desktop').mousedown( function( e ) {
        if( $(e.target).hasClass( 'container' ) ) {
            desktopSelectIcon( e.target, null );
        }
        menuClose( e.target, null );
    } );

    $('#desktop').contextmenu( function( e ) {
        e.preventDefault();

        if( 
            $(e.target).parents().hasClass( 'menu' ) ||
            $(e.target).parents().hasClass( 'window' )
        ) {
            /* Don't call menus on menus. */
            return;
        }

        var menu = menuPopup( '#desktop', [
            {'text': 'Arrange Icons', 'children': [
                {'text': 'By name', 'callback': function( m ) {
                }}
            ]},
            {'divider': true},
            {'text': 'Properties', 'callback': function( m ) {
            }}
        ], e.pageX, e.pageY );
    } );
} );
