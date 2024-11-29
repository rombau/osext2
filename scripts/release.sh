#!/bin/bash

cd "$(dirname "$0")/.."

GITHUB_REPO=rombau/osext2
GITHUB_API_VERSION=2022-11-28

NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
	echo "Please provide the new version"
	exit 1;
fi

OLD_VERSION=$(curl -L -s \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer $GITHUB_TOKEN" \
	-H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
	https://api.github.com/repos/$GITHUB_REPO/releases/latest | jq -r '.name')
echo "Old version is $OLD_VERSION"

# TODO: exit without old version

echo "Clean up release folder ..."
rm -r release/*

echo "Update manifest and package to $NEW_VERSION ..."
sed -i -E 's/"version"\s*:\s*"[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$1"'"/g' extension/manifest.json
sed -i -E 's/"version"\s*:\s*"[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$1"'"/g' package.json

echo "Package Firefox extension ..."
FIREFOX_ARCHIVE=osext_${NEW_VERSION}_firefox.zip
cd extension && zip -rq ../release/$FIREFOX_ARCHIVE * && cd ..

echo "Package Chrome extension ..."
CHROME_ARCHIVE=osext_${NEW_VERSION}_chrome.zip
cp -r extension release/chrome
jq 'del(.browser_specific_settings)' release/chrome/manifest.json > tmp && mv tmp release/chrome/manifest.json
cd release/chrome && zip -rq ../$CHROME_ARCHIVE * && cd ../..
rm -r release/chrome

echo "Commit verison $NEW_VERSION ..."
git add extension/manifest.json package.json
git commit -q -m "new version $NEW_VERSION"
git push -q

echo "Create release $NEW_VERSION ..."
RELEASE_ID=$(curl -L -s \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer $GITHUB_TOKEN" \
	-H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
	-d '{"tag_name": "'"v$NEW_VERSION"'", "name": "'"$NEW_VERSION"'"}' \
    "https://api.github.com/repos/$GITHUB_REPO/releases" | jq -r '.id')
echo "New Release ID is $RELEASE_ID"

echo "Upload $FIREFOX_ARCHIVE ..."
curl -L -s \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer $GITHUB_TOKEN" \
	-H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
	-H "Content-Type: application/zip" \
	"https://uploads.github.com/repos/$GITHUB_REPO/releases/$RELEASE_ID/assets?name=$FIREFOX_ARCHIVE" \
	--data-binary "@release/$FIREFOX_ARCHIVE" > /dev/null

echo "Upload $CHROME_ARCHIVE ..."
curl -L -s \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer $GITHUB_TOKEN" \
	-H "X-GitHub-Api-Version: $GITHUB_API_VERSION" \
	-H "Content-Type: application/zip" \
	"https://uploads.github.com/repos/$GITHUB_REPO/releases/$RELEASE_ID/assets?name=$CHROME_ARCHIVE" \
	--data-binary "@release/$CHROME_ARCHIVE" > /dev/null

