export const blobImgMap: { [key: string]: string } = {}

export const urlToBlob = async (url: string): Promise<string> => {
  const res = await fetch(url)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export const getBlobImg = async (url: string): Promise<string> => {
  if (blobImgMap[url]) {
    return blobImgMap[url]
  }
  const blobUrl = await urlToBlob(url)
  blobImgMap[url] = blobUrl
  return blobUrl
}
