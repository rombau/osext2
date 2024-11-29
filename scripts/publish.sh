#!/bin/bash

cd "$(dirname "$0")/.."

# Firefox

echo -n "Publish extension on AMO ..."

EXTENSION_ID="\{08f962cf-b932-49d3-a2a3-e4fd99c66ad6\}"

base64encode() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }
JWT_HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64encode )
JWT_PAYLOAD=$(echo -n '{"iss":"'"$AMO_API_KEY"'","jti":"'"$(uuidgen)"'","iat":'$(date +%s)',"exp":'$(($(date +%s)+120))'}' | base64encode )
JWT_SIGNATURE=$(echo -n "$JWT_HEADER.$JWT_PAYLOAD" | openssl dgst -binary -sha256 -hmac "$AMO_API_SECRET" | base64encode )
JWT="JWT $JWT_HEADER.$JWT_PAYLOAD.$JWT_SIGNATURE"

UPLOAD_ID=$(curl -L -s -H "Authorization: $JWT" -F "channel=listed" \
	-F "upload=@$(find release -name 'osext*firefox.zip')" \
	"https://addons.mozilla.org/api/v5/addons/upload/" | jq -r '.uuid')
ATTEMPTS=1
while true;
do
	UPLOAD_RESPONSE=$(curl -L -s -H "Authorization: $JWT" \
		"https://addons.mozilla.org/api/v5/addons/upload/$UPLOAD_ID/")
	UPLOAD_VALID=$(echo $UPLOAD_RESPONSE | jq -r '.valid')
	echo -n "."
    if [[ "$UPLOAD_VALID" == "true" ]]; then
        break;
    fi;
	((ATTEMPTS++))
	if [[ "$ATTEMPTS" == '10' ]]; then
		echo " FAILED"
		echo $UPLOAD_RESPONSE
        exit 1;
    fi;
    sleep 1;
done
curl -L -s -H "Authorization: $JWT" \
	-H "Content-Type: application/json" \
	-d '{"upload": "'"$UPLOAD_ID"'"}' \
	"https://addons.mozilla.org/api/v5/addons/addon/$EXTENSION_ID/versions/"
echo " OK"

# Chrome

echo -n "Publish extension on Google Web Store ..."

EXTENSION_ID=plhbikhfgkkommnghjaihagamgophofm

GWS_TOKEN=$(curl -L -s \
	-d "client_id=$GWS_API_KEY&client_secret=$GWS_API_SECRET&grant_type=refresh_token&refresh_token=$GWS_API_REFRESHTOKEN" \
	"https://oauth2.googleapis.com/token" | jq -r '.access_token')
echo -n "."
UPLOAD_RESPONSE=$(curl -L -s \
	-H "Authorization: Bearer $GWS_TOKEN" \
	-T $(find release -name 'osext*chrome.zip') \
	"https://www.googleapis.com/upload/chromewebstore/v1.1/items/$EXTENSION_ID")
echo -n "."
UPLOAD_RESPONSE=$(curl -L -s -X POST \
	-H "Authorization: Bearer $GWS_TOKEN" \
	"https://www.googleapis.com/chromewebstore/v1.1/items/$EXTENSION_ID/publish")
echo " OK"
