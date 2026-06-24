import boto3

from app.dependencys import env_vars


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
                "name": item["Key"],
                "size": item["Size"],
                "last_modified": item["LastModified"]
            })

        return files
    
    def download_log(self, filename: str):

        response = self.client.get_object(
            Bucket=self.bucket,
            Key=filename
        )

        return response["Body"].read()