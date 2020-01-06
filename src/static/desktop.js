
var desktop = {"children":{
    "A Folder":{
        "children":{
            "A Text File":{
                "contents":"This is a text file.",
                "iconX":10,
                "iconY":10,
                "type":"notepad"}},
            "iconX":20,
            "iconY":20,
            "type":"folder"},
    "Browser":{
        "archiveEnd":"19991200000000",
        "archiveStart":"19990100000000",
        "iconX":20,
        "iconY":140,
        "type":"browser"},
    "Prompt":{
        "iconX":20,
        "iconY":80,
        "prompt":"C:\\>",
        "type":"prompt"}},
"type":"desktop"};

var associations = {
    'folder': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 288,
        'opener': function( e ) {
            var winFolder = windowOpenFolder( e.data.name, e.data.winID, 'icons-w95-16x16.png', 112, 144 );
            populateFolder( '#' + e.data.winID, e.data.name, e.data.data.children );
        }
    },
    'notepad': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 864,
        'iconY': 544,
        'opener': function( e ) {
        }
    },
    'prompt': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 512,
        'opener': function( e ) {
            var winPrompt = windowOpenCommand( e.data.name, e.data.winID, 'icons-w95-16x16.png', 128, 256, null, e.data.prompt );
        }
    },
    'browser': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 96,
        'iconY': 736,
        'opener': function( e ) {
            var winFolder = windowOpenBrowser( 'Browser', 'browser', 'icons-w95-16x16.png', 64, 368, 'http://google.com' );
        }
    }
};

function populateFolder( parentWinHandle, folderName, folderItems ) {
    //var folderPath = $(parentWinHandle).data( 'folder-path' );

    // Clear out containers before we start.
    $(parentWinHandle).children( '.icon' ).remove();
    $(parentWinHandle).children( '.window-form' ).children( '.container' ).children( '.icon' ).remove();

    // Build/extend folder path.
    /*
    if( null == folderPath ) {
        folderPath = folderName;
    } else {
        folderPath = folderPath + '/' + folderName;
    }
    */

    /* Get a list of icons in the requested folder. */
    for( var itemName in folderItems ) {
        itemData = folderItems[itemName];

        // TODO: Handle nesting in IDs.
        var folderIconId = 'icon-' + itemName.replace( / /g, '-' );
        var folderWindowId = 'window-' + itemName.replace( / /g, '-' );

        var container = $(parentWinHandle).find( '.container' );
        if( 0 == container.length ) {
            container = $(parentWinHandle);
        }

        createAssocIcon(
            container, itemName, itemData,
            folderIconId, folderWindowId );
    }
}

function createAssocIcon( container, itemName, itemData, iconID, WindowID ) {

    console.assert( $(container).length == 1 );
    
    var noCache = Math.random().toString( 36 ).substring( 2, 15 ) + 
        Math.random().toString( 36 ).substring( 2, 15 );

    /* Get more information on the icon requested individually. */
    var prompt = null;
    if( 'prompt' in itemData ) {
        prompt = itemData.prompt;
    }

    var iconData = {
        'name': itemName,
        'data': itemData,
        'winID': WindowID,
        'prompt': prompt
    };

    if( itemData.type in associations ) {
        var icon = desktopCreateIcon(
            itemName,
            associations[itemData.type].iconImg,
            associations[itemData.type].iconX,
            associations[itemData.type].iconY,
            itemData.iconX, itemData.iconY,
            associations[itemData.type].opener,
            container,
            iconData );
    }
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
    
   populateFolder( '#desktop', desktop, desktop.children );

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
