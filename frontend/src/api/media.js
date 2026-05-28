export const mediaUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'object') return mediaUrl(url.url);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
};
