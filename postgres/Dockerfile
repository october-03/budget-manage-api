FROM postgres:16.2

RUN apt-get update && apt-get install -y python3 python3-pip postgresql-plpython3-16 python3-venv

RUN python3 -m venv /venv

ENV PATH="/venv/bin:$PATH"

RUN pip3 install requests

COPY ./init.sql /docker-entrypoint-initdb.d/

RUN chmod a+r /docker-entrypoint-initdb.d/init.sql