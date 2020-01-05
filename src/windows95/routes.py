
from flask import current_app, render_template
import logging

@current_app.route( '/' )
def windows95_root():
    return render_template( 'desktop.html' )

