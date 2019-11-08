[uwsgi]
if-env = VIRTUAL_ENV
virtualenv = %(_)
endif =
module = template:app
uid = www-data
gid = www-data
master = true
processes = 5
socket = /tmp/uwsgi.socket
chmod-socket = 666
vacuum = true
die-on-term = true
plugins = python3
