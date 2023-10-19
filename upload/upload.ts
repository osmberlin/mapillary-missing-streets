import { S3 } from '@aws-sdk/client-s3'
import fs from 'node:fs'
import path from 'node:path'

const s3 = new S3({
  region: 'eu-central-1',
})

console.log('START', 'Uploading file to S3 bucket atlas-tiles', import.meta.file)

const pmtilesFiles = fs
  .readdirSync(path.resolve(import.meta.dir, '../matching/data'))
  .filter((file) => path.extname(file) === '.pmtiles')

for (const file of pmtilesFiles) {
  const Key = file
  const bunFile = Bun.file(path.resolve(import.meta.dir, '../matching/data', file))
  const Body = (await bunFile.arrayBuffer()) as any
  const ContentType = 'application/x-protobuf'

  s3.putObject({ Bucket: 'atlas-tiles', Key, Body, ContentType }, (err, _data) => {
    if (err) {
      console.error(err)
      return
    }
    const previewUrl = `https://atlas-tiles.s3.eu-central-1.amazonaws.com/${file}`
    console.log('INFO', `Test-URL: https://protomaps.github.io/PMTiles/?url=${previewUrl}`)
  })
}
