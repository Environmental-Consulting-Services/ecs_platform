SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo "SCRIPT_DIR: $SCRIPT_DIR"
cd ..
pwd
cp -rf ./ecsd_forms/build/* ./ecsd_mobile/assets/forms/
echo "Copied forms build to mobile assets"