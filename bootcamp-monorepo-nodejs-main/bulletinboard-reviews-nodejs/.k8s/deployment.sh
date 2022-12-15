### Describes the deployment process with Docker and K8s
### All commands are executed from the service root folder

# 1 -- Log in to the Docker repository:
docker login -u claude -p 9qR5hbhm7Dzw6BNZcRFv cc-ms-k8s-training.common.repositories.cloud.sap

# 2 -- Build the Docker image:
docker build -t cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-reviews-i550531:v1 .

# 3 -- Push the Docker image to the Docker registry:
docker push cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-reviews-i550531:v1

# 4 -- Deploy all three YAML files:
# a)
kubectl apply -f ./.k8s/1_docker-registry.yml
# b)
kubectl apply -f ./.k8s/2_bulletinboard-reviews-db.yml
# c)
kubectl apply -f ./.k8s/3_bulletinboard-reviews.yml
