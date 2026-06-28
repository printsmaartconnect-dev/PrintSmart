import { PricingService, PricingRecommendation } from "./pricing.service";
import { InventoryService, InventoryRecommendation } from "./inventory.service";
import fs from "fs";
import path from "path";

export interface AIRecommendation {
  type: "PRICING" | "INVENTORY" | "CUSTOMER" | "PRINTER" | "MARKETING" | "REVENUE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action: string;
}

export class RecommendationService {
  private static loadPrinterRules() {
    try {
      const filePath = path.resolve(__dirname, "../../knowledge/printer_rules.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")).rules || [];
      }
    } catch (err) {
      console.error("Failed to load printer rules:", err);
    }
    return [];
  }

  static async getRecommendations(metrics: any): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // 1. Gather Pricing Advisor recommendations
    const pricingRecs = PricingService.getRecommendations(metrics);
    recommendations.push(...pricingRecs);

    // 2. Gather Inventory Advisor recommendations
    const inventoryRecs = InventoryService.getRecommendations(metrics);
    recommendations.push(...inventoryRecs);

    // 3. Printer Advisor recommendations
    const printerRules = this.loadPrinterRules();
    metrics.printerStatus.forEach((printer: any) => {
      // Rule: Low ink level
      const inkRule = printerRules.find((r: any) => r.id === "PTR-01");
      if (inkRule && printer.inkLevel < inkRule.value) {
        recommendations.push({
          type: "PRINTER",
          priority: "HIGH",
          title: `Printer Alert: ${printer.printerName}`,
          description: `Ink level is critically low at ${printer.inkLevel}%.`,
          action: inkRule.recommendation
        });
      }

      // Rule: Maintenance check
      const maintRule = printerRules.find((r: any) => r.id === "PTR-02");
      if (maintRule && printer.pagesPrinted >= maintRule.value) {
        recommendations.push({
          type: "PRINTER",
          priority: "MEDIUM",
          title: `Maintenance Due: ${printer.printerName}`,
          description: `This printer has logged ${printer.pagesPrinted} prints since setup.`,
          action: maintRule.recommendation
        });
      }
    });

    if (metrics.printerStatus.length === 0) {
      recommendations.push({
        type: "PRINTER",
        priority: "LOW",
        title: "Setup Printer Integration",
        description: "No printer metrics have been logged in the system yet.",
        action: "Connect your printers via the local QZ-Tray agent in your Settings panel."
      });
    }

    // 4. Customer Advisor recommendations
    if (metrics.topCustomers.length > 0) {
      const topCust = metrics.topCustomers[0];
      recommendations.push({
        type: "CUSTOMER",
        priority: "MEDIUM",
        title: "Reward Loyalty",
        description: `Customer "${topCust.name}" is your highest spender this month (total spend: ₹${topCust.spend.toFixed(2)}).`,
        action: "Offer a free high-quality binder or a 10% discount on their next print order to maintain customer loyalty."
      });
    }

    // 5. Marketing Advisor recommendations
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMonth = tomorrow.getMonth() + 1;

    if (tomorrowMonth === 2 || tomorrowMonth === 3 || tomorrowMonth === 4) {
      recommendations.push({
        type: "MARKETING",
        priority: "MEDIUM",
        title: "Student Exam Promotion",
        description: "Exam season is approaching. Print demand for textbooks and past exams will spike.",
        action: "Create a flyer or WhatsApp post offering 'Bulk Copy Discount for Students' and share with nearby test preparation centers."
      });
    } else {
      recommendations.push({
        type: "MARKETING",
        priority: "LOW",
        title: "Promote Digital Uploads",
        description: "Encourage customers to bypass queues by uploading files online.",
        action: "Print the shop's personalized QR Code banner and display it on the front desk to guide walk-in customers."
      });
    }

    // 6. Revenue Advisor recommendations
    if (metrics.revenue.growth < 0) {
      recommendations.push({
        type: "REVENUE",
        priority: "HIGH",
        title: "Address Weekly Downturn",
        description: `Your weekly print volume has decreased by ${Math.abs(metrics.revenue.growth).toFixed(1)}% compared to last week.`,
        action: "Review pending orders in the queue and accelerate processing. Contact any regular corporate accounts for fresh orders."
      });
    } else {
      recommendations.push({
        type: "REVENUE",
        priority: "LOW",
        title: "Revenue Streams Optimization",
        description: "Weekly revenues are growing steadily. Maximize profitability by auditing high-cost items.",
        action: "Review your purchase cost for paper packs and look for wholesale suppliers to increase overall markup margins."
      });
    }

    // Sort by priority (HIGH -> MEDIUM -> LOW)
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return recommendations.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }
}
