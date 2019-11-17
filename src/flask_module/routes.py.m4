
import logging
ifelse(do_sqlalchemy, `enabled', `from .database import db_session', `dnl')
divert(-1)
changequote(`[', `]')

define([sqlteardown], [
@current_app.teardown_appcontext
def shutdown_session( exception=None ):
    db_session.remove()
])

changequote([`], ['])
define(`roota', `$1_root')
divert(0)
@app.route( '/' )
def roota(ghtmptmp)():
    return render_template( 'menu.html' )

