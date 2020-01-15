
const desktop95Types = {
    'DRIVE': 'drive',
    'FOLDER': 'folder',
    'COMPUTER': 'computer',
};

var fs = null;

var skel = {
'type': desktop95Types.COMPUTER,
'children':{
    'c:': {
        'type': desktop95Types.DRIVE,
        'overlay': null,
        'children': {
            'windows': {
                'type': desktop95Types.FOLDER,
                'children': {
                    'desktop': {
                        'type': desktop95Types.FOLDER,
                        'children': {
                            'My Computer':{
                                'type':'computer'},
                            'A Folder':{
                                'children':{
                                    'A Text File':{
                                        'contents':'This is a text file.',
                                        'type':'notepad'}},
                                'type':desktop95Types.FOLDER},
                            'Browser':{
                                'archiveEnd':'19991200000000',
                                'archiveStart':'19990100000000',
                                'type':'browser'},
                            'Prompt':{
                                'prompt':'C:\\>',
                                'type':'prompt'},
                            'CD Player':{
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
                                'type':'video'},
                            'ReadMe.rtf':{
                                'url':'README.md',
                                'type':'wordpad'}
                        },
                    }
                
                }
            }
        }
    }
} };

var associations = {
    'computer': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 736,
        'iconY': 512,
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 384, 'icoY': 256 } );
            populateFolder( winFolder, fs );
        }
    },
    'drive': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 544,
        'iconY': 224,
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 288, 'icoY': 112 } );
            populateFolder( winFolder, e.data );
        }
    },
    'folder': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 288,
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 112, 'icoY': 144 } );
            populateFolder( winFolder, e.data );
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
            var winText = $('#desktop').wordpad95( 'open', { 'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 320, 'icoY': 448, 'x': 20, 'y': 20, 'w': 600, 'h': 400, 'buttonImgs': buttonImgs, 'url': e.data.url } );
            //winText.wordpad95( 'readURL', { 'url': e.data.url } );
        }
    },
    'prompt': {
        'iconImg': 'icons-w95-32x32.png',
        'iconX': 256,
        'iconY': 512,
        'opener': function( e ) {
            var winPrompt = $('#desktop').prompt95( 'open', {
                'id': e.data.winID, 'icoImg': 'icons-w95-16x16.png', 'icoX': 128, 'icoY': 256, 'promptText': e.data.prompt,
                'lineHandler': function( data, text, winHandle ) {
                    var cMatch;
                    if( null != (cMatch = text.match( /^cd (.*)/i )) ) {
                        // CD command
                        if( 
                            'children' in winPrompt.data( 'folder' ) &&
                            cMatch[1] in winPrompt.data( 'folder' ).children
                        ) {
                            winPrompt.data( 'folder-parent', winPrompt.data( 'folder' ) );
                            winPrompt.data( 'folder-parent-path', winPrompt.data( 'folder-path' ) );
                            winPrompt.data( 'folder', winPrompt.data( 'folder' ).children[cMatch[1]] );
                            winPrompt.data( 'folder-path',  winPrompt.data( 'folder-path' ) + '\\' + cMatch[1] );
                        } else {
                            winHandle.prompt95( 'enter', {'text': 'Invalid directory'} );
                        }
                    } else if( null != (cMatch = text.match( /^dir ?(.*)?/i )) ) {
                        // DIR command
                        // TODO: Targeted DIR
                        winHandle.prompt95( 'enter', {'text': 'Volume in drive C is WEBDOW95'} );
                        winHandle.prompt95( 'enter', {'text': 'Volume Serial Number is DEAD-BEEF'} );
                        winHandle.prompt95( 'enter', {'text': 'Directory of ' + winPrompt.data( 'folder-path' )} );
                        winHandle.prompt95( 'enter', {'text': ''} );
                        var fileCt = 0;
                        for( filename in winPrompt.data( 'folder' ).children ) {
                            var filedata = winPrompt.data( 'folder' ).children[filename];
                            if( desktop95Types.FOLDER == filedata.type ) {
                                winHandle.prompt95( 'enter', {'text': filename.toUpperCase() + '\t' + '&lt;DIR&gt;\t01-01-95\t04:20a'} );
                            } else {
                                winHandle.prompt95( 'enter', {'text': filename.toUpperCase()} );
                            }
                            fileCt += 1;
                        }
                        winHandle.prompt95( 'enter', {'text': fileCt.toString() + ' file(s)\t0 bytes'} );
                        winHandle.prompt95( 'enter', {'text': '0 bytes free'} );
                        winHandle.prompt95( 'enter', {'text': ''} );
                    } else {
                        winHandle.prompt95( 'enter', {'text': 'Sad command or file name'} )
                    }
                } } );
            winPrompt.data( 'folder', fs.children['c:'] );
            winPrompt.data( 'folder-path', 'c:' );
            winPrompt.data( 'folder-parent', fs.children['c:'] );
            winPrompt.data( 'folder-parent-path', 'c:' );
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

function populateFolder( parentWinHandle, folder ) {

    // Clear out containers before we start.
    $(parentWinHandle).children( '.icon' ).remove();
    $(parentWinHandle).children( '.window-form' ).children( '.container' ).children( '.icon' ).remove();

    var defIconX = 20;
    var defIconY = 20;

    // Get a list of icons in the requested folder.
    for( var itemName in folder.children ) {
        itemData = folder.children[itemName];

        if( !('iconX' in itemData) ) {
            itemData.iconX = defIconX;
        }
        if( !('iconY' in itemData) ) {
            itemData.iconY = defIconY;
            defIconY += 80;
        }

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
    
    fs = JSON.parse( localStorage.getItem( 'fs' ) );
    if( null == fs ) {
        fs = skel;
    }

    populateFolder( '#desktop', fs.children['c:'].children['windows'].children['desktop'] );

    $('#desktop').desktop95( 'enable' );

    $('.button-start').startmenu95( 'enable' );

    $('.tray.notification-area').systray95( 'enable' );
} );
