FROM mozillamarketplace/centos-phantomjs-mkt:0.1

ENV IS_DOCKER 1

RUN yum install -y gcc-c++

RUN mkdir -p /srv/zippy
ADD package.json /srv/zippy/package.json

WORKDIR /srv/zippy
RUN npm install
