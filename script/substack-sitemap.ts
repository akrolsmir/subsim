import { XMLParser } from 'fast-xml-parser'
import TurndownService from 'turndown'
import { JSDOM } from 'jsdom'

const SITEMAP_URL = 'https://www.astralcodexten.com/sitemap.xml'
const OUTPUT_FILE = 'acx_links.json'
const POSTS_LIMIT = 100

interface SitemapURL {
  loc: string
}

interface Sitemap {
  urlset: {
    url: SitemapURL[]
  }
}

async function fetchSitemap(url: string): Promise<Sitemap> {
  const response = await fetch(url)
  const xml = await response.text()
  const parser = new XMLParser()
  return parser.parse(xml)
}

async function fetchAndConvertToMarkdown(url: string): Promise<string> {
  const response = await fetch(url)
  const html = await response.text()

  // Parse the HTML
  const dom = new JSDOM(html)
  const document = dom.window.document

  // Find the post title
  const titleElement = document.querySelector('h1.post-title')
  const title = titleElement ? titleElement.textContent : 'Untitled Post'

  // Find the main content
  const mainContent = document.querySelector('div.body.markup')

  if (!mainContent) {
    throw new Error('Could not find main content')
  }

  // Convert to Markdown
  const turndownService = new TurndownService()
  const contentMarkdown = turndownService.turndown(mainContent.innerHTML)

  // Combine title and content
  return `# ${title}\n\n${contentMarkdown}`
}

async function main() {
  const sitemap = await fetchSitemap(SITEMAP_URL)
  const links = sitemap.urlset.url.map((url) => url.loc)

  await Bun.write(OUTPUT_FILE, JSON.stringify(links, null, 2))
  console.log(`Saved ${links.length} links to ${OUTPUT_FILE}`)

  const file = Bun.file('acx.jsonl')
  const writer = file.writer()

  for (let i = 0; i < Math.min(POSTS_LIMIT, links.length); i++) {
    const link = links[i]
    if (link.includes('/p/')) {
      const markdown = await fetchAndConvertToMarkdown(link)
      const jsonLine = JSON.stringify({ text: markdown }) + '\n'
      writer.write(jsonLine)
      console.log(`Converted ${link} and appended to acx.jsonl`)
    }
  }
}

main().catch(console.error)
