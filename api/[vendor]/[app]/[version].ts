import type { VercelRequest, VercelResponse } from '@vercel/node'
import { chromium } from 'playwright'

const BAD_REQUEST = 400

const INTERNAL_SERVER_ERROR = 500

// https://ime-sec.gtimg.com/202311032255/c2d34d57b6d7f9fc6b7869423e8576c2/pc/dl/gzindex/1688992049/sogou_mac_614d.zip
const DOWNLOAD_URL_REGEX =
  /https:\/\/ime-sec\.gtimg.com\/\d+\/\w+\/pc\/dl\/gzindex\/(\d+)\/sogou_mac_(\w+)\.zip/

export default async (req: VercelRequest, res: VercelResponse) => {
  const { vendor, app, version } = req.query as {
    vendor: string
    app: string
    version?: string
  }

  if (vendor !== 'gtimg') {
    res.writeHead(BAD_REQUEST)
    res.write('Unsupported vendor yet')
    return res.end()
  }

  if (app !== 'sogou_mac') {
    res.writeHead(BAD_REQUEST)
    res.write('Unsupported app yet')
    return res.end()
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const result = await page.goto('https://pinyin.sogou.com/mac/')
  const text = await result!.text()

  const matched = text.match(DOWNLOAD_URL_REGEX)

  if (!matched) {
    res.writeHead(INTERNAL_SERVER_ERROR)
    res.write(
      'No download url found, please raise an issue to us: https://github.com/un-ts/rabbit-linker/issues/new',
    )
    return res.end()
  }

  const [url, timestamp, shortVersion] = matched

  if (!version || [timestamp, shortVersion].includes(version)) {
    return res.redirect(url)
  }

  res.writeHead(BAD_REQUEST)
  res.write(
    `No matched version found, it could be not the latest version, maybe you want version \`${shortVersion}\` instead`,
  )
  res.end()
}
