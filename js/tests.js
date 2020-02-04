QUnit.test( "Resolving path returns object.", function( assert ) {
    var winDir = resolvePath( 'c:\\windows' );
    assert.ok( 'object' == typeof( winDir ), "Response is object." );
    assert.ok( desktop95Types.FOLDER == winDir.type, "Folder type found." );
} );

QUnit.test( "Resolved shortcut returns original object.", function( assert ) {
    var cdPlayer = resolveItem( 'c:\\windows\\desktop\\CD Player' );
    console.log( cdPlayer );
    assert.ok( desktop95Types.EXECUTABLE == cdPlayer.type, "Executable type found." );
    assert.ok( 'string' == typeof( cdPlayer.src ), "Executable has source." );
    assert.ok( 'playlist' in cdPlayer.args, "Args contains playlist." );
    assert.ok( 'c:\\windows' == cdPlayer.env['working-path'], "Env contains correct working directory." );
} );