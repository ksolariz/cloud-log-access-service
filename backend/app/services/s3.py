import boto3
from app.dependencys import env_vars
from botocore.exceptions import ClientError


class S3Service:

    def __init__(self):

        self.bucket = env_vars.get("S3_BUCKET")

        self.client = boto3.client(
            "s3",
            endpoint_url=env_vars.get("S3_ENDPOINT_URL"),
            aws_access_key_id=env_vars.get("S3_ACCESS_KEY"),
            aws_secret_access_key=env_vars.get("S3_SECRET_KEY"),
            region_name=env_vars.get("S3_REGION")
        )

    def list_logs(self):

        response = self.client.list_objects_v2(
            Bucket=self.bucket
        )

        files = []

        for item in response.get("Contents", []):

            files.append({
                "filename": item["Key"],
                "size": item["Size"],
                "last_modified": item["LastModified"]
            })

        return files

    def download_log(self, filename: str):

        try:
            response = self.client.get_object(
                Bucket=self.bucket,
                Key=filename
            )

            return response["Body"].read()

        except ClientError as e:

            error_code = e.response["Error"]["Code"]

            if error_code == "NoSuchKey":
                return None

            raise

    def generate_presigned_url( self, filename: str,expires_in: int = 300 ):

        s3_endpoint_url = env_vars.get("S3_ENDPOINT_URL")
        public_endpoint = env_vars.get("PRESIGNED_PUBLIC_ENDPOINT", "http://localhost:4566")
    
        url = self.client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": self.bucket,
                "Key": filename
            },
            ExpiresIn=expires_in
        )

        url = url.replace(
            s3_endpoint_url,
            public_endpoint
        )

        return url