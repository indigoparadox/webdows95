#!/usr/bin/env python3

import logging dnl
import yaml dnl
divert(-1)
changequote(`[', `]')
define([flaskapp], [
from flask import Flask, render_template, request
uwsgi_present = False
try:
    import uwsgi
    uwsgi_present = True
except ImportError:
    uwsgi_present = False

app = Flask(__name__)
app.secret_key = 'development' # TODO: Change me.

def get_config():
    config = None
    with app.open_instance_resource( 'config.yml', 'r' ) as config_f:
        config = yaml.load( config_f )
    return config

@app.route( '/' )
def roota(template)():
    return render_template( 'menu.html' )
])
define([flaskuwsgi], [
    if not uwsgi_present:
        logger.warning( 'uwsgi not present; connection locking unavailable.' )

    app.run()
])
changequote([`], ['])
define(`roota', `$1_root')
divert(0)
ifelse(do_flask, `enabled', `flaskapp', `')
if '__main__' == __name__:
    logging.basicConfig( level=logging.INFO )
    logger = logging.getLogger( 'main' )
ifelse(do_flask, `enabled', `flaskuwsgi', `')
