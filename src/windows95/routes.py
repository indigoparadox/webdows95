
from flask import current_app, render_template, jsonify
import logging

icons = {
    'children': {
        'desktop': {
            'type': 'desktop',
            'children': {
                'A Folder': {
                    'type': 'folder',
                    'iconX': 50,
                    'iconY': 50,
                    'children': {
                        'A Text File': {
                            'type': 'notepad',
                            'iconX': 10,
                            'iconY': 10,
                            'contents': 'This is a text file.'
                        }
                    }
                }
            }
        }
    }
}

@current_app.route( '/ajax/folders/<path:folder_path>' )
def windows95_ajax_folders( folder_path ):
    folder_path = folder_path.split( '/' )
    folder_path.reverse()

    folder_iter = ''
    icons_iter = icons
    while folder_path:
        folder_iter = folder_path.pop()
        print( folder_iter )
        if 'children' in icons_iter and folder_iter in icons_iter['children']:
            icons_iter = icons_iter['children'][folder_iter]

    return jsonify( icons_iter );

@current_app.route( '/' )
def windows95_root():
    return render_template( 'desktop.html' )

