#!/bin/bash

PRESIGNED_URL="https://s3.eu-central-1.wasabisys.com/tsdev-eu/test/note%5B20220317T124251%5D.md?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=O7PPJDFQ7YK2ZBBOUI34%2F20240807%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20240807T062928Z&X-Amz-Expires=900&X-Amz-Signature=b50c551e5315529c1c4a87c7f44e2daa458eb16c2205a4e7e7ae8855aa557f08&X-Amz-SignedHeaders=host%3Bx-amz-server-side-encryption-customer-algorithm&x-amz-user-agent=aws-sdk-js%2F3.624.0%20ua%2F2.0%20os%2FmacOS%2310.15.7%20lang%2Fjs%20md%2Fbrowser%23Electron_27.3.11%20api%2Fs3%233.624.0&x-id=GetObject"

RAW_ENCRYPTION_KEY="12345678901234567890123456789012"

# Base64 encode the encryption key
ENCRYPTION_KEY=$(echo -n "$RAW_ENCRYPTION_KEY" | base64)
ENCRYPTION_KEY_MD5=$(echo -n "$RAW_ENCRYPTION_KEY" | openssl md5 -binary | base64)


# Download file
curl -X GET "$PRESIGNED_URL" \
  -H "x-amz-server-side-encryption-customer-algorithm: AES256" \
  -H "x-amz-server-side-encryption-customer-key: $ENCRYPTION_KEY" \
  -H "x-amz-server-side-encryption-customer-key-MD5: $ENCRYPTION_KEY_MD5"
