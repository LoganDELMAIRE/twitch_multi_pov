#!/bin/bash

mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private-key.pem \
  -out ssl/certificate.pem \
  -subj "/C=FR/ST=State/L=City/O=Organization/CN=localhost" 