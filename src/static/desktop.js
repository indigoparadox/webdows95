
var desktop = {'children':{
    'A Folder':{
        'children':{
            'A Text File':{
                'contents':'This is a text file.',
                'iconX':10,
                'iconY':10,
                'type':'notepad'}},
        'iconX':20,
        'iconY':20,
        'type':'folder'},
    'Browser':{
        'archiveEnd':'19991200000000',
        'archiveStart':'19990100000000',
        'iconX':20,
        'iconY':140,
        'type':'browser'},
    'Prompt':{
        'iconX':20,
        'iconY':80,
        'prompt':'C:\\>',
        'type':'prompt'},
    'CD Player':{
        'iconX':20,
        'iconY':200,
        'type': 'cdplayer',
        'playlist': [
            {
                'url': 'finalizing.mp3',
                'artist': '</body>',
                'album': 'Initializing...',
                'title': 'Finalizing...'
            }
        ]},
    'VGuide.avi':{
        'ytube': 'fXpfdq3WYu4',
        'iconX':20,
        'iconY':260,
        'type':'video'},
    'ReadMe.rtf':{
        'url':'README.md',
        'iconX':20,
        'iconY':320,
        'type':'wordpad'}},
'type':'desktop'};

var associations = {
    'folder': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 288,
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 112, 'icoY': 144 } );
            populateFolder( winFolder, e.data.name, e.data.children );
        }
    },
    'notepad': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 864,
        'iconY': 544,
        'opener': function( e ) {
            var winText = $('#desktop').notepad95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 480, 'icoY': 272 } );
            winText.notepad95( 'readContents', { 'contents': e.data.contents } );
        }
    },
    'wordpad': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 608,
        'iconY': 896,
        'opener': function( e ) {
            var buttonImgs = {
                'new': {'icoImg': 'icons-w95-16x16.png', 'icoX': 32, 'icoY': 48 },
                'open': {'icoImg': 'icons-w95-16x16.png', 'icoX': 48, 'icoY': 128 },
                'print': {'icoImg': 'icons-w95-16x16.png', 'icoX': 64, 'icoY': 128 },
                'cut': {'icoImg': 'icons-w95-16x16.png', 'icoX': 176, 'icoY': 128 },
                'copy': {'icoImg': 'icons-w95-16x16.png', 'icoX': 192, 'icoY': 128 },
                'paste': {'icoImg': 'icons-w95-16x16.png', 'icoX': 208, 'icoY': 128 },
                'preview': {'icoImg': 'icons-w95-16x16.png', 'icoX': 240, 'icoY': 128 },
                'search': {'icoImg': 'icons-w95-16x16.png', 'icoX': 256, 'icoY': 128 },
                'dateTime': {'icoImg': 'icons-w95-16x16.png', 'icoX': 128, 'icoY': 144 },
                'undo': {'icoImg': 'icons-w95-16x16.png', 'icoX': 144, 'icoY': 144 },
            };
            var winText = $('#desktop').wordpad95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 320, 'icoY': 448, 'x': 20, 'y': 20, 'w': 640, 'h': 480, 'buttonImgs': buttonImgs } );
            winText.wordpad95( 'readURL', { 'url': e.data.url } );
        }
    },
    'prompt': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 512,
        'opener': function( e ) {
            var winPrompt = $('#desktop').prompt95( 'open', {
                'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 128, 'icoY': 256, 'promptText': e.data.prompt,
                'lineHandler': function( data, winHandle ) {
                    winHandle.prompt95( 'enter', { 'text': 'Sad command or file name' } )
                } } );
        }
    },
    'browser': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 96,
        'iconY': 736,
        'opener': function( e ) {
            var buttonImgs = {
                'open': {'icoImg': 'icons-w95-16x16.png', 'icoX': 48, 'icoY': 128 },
                'print': {'icoImg': 'icons-w95-16x16.png', 'icoX': 64, 'icoY': 128 },
                'refresh': {'icoImg': 'icons-w95-16x16.png', 'icoX': 112, 'icoY': 128 },
                'stop': {'icoImg': 'icons-w95-16x16.png', 'icoX': 128, 'icoY': 128 },
                'mail': {'icoImg': 'icons-w95-16x16.png', 'icoX': 80, 'icoY': 128 },
                'home': {'icoImg': 'icons-w95-16x16.png', 'icoX': 96, 'icoY': 128 }
            };
            var winFolder = $('#desktop').browser95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 64, 'icoY': 368, 'url': 'http://google.com', 'buttonImgs': buttonImgs } );
        }
    },
    'cdplayer': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 480,
        'iconY': 512,
        'opener': function( e ) {
            var winPrompt = $('#desktop').cdplayer95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 256, 'icoY': 256, 'playlist': e.data.playlist } );
        }
    },
    'video': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 672,
        'iconY': 640,
        'opener': function( e ) {
            var winPrompt = $('#desktop').mpvideo95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 352, 'icoY': 320, 'ytube': e.data.ytube, 'w': 300, 'h': 275 } );
        }
    }
};

