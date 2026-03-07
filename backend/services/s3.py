import boto3
import os 
from uuid import uuid4
from fastapi import UploadFile

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

def upload_to_s3(file: UploadFile):
    if not file:
        return None
    
    bucket_name = os.getenv("S3_BUCKET_NAME")
    cloudfront_url = os.getenv("CLOUDFRONT_URL")

    if not bucket_name:
        raise Exception("S3_BUCKET_NAME not set")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"

    s3_client.upload_fileobj(
        file.file,
        bucket_name,
        unique_filename,
        ExtraArgs={"ContentType": file.content_type or "application/octet-stream"},
    )

    return f"{cloudfront_url}/{unique_filename}"