#!/usr/bin/env bash

# Ref: https://gist.github.com/claudio4/9b3acc7cc446a013f68ad98ab6d39cb8

export NGINX_VERSION=1.23.1
# provides support for sslv2 and sslv3
export VERSION_OPENSSL="openssl-1.0.2n"
export VERSION_NGINX=nginx-$NGINX_VERSION

 
# URLs to the source directories
export SOURCE_LIBRESSL=https://www.openssl.org/source/
export SOURCE_NGINX=http://nginx.org/download/

#Build directory
export BPATH=$(pwd)/build
 
# clean out any files from previous runs of this script
rm -rf $BPATH

# exit on failture
set -e

mkdir $BPATH

# proc for building faster
NB_PROC=$(grep -c ^processor /proc/cpuinfo)

 
# grab the source files
echo "Download sources"
wget -P $BPATH $SOURCE_LIBRESSL$VERSION_OPENSSL.tar.gz
wget -P $BPATH $SOURCE_NGINX$VERSION_NGINX.tar.gz
 
# expand the source files
echo "Extract Packages"
cd $BPATH
tar xzf $VERSION_NGINX.tar.gz
tar xzf $VERSION_OPENSSL.tar.gz
# set where OpenSSL
export STATICLIBSSL=$BPATH/$VERSION_OPENSSL


# build nginx, with various modules included/excluded
echo "Configure & Build Nginx"
cd $BPATH/$VERSION_NGINX
./configure  --with-openssl=$STATICLIBSSL \
--with-ld-opt="-lrt"  \
--with-cc-opt="-march=native" \
--sbin-path=/usr/sbin/nginx \
--conf-path=/etc/nginx/nginx.conf \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--with-http_ssl_module \
--with-http_v2_module \
--with-file-aio \
--with-threads \
--with-ipv6 \
--with-http_gzip_static_module \
--with-http_stub_status_module \
--without-mail_pop3_module \
--without-mail_smtp_module \
--without-mail_imap_module \
--without-http_rewrite_module \
--with-http_image_filter_module \
 --lock-path=/var/lock/nginx.lock \
 --pid-path=/run/nginx.pid \
 --http-client-body-temp-path=/var/lib/nginx/body \
 --http-fastcgi-temp-path=/var/lib/nginx/fastcgi \
 --http-proxy-temp-path=/var/lib/nginx/proxy \
 --http-scgi-temp-path=/var/lib/nginx/scgi \
 --http-uwsgi-temp-path=/var/lib/nginx/uwsgi \
 --with-pcre-jit \
 --with-http_stub_status_module \
 --with-http_realip_module \
 --with-http_auth_request_module \
 --with-http_addition_module \
 --with-http_geoip_module 
 
# touch $STATICLIBSSL/.openssl/include/openssl/ssl.h
make -j $NB_PROC && checkinstall --pkgname="nginx" --pkgversion="$NGINX_VERSION" \
 --provides="nginx" --requires="libc6, libpcre3, zlib1g" --strip=yes \
 --stripso=yes --pakdir="$BPATH/nginx" --backup=yes -y --install="yes"