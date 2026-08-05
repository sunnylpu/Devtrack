resource "aws_ecr_repository" "backend" {
  name                 = "devtrack-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "devtrack-backend-ecr"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "devtrack-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "devtrack-frontend-ecr"
  }
}
