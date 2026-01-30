# Deploy to VM script
$VMUser = "akshu001"
$VMIP = "192.168.0.9"

Write-Host "🚀 Deploying to VM at $VMIP..." -ForegroundColor Green

# Copy K8s manifests to VM
scp -r k8s ${VMUser}@${VMIP}:/home/${VMUser}/

# Deploy to Kubernetes on VM
ssh ${VMUser}@${VMIP} "kubectl apply -f /home/${VMUser}/k8s/ && kubectl rollout restart deployment/backend && kubectl rollout restart deployment/frontend"

Write-Host "✅ Deployment complete!" -ForegroundColor Green