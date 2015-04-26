upstream backend {
    server 127.0.0.1:{{ web.port }};
}

server {
    listen 0.0.0.0:80;
    charset utf-8;

    # Statics
    location / {
        root {{ web.public }};
        access_log off;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_redirect off;

        try_files $uri $uri/ /index.html =404;
    }

    # Nodejs
    location {{ web.api.location }} {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://backend;
        proxy_redirect off;
    }
 }
