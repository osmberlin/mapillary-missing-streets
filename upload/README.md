# About

This setup is sponsored by [FixMyCity](https://github.com/FixMyBerlin) (FMC).
The upload script is more or less https://github.com/FixMyBerlin/atlas-app/tree/develop/datasets.

---

Files are uploaded to the FMC S3 bucket at https://s3.console.aws.amazon.com/s3/buckets/atlas-tiles?region=eu-central-1&tab=objects (replacing existing files).

Prepare AWS credentials:

1. `code ~/.aws/credentials`
2. Create credentials at https://us-east-1.console.aws.amazon.com/iamv2/home#/security_credentials?section=IAM_credentials => "Zugriffsschlüssel erstellen"
3. Add the following snippet

   ```
   [default]
   aws_access_key_id = a123
   aws_secret_access_key = b123
   ```

Docs: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html
