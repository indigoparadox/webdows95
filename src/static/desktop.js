
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
                    'start menu': {
                        'type': desktop95Types.FOLDER,
                        'children': {
                            'programs': {
                                'type': desktop95Types.FOLDER,
                                'children': {
                                    'Accessories': {
                                        'type': desktop95Types.FOLDER,
                                        'children': {
                                            'Internet Tools': {
                                                'type': desktop95Types.FOLDER,
                                                'children': {
                                                    'Browser': {
                                                        'archiveEnd':'19991200000000',
                                                        'archiveStart':'19990100000000',
                                                        'type': 'browser',
                                                    },
                                                }
                                            },
                                            'Multimedia': {
                                                'type': desktop95Types.FOLDER,
                                                'children': {
                                                    'CD Player': {
                                                        'type': 'cdplayer',
                                                        'playlist': [
                                                            {
                                                                'url': 'finalizing.mp3',
                                                                'artist': '</body>',
                                                                'album': 'Initializing...',
                                                                'title': 'Finalizing...'
                                                            }
                                                        ]
                                                    },
                                                }
                                            },
                                            'Notepad':{
                                                'type':'notepad'
                                            },
                                            'WordPad':{
                                                'type':'wordpad'
                                            },
                                        }
                                    }
                                }
                            }
                        },
                    },
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
        'icon': 'computer',
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID } );
            populateFolder( winFolder, fs );
        }
    },
    'drive': {
        'icon': 'drive',
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID } );
            populateFolder( winFolder, e.data );
        }
    },
    'folder': {
        'icon': 'folder',
        'opener': function( e ) {
            var winFolder = $('#desktop').explorer95( 'open', { 'caption': e.data.name, 'id': e.data.winID } );
            populateFolder( winFolder, e.data );
        }
    },
    'notepad': {
        'icon': 'notepad',
        'iconDoc': 'txt',
        'opener': function( e ) {
            var winText = $('#desktop').notepad95( 'open', { 'id': e.data.winID } );
            winText.notepad95( 'readContents', { 'contents': e.data.contents } );
        }
    },
    'wordpad': {
        'icon': 'wordpad',
        'iconDoc': 'rtf',
        'opener': function( e ) {
            var winText = $('#desktop').wordpad95( 'open', { 'id': e.data.winID, 'x': 20, 'y': 20, 'w': 600, 'h': 400, 'url': e.data.url } );
            //winText.wordpad95( 'readURL', { 'url': e.data.url } );
        }
    },
    'prompt': {
        'icon': 'prompt',
        'opener': function( e ) {
            var winPrompt = $('#desktop').prompt95( 'open', {
                'id': e.data.winID, 'promptText': e.data.prompt,
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
                        winHandle.prompt95( 'enter', {'text': 'Volume in drive C is WEBDOWS95'} );
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
        'icon': 'browser',
        'opener': function( e ) {
            var winFolder = $('#desktop').browser95( 'open', { 'id': e.data.winID, 'url': 'http://google.com' } );
        }
    },
    'cdplayer': {
        'icon': 'cdplayer',
        'opener': function( e ) {
            var winPrompt = $('#desktop').cdplayer95( 'open', { 'id': e.data.winID, 'playlist': e.data.playlist } );
        }
    },
    'video': {
        'icon': 'avi',
        'iconDoc': 'avi',
        'opener': function( e ) {
            var winPrompt = $('#desktop').mpvideo95( 'open', { 'id': e.data.winID, 'ytube': e.data.ytube, 'w': 300, 'h': 275 } );
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

        if( defIconY >= $(container).height() - 70 ) {
            defIconY = 20;
            defIconX += 70;
        }

        if( !('iconX' in itemData) ) {
            itemData.iconX = defIconX;
        }
        if( !('iconY' in itemData) ) {
            itemData.iconY = defIconY;
            defIconY += 70;
        }

        // Handle nesting in IDs.
        //var folderIconId = 'i-' + $(parentWinHandle).attr( 'id' ) + '-' + _htmlStrToClass( itemName );
        var folderWindowId = 'w-' + $(parentWinHandle).attr( 'id' ) + '-' + _htmlStrToClass( itemName );

        var container = $(parentWinHandle).find( '.container' );
        if( 0 == container.length ) {
            container = $(parentWinHandle);
        }

        var icon = createAssocIcon(
            itemName, itemData,
            folderWindowId );
        container.explorer95( 'icon', icon );
    }
}

function createAssocIcon( itemName, itemData, WindowID=null ) {

    //console.assert( $(container).length == 1 );
    
    var noCache = Math.random().toString( 36 ).substring( 2, 15 ) + 
        Math.random().toString( 36 ).substring( 2, 15 );

    itemData.name = itemName;
    itemData.winID = WindowID;

    if( itemData.type in associations ) {
        return { 'caption': itemName,
            'icoImg': associations[itemData.type].iconImg,
            'icoX': associations[itemData.type].iconX,
            'icoY': associations[itemData.type].iconY,
            'iconImg16': associations[itemData.type].iconImg16,
            'iconX16': associations[itemData.type].iconX16,
            'iconY16': associations[itemData.type].iconY16,
            'icon': associations[itemData.type].icon,
            'x': itemData.iconX, 'y': itemData.iconY,
            'callback': associations[itemData.type].opener,
            'cbData': itemData };
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
    $('.button-start').on( 'menu', function( e, menuElement, settings ) { 
        if( !settings.path.startsWith( '/Programs' ) ) {
            return;
        }

        var menuPath = settings.path.split( '/' );
        menuPath.shift(); // Remove root.
        menuPath.shift(); // Remove Programs.

        // Drill down to the submenu subfolder.
        var start_menu_progs = fs.children['c:'].children['windows'].children['start menu'].children['programs'];
        while( 0 < menuPath.length ) {
            var nextFolder = menuPath.shift();
            start_menu_progs = start_menu_progs.children[nextFolder];
        }

        settings.items = [];
        
        // Build the menu from items in the folder.
        for( itemName in start_menu_progs.children ) {
            var itemData = start_menu_progs.children[itemName];
            if( desktop95Types.FOLDER == itemData.type ) {
                settings.items.push( {'caption': itemName, 'type': menu95Type.EVENTMENU, 'icon': 'programs'} );
            } else {
                var icon = createAssocIcon( itemName, itemData );
                icon.type = menu95Type.ITEM;
                settings.items.push( icon );
            }
        }

        $('#desktop').menu95( 'open', settings );
    } );

    $('.tray.notification-area').systray95( 'enable' );
} );
