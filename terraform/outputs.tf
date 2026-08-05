output "aws_region" {
  value       = var.aws_region
  description = "AWS region"
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.main.name
  description = "EKS Cluster Name"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS Cluster Endpoint API"
}

output "backend_ecr_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "Backend ECR Repository URL"
}

output "frontend_ecr_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "Frontend ECR Repository URL"
}

output "kubeconfig_command" {
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.main.name} --region ${var.aws_region}"
  description = "Command to configure kubectl for the EKS cluster"
}
