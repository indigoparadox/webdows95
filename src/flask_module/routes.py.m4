
import logging
ifelse(do_sqlalchemy, `enabled', `from . import db', `dnl')
ifelse(do_sqlalchemy, `enabled', `', `dnl')
define(`roota', `$1_root')
@app.route( '/' )
def roota(ghtmptmp)():
    return render_template( 'root.html' )
