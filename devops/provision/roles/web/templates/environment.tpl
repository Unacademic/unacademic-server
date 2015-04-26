PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"

{% for key, value in web.env.iteritems() %}
export {{ key }}={{ value }}
{% endfor %}
