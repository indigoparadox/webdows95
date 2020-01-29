
function boot() {
    var windowMenu = {
        'type': menu95Type.MENUBAR,
        'caller': $('#desktop'),
        'container': $('#desktop'),
        'location': menu95Location.BOTTOM,
        'items': [
            {
                'caption': 'File', 
                'type': menu95Type.SUBMENU,
                'items': [
                    {'caption': 'New Folder'}
                ]
            },
            {
                'caption': 'Special',
                'type': menu95Type.SUBMENU,
                'items': [
                    {'caption': 'Shut Down'}
                ]   
            },
        ]
    };
    $('#desktop').menu95( 'open', windowMenu );

    console.log( fs );

    var smCaller = {
        'type': 'shortcut',
        'exec': 'macintosh hd\\system folder\\finder.js',
        'icon': 'start',
    };
    loadExe( 'macintosh hd\\system folder\\finder.js', '', smCaller );
}
