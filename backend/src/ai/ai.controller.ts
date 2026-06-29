import { Request, Response } from "express";
import { ContextBuilderService } from "./contextBuilder.service";
import { RecommendationService } from "./recommendation.service";
import { PredictionService } from "./prediction.service";
import { AIService } from "./ai.service";
import prisma from "../../config/db";

const socketService = require("../../services/socket.service");

export class AICopilotController {
  /**
   * Fetch consolidated AI Dashboard metrics, recommendations, and predictions
   */
  static async getDashboardData(req: Request & { shopkeeper?: any }, res: Response) {
    try {
      const shopkeeperId = req.shopkeeper?.id;
      if (!shopkeeperId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // 1. Build business context (calculates analytics & health score)
      const context = await ContextBuilderService.buildContext(shopkeeperId);

      // 2. Generate recommendations programmatically based on rules & context
      const recommendations = await RecommendationService.getRecommendations(context);

      // 3. Save recommendations to DB if they don't exist to track status
      for (const rec of recommendations) {
        const existing = await prisma.aIRecommendation.findFirst({
          where: {
            shopkeeperId,
            title: rec.title,
            status: "PENDING"
          }
        });

        if (!existing) {
          await prisma.aIRecommendation.create({
            data: {
              shopkeeperId,
              type: rec.type,
              priority: rec.priority,
              title: rec.title,
              description: rec.description,
              action: rec.action,
              status: "PENDING"
            }
          });
        }
      }

      // Fetch saved active recommendations from DB (to include actual DB IDs for frontend action binding)
      const dbRecommendations = await prisma.aIRecommendation.findMany({
        where: {
          shopkeeperId,
          status: "PENDING"
        },
        orderBy: { createdAt: "desc" },
        take: 10
      });

      // 4. Generate forecast predictions
      const predictions = PredictionService.getPredictions(context);

      return res.status(200).json({
        summary: {
          revenueToday: context.revenue.today,
          revenueYesterday: context.revenue.yesterday,
          revenueWeekly: context.revenue.weekly,
          revenueMonthly: context.revenue.monthly,
          revenueGrowth: context.revenue.growth,
          averageOrderValue: context.revenue.averageOrderValue,
          pendingOrders: context.orders.pending,
          cancelledOrders: context.orders.cancelledWeekly,
          colorPrintPercentage: context.colorPrintPercentage
        },
        healthScore: context.businessHealthScore,
        inventory: context.inventoryStatus,
        printers: context.printerStatus,
        recommendations: dbRecommendations.map(r => ({
          id: r.id,
          type: r.type,
          priority: r.priority,
          title: r.title,
          description: r.description,
          action: r.action,
          status: r.status
        })),
        predictions
      });
    } catch (err: any) {
      console.error("AI Copilot Dashboard controller error:", err);
      return res.status(500).json({
        message: "Error fetching AI Copilot dashboard data",
        error: err.message
      });
    }
  }

  /**
   * Perform AI chat interactions with conversational business context
   */
  static async chat(req: Request & { shopkeeper?: any }, res: Response) {
    try {
      const shopkeeperId = req.shopkeeper?.id;
      if (!shopkeeperId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { message, history } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Chat message is required" });
      }

      const clientApiKey = req.headers["x-gemini-api-key"] as string | undefined;

      const aiReply = await AIService.chat(shopkeeperId, message, history || [], clientApiKey);

      return res.status(200).json({ response: aiReply });
    } catch (err: any) {
      console.error("AI Copilot Chat controller error:", err);
      return res.status(500).json({
        message: "Error processing chat session",
        error: err.message
      });
    }
  }

  /**
   * Action handler to apply recommendations (marks them as APPLIED)
   */
  static async applyRecommendation(req: Request & { shopkeeper?: any }, res: Response) {
    try {
      const shopkeeperId = req.shopkeeper?.id;
      if (!shopkeeperId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { recommendationId, actionTaken } = req.body;
      if (!recommendationId) {
        return res.status(400).json({ message: "Recommendation ID is required" });
      }

      const rec = await prisma.aIRecommendation.findUnique({
        where: { id: recommendationId }
      });

      if (!rec || rec.shopkeeperId !== shopkeeperId) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      // Mark applied
      await prisma.aIRecommendation.update({
        where: { id: recommendationId },
        data: { status: "APPLIED" }
      });

      // Log to history
      await prisma.recommendationHistory.create({
        data: {
          shopkeeperId,
          recommendationId,
          actionTaken: actionTaken || "APPLIED"
        }
      });

      // If inventory or pricing actions are taken, dynamically update database status
      if (rec.type === "INVENTORY" && rec.title.startsWith("Low Stock:")) {
        // Find item name
        const itemName = rec.title.replace("Low Stock: ", "");
        const item = await prisma.inventoryItem.findFirst({
          where: { shopkeeperId, itemName }
        });
        if (item) {
          // Mock order replenishment (increase quantity by 15)
          const updatedItem = await prisma.inventoryItem.update({
            where: { id: item.id },
            data: { quantity: item.quantity + 15 }
          });
          
          // Emit inventory-updated event!
          socketService.emitToRoom(`shop:${shopkeeperId}`, "inventory-updated", updatedItem);
        }
      }

      // Recalculate context & emit updated dashboard data instantly
      try {
        const updatedContext = await ContextBuilderService.buildContext(shopkeeperId);
        const updatedRecommendations = await RecommendationService.getRecommendations(updatedContext);
        const updatedPredictions = await PredictionService.getPredictions(updatedContext);
        
        const payload = {
          summary: {
            revenueToday: updatedContext.revenue.today,
            revenueYesterday: updatedContext.revenue.yesterday,
            revenueWeekly: updatedContext.revenue.weekly,
            revenueMonthly: updatedContext.revenue.monthly,
            revenueGrowth: updatedContext.revenue.growth,
            averageOrderValue: updatedContext.revenue.averageOrderValue,
            pendingOrders: updatedContext.orders.pending,
            cancelledOrders: updatedContext.orders.cancelledWeekly,
            colorPrintPercentage: updatedContext.colorPrintPercentage
          },
          inventory: updatedContext.inventoryStatus,
          printers: updatedContext.printerStatus,
          predictions: updatedPredictions,
          recommendations: updatedRecommendations,
          healthScore: updatedContext.businessHealthScore
        };
        
        socketService.emitToRoom(`shop:${shopkeeperId}`, "ai-summary-updated", payload);
      } catch (sumErr) {
        console.error("Failed to emit recalculated copilot dashboard state on recommendation application:", sumErr);
      }

      return res.status(200).json({
        message: "Recommendation action applied successfully",
        recommendationId
      });
    } catch (err: any) {
      console.error("Apply recommendation error:", err);
      return res.status(500).json({
        message: "Failed to apply recommendation action",
        error: err.message
      });
    }
  }
}
