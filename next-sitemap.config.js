module.exports = {
  siteUrl: 'https://ai-listing.cn',
  generateRobotsTxt: true,
  additionalPaths: async (config) => {
    const result = []
    // 手动添加博客文章
    const articles = [
      { slug: 'jungle-scout-alternative', lastmod: '2026-07-12' },
    ]
    for (const article of articles) {
      result.push({
        loc: `/zh/blog/${article.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: article.lastmod,
      })
      result.push({
        loc: `/en/blog/${article.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: article.lastmod,
      })
    }
    return result
  },
}