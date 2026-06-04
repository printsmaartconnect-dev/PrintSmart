const prisma = require("../config/db");
const storageService = require("../services/storage.service");

/**
 * Helper to call the Google Gemini API
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {boolean} isJson 
 */
const callGemini = async (systemPrompt, userPrompt, isJson = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables. Please add it to your backend .env file.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nUser Input:\n${userPrompt}` }
        ]
      }
    ]
  };

  if (isJson) {
    requestBody.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response returned from Gemini API");
  }
  return text;
};

/**
 * Suggest values for form fields using Gemini
 */
exports.suggestPrompt = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required for prompt suggestions" });
    }

    const systemPrompt = `You are an expert AI marketing copywriter and design consultant for a local print shop.
Given a promotion title, you must suggest intelligent values for a marketing form.
Your response must be a valid JSON object containing exactly these fields:
- businessDescription: a short creative marketing description promoting this offer (max 150 chars).
- audience: target audience (e.g. Students, Businesses, Wedding customers, General public).
- theme: visual theme style (e.g. Modern, Premium, Minimal, Festival, Vibrant, Student Friendly).
- cta: Call To Action button text (e.g. Visit Today, Order Now, Print Today).
- posterType: type of asset (e.g. Poster, Banner, Flyer, Social Media Post, WhatsApp Promotion).
- colorPalette: color preference description (e.g. Blue + Gold, Purple + White, Vibrant Red, Neon Green).
- language: language of marketing (e.g. English, Hindi, Marathi, Gujarati).

Ensure all values are highly relevant to the title and professional print shop marketing. Do not output anything other than the raw JSON object.`;

    const geminiResponse = await callGemini(systemPrompt, title, true);
    let parsedData;
    try {
      parsedData = JSON.parse(geminiResponse.trim());
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", geminiResponse);
      return res.status(500).json({ message: "Invalid JSON response from AI model", error: parseErr.message });
    }

    // Record usage
    const shopkeeperId = req.shopkeeper?.id;
    if (shopkeeperId) {
      await prisma.aIUsage.create({
        data: {
          shopkeeperId,
          featureType: "SUGGEST_PROMPT",
          generationCount: 1
        }
      });
    }

    return res.status(200).json(parsedData);
  } catch (err) {
    console.error("Suggest prompt controller error:", err);
    return res.status(500).json({ message: "Error generating prompt suggestions", error: err.message });
  }
};

/**
 * Helper to generate poster assets
 */
const generateAssetHelper = async (req, res, isRegenerate = false) => {
  try {
    const {
      title,
      businessName,
      description,
      language,
      audience,
      posterType,
      posterSize,
      themeStyle,
      colorPreference,
      cta
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required for generating a design" });
    }

    const shopkeeperId = req.shopkeeper?.id;
    if (!shopkeeperId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Step 1: Query Gemini to create an optimized text-to-image prompt.
    const systemPrompt = `You are a professional prompt engineer for AI image generators (like Midjourney or Stable Diffusion).
Your task is to take marketing form details and combine them into a single, highly descriptive, premium text-to-image prompt.
The generated prompt must describe a high-quality, professional marketing poster/banner.
Include specific directions for:
- Professional typography and clear text layout (e.g. "bold modern typography")
- Visual branding elements matching the theme, color palette, and language
- Composition, style (e.g., modern, minimal, vibrant), and lighting.
- Specify that it is a clean graphic design layout, not a photo of a poster. No low-quality or blurry text.
${isRegenerate ? "Create a slightly different design variation of this theme with unique layout elements." : ""}
Return ONLY the raw prompt string, nothing else. Do not include any explanations.`;

    const formDetails = `
Title: ${title}
Business Name: ${businessName || "PrintSmart Shop"}
Description: ${description || ""}
Language: ${language || "English"}
Audience: ${audience || "General Public"}
Poster Type: ${posterType || "Poster"}
Poster Size: ${posterSize || "A4"}
Theme Style: ${themeStyle || "Modern"}
Color Preference: ${colorPreference || "Vibrant Colors"}
CTA Button: ${cta || "Order Now"}
    `;

    const optimizedPrompt = await callGemini(systemPrompt, formDetails, false);
    const cleanOptimizedPrompt = optimizedPrompt.trim().replace(/^"|"$/g, ''); // strip optional surrounding quotes

    // Step 2: Formulate the image generation URL with a randomized seed
    const seed = Math.floor(Math.random() * 100000000);
    const width = posterSize === "Square Post" ? 800 : (posterSize === "Banner" ? 1200 : 800);
    const height = posterSize === "Square Post" ? 800 : (posterSize === "Banner" ? 500 : 1000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanOptimizedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    // Step 3: Fetch image from Pollinations AI
    const imgResponse = await fetch(pollinationsUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch generated image from Pollinations AI: ${imgResponse.statusText}`);
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 4: Save image via storageService
    const mockFile = {
      originalname: `ai_studio_${Date.now()}_${seed}.jpg`,
      buffer: buffer,
      mimetype: 'image/jpeg'
    };

    const uploadResult = await storageService.uploadFile(mockFile);
    const generatedImageUrl = uploadResult.fileUrl;

    // Step 5: Save record to AIAsset table
    const aiAsset = await prisma.aIAsset.create({
      data: {
        shopkeeperId,
        title,
        prompt: cleanOptimizedPrompt,
        type: posterType || "Poster",
        generatedImageUrl,
        thumbnailUrl: generatedImageUrl
      }
    });

    // Step 6: Record usage
    await prisma.aIUsage.create({
      data: {
        shopkeeperId,
        featureType: isRegenerate ? "REGENERATE" : "GENERATE",
        generationCount: 1
      }
    });

    return res.status(200).json({
      id: aiAsset.id,
      generatedImageUrl: aiAsset.generatedImageUrl,
      optimizedPrompt: cleanOptimizedPrompt
    });

  } catch (err) {
    console.error(`AI ${isRegenerate ? 'Regenerate' : 'Generate'} controller error:`, err);
    return res.status(500).json({ message: `Error occurred during design generation`, error: err.message });
  }
};

exports.generatePoster = async (req, res) => {
  return generateAssetHelper(req, res, false);
};

exports.regeneratePoster = async (req, res) => {
  return generateAssetHelper(req, res, true);
};

/**
 * Fetch generation history for shopkeeper
 */
exports.getHistory = async (req, res) => {
  try {
    const shopkeeperId = req.shopkeeper?.id;
    if (!shopkeeperId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const history = await prisma.aIAsset.findMany({
      where: { shopkeeperId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return res.status(200).json(history);
  } catch (err) {
    console.error("Get AI history controller error:", err);
    return res.status(500).json({ message: "Error fetching generation history", error: err.message });
  }
};
