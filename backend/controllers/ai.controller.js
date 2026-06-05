const prisma = require("../config/db");
const storageService = require("../services/storage.service");

/**
 * Helper to call the Google Gemini API
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {boolean} isJson 
 */
const callGemini = async (systemPrompt, userPrompt, isJson = false, clientApiKey = null) => {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your backend .env file or supply it from the settings panel in the frontend.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
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

    const clientApiKey = req.headers["x-gemini-api-key"];
    const geminiResponse = await callGemini(systemPrompt, title, true, clientApiKey);
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

    const clientApiKey = req.headers["x-gemini-api-key"];
    const optimizedPrompt = await callGemini(systemPrompt, formDetails, false, clientApiKey);
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

exports.chatGenerate = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required for chat generation" });
    }

    const shopkeeperId = req.shopkeeper?.id;
    if (!shopkeeperId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const clientApiKey = req.headers["x-gemini-api-key"];

    // Step 1: Query Gemini to parse the natural prompt and return structured config & image prompt
    const systemPrompt = `You are an expert AI design coordinator and print optimization agent.
Your task is to take a natural language customer request describing a print job or poster they want to make, and convert it into a structured poster design configuration.
You must output a valid JSON object containing exactly these fields:
- headline: a short, bold, catchy main headline (max 50 chars).
- subheadline: a descriptive subtitle supporting the headline (max 80 chars).
- offerText: any discount, offer details, or key highlight (e.g. "50% OFF" or "Buy 1 Get 1 Free", max 30 chars).
- description: details about the event, menu, or business to display on the poster (max 200 chars).
- cta: CTA button text (e.g. "Visit Today", "Register Now", "Order Online", max 20 chars).
- theme: visual theme name matching the request (e.g. "Diwali Gold", "Sunset Red", "Corporate Blue", "Neon Party").
- imagePrompt: a highly descriptive prompt for a text-to-image generator (like Pollinations AI) to generate a premium graphic design background/layout matching the request. The prompt should specify clean graphic design layout, premium typography layout, specific color themes, and matching ornaments. Avoid photos of posters, avoid generic mockups, specify high-quality vector style or modern elegant background.

Do not output anything other than the raw JSON object.`;

    const geminiResponse = await callGemini(systemPrompt, prompt, true, clientApiKey);
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(geminiResponse.trim());
    } catch (parseErr) {
      console.error("Failed to parse Gemini chat response:", geminiResponse);
      return res.status(500).json({ message: "Invalid JSON configuration returned by AI model", error: parseErr.message });
    }

    // Step 2: Formulate the image generation URL with a randomized seed using the imagePrompt
    const seed = Math.floor(Math.random() * 100000000);
    const width = 800;
    const height = 1000;
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsedConfig.imagePrompt || prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    // Step 3: Fetch image from Pollinations AI
    const imgResponse = await fetch(pollinationsUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch generated image from Pollinations AI: ${imgResponse.statusText}`);
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 4: Save image via storageService
    const mockFile = {
      originalname: `ai_chat_studio_${Date.now()}_${seed}.jpg`,
      buffer: buffer,
      mimetype: 'image/jpeg'
    };

    const uploadResult = await storageService.uploadFile(mockFile);
    const generatedImageUrl = uploadResult.fileUrl;

    // Step 5: Save record to AIAsset table
    const aiAsset = await prisma.aIAsset.create({
      data: {
        shopkeeperId,
        title: parsedConfig.headline || "AI Conversational Design",
        prompt: parsedConfig.imagePrompt || prompt,
        type: "Poster",
        generatedImageUrl,
        thumbnailUrl: generatedImageUrl
      }
    });

    // Step 6: Record usage
    await prisma.aIUsage.create({
      data: {
        shopkeeperId,
        featureType: "GENERATE",
        generationCount: 1
      }
    });

    return res.status(200).json({
      id: aiAsset.id,
      generatedImageUrl: aiAsset.generatedImageUrl,
      config: {
        headline: parsedConfig.headline,
        subheadline: parsedConfig.subheadline,
        offerText: parsedConfig.offerText,
        description: parsedConfig.description,
        cta: parsedConfig.cta,
        theme: parsedConfig.theme
      }
    });

  } catch (err) {
    console.error("AI Chat generate controller error:", err);
    return res.status(500).json({ message: "Error occurred during chat design generation", error: err.message });
  }
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
