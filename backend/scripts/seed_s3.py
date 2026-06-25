import os
import boto3
from botocore.exceptions import ClientError
from app.dependencys import env_vars

S3_ENDPOINT_URL = env_vars.get("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = env_vars.get("S3_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = env_vars.get("S3_SECRET_KEY")
AWS_DEFAULT_REGION = env_vars.get("S3_REGION")
BUCKET_NAME = env_vars.get("S3_BUCKET", "logs-bucket")

client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_DEFAULT_REGION,
)


def create_bucket():
    try:
        client.head_bucket(Bucket=BUCKET_NAME)
        print(f"Bucket '{BUCKET_NAME}' already exists")
    except ClientError:
        client.create_bucket(Bucket=BUCKET_NAME)
        print(f"Bucket '{BUCKET_NAME}' created")


def upload_logs():
    logs_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "logs"
    )

    for filename in os.listdir(logs_dir):

        filepath = os.path.join(logs_dir, filename)

        try:
            client.head_object(
                Bucket=BUCKET_NAME,
                Key=filename
            )

            print(f"Skipping {filename} (already exists)")

        except ClientError as e:

            error_code = e.response["Error"]["Code"]

            if error_code not in ["404", "NoSuchKey"]:
                raise

            client.upload_file(
                filepath,
                BUCKET_NAME,
                filename
            )

            print(f"Uploaded: {filename}")


if __name__ == "__main__":
    create_bucket()
    upload_logs()