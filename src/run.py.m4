#!/usr/bin/env python3

import logging
ifelse(do_flask, `enabled', `from ghtmptmp import create_app', `dnl')
ifelse(do_flask, `enabled', `', `dnl')
ifelse(do_flask, `enabled', `app = create_app()', `dnl')

if '__main__' == __name__:
    logging.basicConfig( level=logging.INFO )
    logger = logging.getLogger( 'main' )
    ifelse(do_flask, `enabled', `', `dnl')
    ifelse(do_flask, `enabled', `app.run()', `dnl')

