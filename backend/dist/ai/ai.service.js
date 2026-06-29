"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const contextBuilder_service_1 = require("./contextBuilder.service");
const systemPrompt_1 = require("./prompts/systemPrompt");
const db_1 = __importDefault(require("../../config/db"));
class AIService {
    static async callGemini(systemPrompt, userPrompt, isJson = false, clientApiKey) {
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
                        { text: `${systemPrompt}\n\nUser Inquiry:\n${userPrompt}` }
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
    }
    /**
     * Run the AI Chat interaction
     */
    static async chat(shopkeeperId, message, chatHistory = [], clientApiKey) {
        // 1. Build the dynamic business context
        const context = await contextBuilder_service_1.ContextBuilderService.buildContext(shopkeeperId);
        // 2. Inject context into system prompt
        const systemPrompt = systemPrompt_1.SYSTEM_PROMPT_CHAT.replace("{{BUSINESS_CONTEXT}}", JSON.stringify(context, null, 2));
        // 3. Format history and user prompt
        let formattedPrompt = "";
        if (chatHistory.length > 0) {
            formattedPrompt += "Previous conversation history:\n";
            chatHistory.forEach(h => {
                formattedPrompt += `${h.role === "user" ? "Shopkeeper" : "AI Copilot"}: ${h.content}\n`;
            });
            formattedPrompt += "\n";
        }
        formattedPrompt += `Current inquiry: ${message}`;
        // 4. Send request to Gemini
        let aiResponse = "";
        try {
            aiResponse = await this.callGemini(systemPrompt, formattedPrompt, false, clientApiKey);
        }
        catch (err) {
            console.error("Gemini Chat failed, using fallback rule-based response:", err);
            // Failover helper logic: if Gemini fails, generate a contextual local summary response
            aiResponse = this.generateFallbackResponse(context, message);
        }
        // 5. Log transaction in DB
        try {
            await db_1.default.aILog.create({
                data: {
                    shopkeeperId,
                    prompt: message,
                    response: aiResponse
                }
            });
        }
        catch (dbErr) {
            console.error("Failed to write AI log to database:", dbErr);
        }
        return aiResponse;
    }
    /**
     * Failover offline response generator if Gemini key is missing or API errors
     */
    static generateFallbackResponse(context, message) {
        const query = message.toLowerCase();
        if (query.includes("earn") || query.includes("revenue") || query.includes("sales")) {
            return `📊 **Revenue Report (Local System Offline Engine)**:
- Today's Revenue: **₹${context.revenue.today.toFixed(2)}**
- Yesterday's Revenue: **₹${context.revenue.yesterday.toFixed(2)}**
- Weekly Revenue: **₹${context.revenue.weekly.toFixed(2)}**
- Monthly Revenue: **₹${context.revenue.monthly.toFixed(2)}**
- Growth: **${context.revenue.growth >= 0 ? "+" : ""}${context.revenue.growth.toFixed(1)}%** compared to last week.`;
        }
        if (query.includes("customer")) {
            if (context.topServices.length > 0) {
                return `👥 **Customer Insights**:
Your top service volume is **${context.topServices[0].name}** with **${context.topServices[0].count} copies** printed this month. Keep customers engaged by maintaining printer paper feeds.`;
            }
            return "👥 No recent customer print patterns have been logged this week.";
        }
        if (query.includes("paper") || query.includes("inventory") || query.includes("stock")) {
            const lowItems = context.inventoryStatus.filter((i) => i.status === "LOW");
            if (lowItems.length > 0) {
                return `⚠️ **Critical Stock Alerts**:
${lowItems.map((i) => `- **${i.itemName}** is low: currently **${i.quantity} ${i.unit}** remaining.`).join("\n")}
Please reorder stock from your distributor panel immediately.`;
            }
            return "✅ **Inventory Status**: All monitored items are in safe quantities. Paper packs, toner volumes, and bindings look healthy.";
        }
        if (query.includes("health")) {
            return `❤️ **Business Health Dashboard**:
Your shop health score is **${context.businessHealthScore}/100**.
- Pending orders: **${context.orders.pending}**
- Weekly cancelled orders: **${context.orders.cancelledWeekly}**
- Color volume: **${context.colorPrintPercentage.toFixed(1)}%**`;
        }
        return `🤖 **PrintSmaart AI Copilot**:
I am currently operating in offline failover mode because your Google Gemini API key is not configured or reachable. 
- Business Health Score: **${context.businessHealthScore}/100**
- Today's Earnings: **₹${context.revenue.today.toFixed(2)}**
- Pending Orders: **${context.orders.pending}**
Please check your Gemini API key in the **Settings** panel to unlock full conversational AI capabilities.`;
    }
}
exports.AIService = AIService;
