### Describes the deployment process with Docker and K8s
### All commands are executed from the service root folder

# 1 -- Log in to the Docker repository:
docker login -u claude -p 9qR5hbhm7Dzw6BNZcRFv cc-ms-k8s-training.common.repositories.cloud.sap

# 2 -- Build the Docker image:
docker build -t cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-ads-i550531:v1 .

# 3 -- Push the Docker image to the Docker registry:
docker push cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-ads-i550531:v1

# 4 -- Deploy all three YAML files:
# a)
kubectl apply -f ./.k8s/1_docker-registry.yml
# b)
kubectl apply -f ./.k8s/2_bulletinboard-ads-db.yml
# c)
kubectl apply -f ./.k8s/3_bulletinboard-ads.yml

# 5 -- Build the Docker image (second version):
docker build -t cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-ads-i550531:v2 .

# 6 -- Push the Docker image (second version) to the Docker registry:
docker push cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-ads-i550531:v2

# 7 -- Update the image in K8s
kubectl set image deployment/bulletinboard-ads app=cc-ms-k8s-training.common.repositories.cloud.sap/bootcamp-ads-i550531:v2

# 8 -- Check the status of the bulletinboard-ads resource in K8s
kubectl rollout status deployment/bulletinboard-ads

# 9 -- Show the details of the bulletinboard-ads resource in K8s
kubectl describe deployment bulletinboard-ads
