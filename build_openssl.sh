# Builds openssl 1.0.2 which has NO support for TLSv1.3 but does support SSLv2 and SSLv3


wget https://openssl.org/source/openssl-1.0.2k.tar.gz
tar -xvf openssl-1.0.2k.tar.gz
cd openssl-1.0.2k/
# --prefix will make sure that make install copies the files locally instead of system-wide
# --openssldir will make sure that the binary will look in the regular system location for openssl.cnf
# no-shared builds a mostly static binary
./config --prefix=`pwd`/local --openssldir=/usr/lib/ssl enable-ssl2 enable-ssl3 no-shared
make depend
make
make -i install

# copy the binary to the system location
cp local/bin/openssl /usr/local/bin/

# cleanup
cd ..
rm -rf openssl-1.0.2k
rm openssl-1.0.2k.tar.gz