function populateFolder( parentWinHandle, folderName, folderItems ) {
    //var folderPath = $(parentWinHandle).data( 'folder-path' );

    // Clear out containers before we start.
    $(parentWinHandle).children( '.icon' ).remove();
    $(parentWinHandle).children( '.window-form' ).children( '.container' ).children( '.icon' ).remove();

    // Get a list of icons in the requested folder.
    for( var itemName in folderItems ) {
        itemData = folderItems[itemName];

        // Handle nesting in IDs.
        var folderIconId = 'i-' + $(parentWinHandle).attr( 'id' ) + '-' + _htmlStrToClass( itemName );
        var folderWindowId = 'w-' + $(parentWinHandle).attr( 'id' ) + '-' + _htmlStrToClass( itemName );

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
    /*var prompt = null;
    if( 'prompt' in itemData ) {
        prompt = itemData.prompt;
    }

    var contents = null;
    if( 'contents' in itemData ) {
        contents = itemData.contents;
    }

    var playlist = null;
    if( 'playlist' in itemData ) {
        playlist = itemData.playlist;
    }

    var url = null;
    if( 'url' in itemData ) {
        url = itemData.url;
    }

    var iconData = {
        'name': itemName,
        'data': itemData,
        'winID': WindowID,
        'prompt': prompt,
        'contents': contents,
        'playlist': playlist,
        'url': url
    };*/

    itemData.name = itemName;
    itemData.winID = WindowID;

    if( itemData.type in associations ) {
        var icon = container.explorer95( 'icon',
            { 'caption': itemName,
            'icoImg': associations[itemData.type].iconImg,
            'icoX': associations[itemData.type].iconX,
            'icoY': associations[itemData.type].iconY,
            'x': itemData.iconX, 'y': itemData.iconY,
            'callback': associations[itemData.type].opener,
            'cbData': itemData } );
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
            $(e.target).explorer95( 'select' );
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
            {'text': 'Paste', 'callback': function( m ) {
            }},
            {'divider': true},
            {'text': 'New', 'children': [
                {'text': 'Folder', 'callback': function( m ) {
                }}
            ]},
            {'divider': true},
            {'text': 'Properties', 'callback': function( m ) {
                var props = $('#desktop').window95( 'properties', { 'caption': 'Display Properties', 'id': 'w-props-display' } );
                props.control95( 'tab', 'create', { 'caption': 'Background', 'id': 't-display-background', 'parentClass': 'window-properties-tabs' } );
                props.control95( 'tab', 'create', { 'caption': 'Screen Saver', 'id': 't-display-screensaver', 'parentClass': 'window-properties-tabs' } );
                props.control95( 'tab', 'create', { 'caption': 'Appearance', 'id': 't-display-appearance', 'parentClass': 'window-properties-tabs' } );
                props.control95( 'tab', 'create', { 'caption': 'Settings', 'id': 't-display-settings', 'parentClass': 'window-properties-tabs' } );
                props.find( '.window-properties-tabs' ).tabs();
            }}
        ], e.pageX, e.pageY );
    } );
} );
