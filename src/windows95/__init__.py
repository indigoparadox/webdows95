
import logging
from flask import Flask, render_template, request
from .config import Config

def create_app():

    ''' App factory function. Call this from the runner/WSGI. '''

    app = Flask( __name__, instance_relative_config=False,
        static_folder='../static', template_folder='../templates' )

    # Load our hybrid YAML config.
    with app.open_instance_resource( 'config.yml', 'r' ) as config_f:
        cfg = Config( config_f )
        app.config.from_object( cfg )

    with app.app_context():
        from . import routes

        return app

