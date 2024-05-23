#!/bin/bash
 
# !!! This script is dangerous because it could expose sensitive information from dev env that wasn't meant to be exposed to the end user !!!
# !!! Let me say that one more time.  DON'T USE THIS UNLESS YOU KNOW WHAT YOU'RE DOING AND THEN CONSIDER NOT USING ANYWAY!!! 
# !!! SECRETS MAY BE EXPOSED TO THE END USER IF THINGS GO WRONG!!!

#expect three env args
# 1. NGINX_CONF -- the nginx configuration file to edit,  default is /etc/nginx/conf.d/default.conf
# 2. ENV_FILE_IN -- the input env file, defaults to "/usr/share/nginx/html/runtime.env"
# 3. ENV_FILE_OUT   -- the output env file defualt is runtime-env.js

#setup nginx conf 
nginx_conf_file="/etc/nginx/conf.d/default.conf"
if [ -n "${NGINX_CONF}" ]; then
    echo "VAR is set to some string"
    #check if the file exists
    if exist ${NGINX_CONF}; then 
        rem "file exists"
        # Assign the nginx configuration filename
        nginx_conf=${NGINX_CONF}
    fi
fi  

#setup runtime env input file 
#this default may require createing a dir.
runtime_input="/usr/share/nginx/html/runtime-env.env"
if [ -n "${ENV_FILE_IN}" ]; then
    echo "ENV_FILE_IN is set to some string"
    #check if the file exists
    if exist ${ENV_FILE_IN}; then 
        rem "file exists"
        # Assign the nginx configuration filename
        runtime_env=${ENV_FILE_IN}
    fi
fi  

#setup runtime enc output file 
#this default may require createing a dir.
runtime_config_file="/usr/share/nginx/html/runtime-env.js"
if [ -n "${ENV_FILE_OUT}" ]; then
    echo "ENV_FILE_IN is set to some string"
    #check if the file exists
    if exist ${ENV_FILE_OUT}; then 
        rem "file exists"
        # Assign the nginx configuration filename
        runtime_config_file=${ENV_FILE_OUT}
    fi
fi  

#setup output file.
# Recreate runtime-env config file
rm -rf ${runtime_config_file} && touch ${runtime_config_file}

echo "window._env_ = {" >> ${runtime_config_file}


# Read each line in .env file, each line represents key=value pairs
# !!! This does not support env values in the environment that aren't in the .env file !!!
# This is dangerous because it could expose sensitive information from dev env that wasn't meant to be exposed
# Solution may be to write the file vars then write the env vars that have some prefix over the top of the file vars.
while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")

  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}
  
  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >>  ${runtime_config_file}

  # Replace the nginx environment variable placeholder
  if [[ $varname != "" && $value != "" ]]; then
    sed -i 's|{'$varname'}|'"$value"'|g' $nginx_conf_file
  fi

done < ${runtime_input}

echo "}" >> ${runtime_config_file}
