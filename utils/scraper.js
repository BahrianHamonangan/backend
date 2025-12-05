const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function scrapeKomiku(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.text();
    const $ = cheerio.load(body);

    // Try Open Graph first
    let title = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');
    let coverUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');

    // Fallbacks for title
    if (!title) {
      title = $('h1').first().text().trim() || $('.post-title').first().text().trim() || $('.entry-title').first().text().trim() || $('.detail-info-right h1').first().text().trim();
    }
    if (title) title = title.split('|')[0].trim();

    // Fallbacks for cover image
    if (!coverUrl) {
      const img = $('.summary_image img, .thumb img, .post img').first();
      coverUrl = img.attr('src') || img.attr('data-src') || null;
    }

    return {
      title: title || 'Judul Tidak Ditemukan',
      coverUrl: coverUrl || 'https://placehold.co/200x300?text=No+Image'
    };
  } catch (error) {
    console.error('Error Scraping:', error && error.message ? error.message : error);
    throw new Error(`Gagal menghubungi atau memproses URL: ${error.message || error}`);
  }
}

module.exports = { scrapeKomiku };
