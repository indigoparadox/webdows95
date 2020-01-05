#!/usr/bin/env python3

import logging
from windows95 import create_app

app = create_app()

if '__main__' == __name__:
    logging.basicConfig( level=logging.INFO )
    logger = logging.getLogger( 'main' )
    
    app.run()

