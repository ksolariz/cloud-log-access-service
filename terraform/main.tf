terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_requesting_account_id  = true

  endpoints {
    s3 = "http://localhost:4566"  # endpoint do Localstack
  }
}

resource "aws_s3_bucket" "logs_bucket" {
  bucket = "cloud-log-access-test-bucket"
}

resource "aws_s3_object" "sample_log" {
  bucket = aws_s3_bucket.logs_bucket.id
  key    = "logs/app-2024-01-01.log"
  source = "./sample-data/app-2024-01-01.log"
}