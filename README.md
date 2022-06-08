# wise-phil
docker build -t name:tag .

DBUSER = username
DBPASSWD = user password
DBHOST = db host address
DBNAME = database to connect to
DBPORT = database port

docker run -d -e DBUSER=user -e DBPASSWD=pass -e DBHOST=host_address -e DBNAME=database_name -e DBPORT=database_host_port --add-host=host.docker.internal:host-gateway