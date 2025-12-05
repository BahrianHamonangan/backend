// utils/mangadex.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchMangaDetails(mangaId) {
  if (!mangaId) throw new Error('mangaId required');
  const apiUrl = `https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`MangaDex API responded ${res.status}`);
  const data = await res.json();
  const manga = data.data;
  const titleObj = manga.attributes.title || {};
  let title = titleObj.en || Object.values(titleObj)[0] || 'Unknown Title';
  let coverFileName = null;
  if (Array.isArray(data.included)) {
    const cover = data.included.find(i => i.type === 'cover_art' && i.attributes && i.attributes.fileName);
    if (cover) coverFileName = cover.attributes.fileName;
  }
  let coverUrl = null;
  if (coverFileName) {
    coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;
  }
  return {
    title,
    coverUrl,
    mangaUrl: `https://mangadex.org/title/${mangaId}`
  };
}

module.exports = { fetchMangaDetails };
