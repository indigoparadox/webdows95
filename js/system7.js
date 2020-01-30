
function boot() {

    console.log( fs );

    var smCaller = {
        'type': 'shortcut',
        'exec': 'macintosh hd\\system folder\\finder.js',
        'icon': 'start',
    };
    loadExe( 'macintosh hd\\system folder\\finder.js', '', smCaller );
}
