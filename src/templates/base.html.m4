define(`roota', `$1_root')dnl
<!doctype HTML>
<html>
<head>
<title>{{ title }}</title>
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.css" />
<script type="text/javascript">var flaskRoot = "{{ url_for( 'roota(ghtmptmp)' ) }}";</script>
<script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
<script src="{{ url_for( 'static', filename='sidebar.js' ) }}"></script>
<link rel="stylesheet" href="{{ url_for( 'static', filename='style.css' ) }}" />
{% block scripts %}{% endblock %}
</head>
<body class="h-100 bg-dark">

{% if not no_sidebar %}
<div id="sidebar" class="sidebar h-100 bg-secondary">
<a id="sidebar-toggle" href="#"></a>
<div id="sidebar-inner">
{% block sidebar %}{% endblock %}
</div>
</div>

<div id="main">
{% endif %}{# /no_sidebar #}

<div class="container">

<div class="row">
<h1>{{ title }}</h1>
{% with flashes = get_flashed_messages() %}
{% if flashes %}
<ul class="flashes">
{% for flashed in flashes %}
<li class="flash">{{ flashed }}</li>
{% endfor %}
</ul>
{% endif %}
{% endwith %}

</div> <!-- /row -->

{% block content %}{% endblock %}

</div> <!-- /container -->

{% if not no_sidebar %}
</div> <!-- /main -->
{% endif %}{# /no_sidebar #}

</body>
</html>
