variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS Region to deploy resources into"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment name"
}

variable "cluster_name" {
  type        = string
  default     = "devtrack-eks-cluster"
  description = "Name of the AWS EKS Cluster"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for the AWS VPC"
}

variable "node_instance_type" {
  type        = string
  default     = "t3.medium"
  description = "EC2 instance type for EKS worker nodes"
}

variable "desired_capacity" {
  type        = number
  default     = 2
  description = "Desired number of EKS worker nodes"
}

variable "min_capacity" {
  type        = number
  default     = 1
  description = "Minimum number of EKS worker nodes"
}

variable "max_capacity" {
  type        = number
  default     = 4
  description = "Maximum number of EKS worker nodes"
}
