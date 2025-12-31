const { genAI } = require('./contentEnhancer');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const rewriteArticle = async (originalContent, externalContents) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
      You are an expert editor. 
      Original Article: "${originalContent.slice(0, 2000)}..."
      
      Reference Article 1: "${externalContents[0] || 'N/A'}"
      Reference Article 2: "${externalContents[1] || 'N/A'}"

      Task: Rewrite the original article to improve its formatting, depth, and quality based on the reference articles. 
      Ensure the tone is professional. 
      Return ONLY the new article content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini:', error.message);
    return originalContent;
  }
};
exports.rewriteArticle = rewriteArticle;
