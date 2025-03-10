FROM httpd:2.4

# Copy our game files to the Apache document root
COPY index.html /usr/local/apache2/htdocs/
COPY game.js /usr/local/apache2/htdocs/
COPY styles.css /usr/local/apache2/htdocs/

# Copy our Apache configuration
COPY apache.conf /usr/local/apache2/conf/httpd.conf

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["httpd", "-DFOREGROUND"] 