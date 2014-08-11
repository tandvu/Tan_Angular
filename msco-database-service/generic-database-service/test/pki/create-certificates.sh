# Create CA private key and x509 certificate
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -days 1024 -out ca.pem -subj "/C=US/ST=LA/L=New Orleans/O=Geocent/OU=MSCO/emailAddress=msco.ca@example.com"

# Create application private/public keys and x509 certificate
openssl genrsa -out application.private.key 2048
openssl rsa -in application.private.key -pubout > application.public.key
openssl req -new -key application.private.key -out application.csr -subj "/C=US/ST=LA/L=New Orleans/O=Geocent/OU=MSCO/emailAddress=msco.application@example.com"
openssl x509 -req -in application.csr -CA ca.pem -CAkey ca.key -set_serial 0 -out application.crt -days 1024 

# Cleanup
rm ca.*
rm *.csr