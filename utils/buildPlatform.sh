GHCR_REPO="ghcr.io/llamalogic"
ROOT_NAME="ecsd"

PROJECT_ROOT="."

API_PROJECT_NAME="api"
MAIL_PROJECT_NAME="mail"
EXPERT_PROJECT_NAME="expert"
PROXY_PROJECT_NAME="proxy"
CONSOLE_PROJECT_NAME="console"

API_PROJECT="${ROOT_NAME}_${API_PROJECT_NAME}"
MAIL_PROJECT="${ROOT_NAME}_${MAIL_PROJECT_NAME}"
EXPERT_PROJECT="${ROOT_NAME}_${EXPERT_PROJECT_NAME}"
PROXY_PROJECT="${ROOT_NAME}_${PROXY_PROJECT_NAME}"
CONSOLE_PROJECT="${ROOT_NAME}_${CONSOLE_PROJECT_NAME}"

#assume the script is run from the root of the project
#if(PROJECT_ROOT == ".")
#    PROJECT_ROOT=$(pwd)
#fi  

echo "Building $API_PROJECT"
docker build ${API_PROJECT} -t ghcr.io/llamalogic/${API_PROJECT_NAME}  -f ./${API_PROJECT}/docker/Dockerfile
docker push ghcr.io/llamalogic/${API_PROJECT_NAME}

echo "Building $MAIL_PROJECT"
docker build ${MAIL_PROJECT} -t ghcr.io/llamalogic/${MAIL_PROJECT_NAME}  -f ./${MAIL_PROJECT}/docker/Dockerfile
docker push ghcr.io/llamalogic/${MAIL_PROJECT_NAME}

echo "Building $EXPERT_PROJECT"
docker build ${EXPERT_PROJECT} -t ghcr.io/llamalogic/${EXPERT_PROJECT_NAME}  -f ./${EXPERT_PROJECT}/docker/Dockerfile
docker push ghcr.io/llamalogic/${EXPERT_PROJECT_NAME}

echo "Building $PROXY_PROJECT"
docker build ${PROXY_PROJECT} -t ghcr.io/llamalogic/${PROXY_PROJECT_NAME}  -f ./${PROXY_PROJECT}/docker/Dockerfile
docker push ghcr.io/llamalogic/${PROXY_PROJECT_NAME}

echo "Building $CONSOLE_PROJECT"
docker build ${CONSOLE_PROJECT} -t ghcr.io/llamalogic/${CONSOLE_PROJECT_NAME}  -f ./${CONSOLE_PROJECT}/docker/Dockerfile
docker push ghcr.io/llamalogic/${CONSOLE_PROJECT_NAME}

