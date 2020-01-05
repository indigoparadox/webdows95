
from flask import current_app
import logging

@current_app.route( '/' )
def windows95_root():
    return render_template( 'root.html' )

