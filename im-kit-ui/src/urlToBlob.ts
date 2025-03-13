export const blobImgMap: { [key: string]: string } = {}

export const urlToBlob = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url)
    const blob = await res.blob()

    return URL.createObjectURL(blob)
  } catch (error) {
    console.error(error)
    return ''
  }
}

export const getBlobImg = async (url: string): Promise<string> => {
  if (blobImgMap[url]) {
    return blobImgMap[url]
  }

  const blobUrl = await urlToBlob(url)

  blobImgMap[url] = blobUrl
  return blobUrl
}
