const BAD_REQUEST = 400

const INTERNAL_SERVER_ERROR = 500

const DOWNLOAD_URL_REGEX =
  /https:\/\/ime-sec\.gtimg.com\/\d+\/\w+\/pc\/dl\/gzindex\/(\d+)\/sogou_mac_(\w+)\.zip/

export const config = {
  runtime: 'edge',
}

export default async (req: Request): Promise<Response> => {
  const { vendor, app, version } = Object.fromEntries(
    new URL(req.url).searchParams,
  )

  if (vendor !== 'gtimg') {
    return new Response('Unsupported vendor yet', { status: BAD_REQUEST })
  }

  if (app !== 'sogou_mac') {
    return new Response('Unsupported app yet', { status: BAD_REQUEST })
  }

  const res = await fetch('https://pinyin.sogou.com/mac/')

  const text = await res.text()

  const matched = text.match(DOWNLOAD_URL_REGEX)

  if (!matched) {
    return new Response(
      'No download url found, please raise an issue to us: https://github.com/un-ts/rabbit-linker/issues/new',
      { status: INTERNAL_SERVER_ERROR },
    )
  }

  const [url, timestamp, shortVersion] = matched

  if (!version || [timestamp, shortVersion].includes(version)) {
    return Response.redirect(url)
  }

  return new Response(
    `No matched version found, it could be not the latest version, maybe you want version \`${shortVersion}\` instead`,
    { status: BAD_REQUEST },
  )
}
