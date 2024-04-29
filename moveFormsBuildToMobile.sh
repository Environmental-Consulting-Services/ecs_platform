SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo "SCRIPT_DIR: $SCRIPT_DIR"
cp -rf "$SCRIPT_DIR"/ecsd_forms/build/* "$SCRIPT_DIR/ecsd_mobile/assets/forms/"