set -e

cd resources/android/icon
find . -name 'drawable-*-icon.png' | awk -F '-' '{print $2}' | xargs -I {} cp drawable-{}-icon.png {}-foreground.png
cd ../../../
npx cordova-res android --skip-config --copy
