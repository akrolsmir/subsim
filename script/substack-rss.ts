import { XMLParser } from 'fast-xml-parser'
import TurndownService from 'turndown'

const RSS_URL = 'https://www.astralcodexten.com/feed'
const OUTPUT_FILE = 'acx_posts.json'
const POSTS_LIMIT = 200

interface RSSItem {
  title: string
  link: string
  'content:encoded': string
}

interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem[]
    }
  }
}

async function fetchRSSFeed(url: string, page: number = 1): Promise<RSSFeed> {
  const response = await fetch(`${url}?page=${page}`)
  const xml = await response.text()
  const parser = new XMLParser()
  return parser.parse(xml)
}

async function getAllPosts(): Promise<RSSItem[]> {
  let allPosts: RSSItem[] = []
  let page = 1

  while (allPosts.length < POSTS_LIMIT) {
    const feed = await fetchRSSFeed(RSS_URL, page)
    const posts = feed.rss.channel.item

    if (posts.length === 0) {
      break
    }

    allPosts = allPosts.concat(posts)
    page++
    console.log(`Fetched page ${page}`)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 1s timeout
  }

  return allPosts.slice(0, POSTS_LIMIT)
}

async function scrapeRSS() {
  // Fetch the RSS feed
  const posts = await getAllPosts()

  // Initialize TurndownService
  const turndownService = new TurndownService()

  // Extract the posts and convert content to Markdown
  const postsWithMarkdown = posts.map((item) => ({
    title: item.title,
    link: item.link,
    content: turndownService.turndown(item['content:encoded']),
  }))

  // Write the posts to a JSON file
  await Bun.write(OUTPUT_FILE, JSON.stringify(postsWithMarkdown, null, 2))

  console.log(
    `Successfully scraped ${postsWithMarkdown.length} posts and saved to ${OUTPUT_FILE}`
  )
}

scrapeRSS()
