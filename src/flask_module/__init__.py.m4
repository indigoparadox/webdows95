
import logging
divert(-1)
changequote(`[', `]')

define([sqlimport], [
])

define([uwsgiimport], [uwsgi_present = False
try:
    import uwsgi
    uwsgi_present = True
except ImportError:
    logger = logging.getLogger( 'init.uwsgi' )
    uwsgi_present = False
    logger.warning( 'uwsgi not present; connection locking unavailable.' )

# Setup the database stuff.
db = SQLAlchemy()])

changequote([`], ['])
divert(0)
ifelse(do_sqlalchemy, `enabled', `from flask_sqlalchemy import SQLAlchemy', `dnl')
ifelse(do_flask, `enabled', `from flask import Flask, render_template, request', `dnl')
from .config import Config
ifelse(do_flask, `enabled', `uwsgiimport', `dnl')

def create_app():

    ''' App factory function. Call this from the runner/WSGI. '''

    app = Flask( __name__, instance_relative_config=False )

    # Load our hybrid YAML config.
    with app.open_instance_resource( 'config.yml', 'r' ) as config_f:
        cfg = Config( config_f )
        app.config.from_object( cfg )

    with app.app_context():
        from . import routes

        return app

