
import logging
ifelse(do_sqlalchemy, `enabled', `from .database import db_session', `dnl')
ifelse(do_sqlalchemy, `enabled', `', `dnl')
ifelse(do_sqlalchemy, `enabled', `@current_app.teardown_appcontext', `dnl')
ifelse(do_sqlalchemy, `enabled', `def shutdown_session( exception=None ):', `dnl')
ifelse(do_sqlalchemy, `enabled', `    db_session.remove()', `dnl')
define(`roota', `$1_root')
@app.route( '/' )
def roota(ghtmptmp)():
    return render_template( 'menu.html' )

