const { customSearch } = require('./contentEnhancer');

const customSearch = google.customsearch('v1');

const searchGoogle = async (query) => {
  try {
    const res = await customSearch.cse.list({
      cx: process.env.GOOGLE_CSE_ID,
      q: query,
      auth: process.env.GOOGLE_API_KEY,
      num: 5,
    });

    if (!res.data.items) return [];

    const links = res.data.items
      .filter(
        (item) =>
          !item.link.includes('youtube.com') &&
          !item.link.includes('facebook.com') &&
          !item.link.includes('www.amazon.com') &&
          !item.link.includes('medium.com') &&
          !item.link.includes('www.weforum.org')
      )
      .slice(0, 2)
      .map((item) => item.link);

    return links;
  } catch (error) {
    console.error('Error searching Google:', error.message);
    return [];
  }
};
exports.searchGoogle = searchGoogle;
