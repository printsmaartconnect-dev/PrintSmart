import fs from "fs";
import path from "path";

export interface PricingRecommendation {
  type: "PRICING";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action: string;
}

export class PricingService {
  private static loadRules() {
    try {
      const filePath = path.resolve(__dirname, "../../knowledge/pricing_rules.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent).rules || [];
      }
    } catch (err) {
      console.error("Failed to load pricing rules:", err);
    }
    return [];
  }

  static getRecommendations(metrics: any): PricingRecommendation[] {
    const rules = this.loadRules();
    const recommendations: PricingRecommendation[] = [];

    // Rule: Color to B&W ratio
    const colorRatioRule = rules.find((r: any) => r.id === "PR-02");
    if (colorRatioRule && metrics.colorPrintPercentage > 0) {
      // Assuming a default B&W cost of Rs 2 and Color of Rs 5 if we don't have exact configs
      // If color print percentage is high, but color print premium ratio is low
      if (metrics.colorPrintPercentage > 40) {
        recommendations.push({
          type: "PRICING",
          priority: "MEDIUM",
          title: colorRatioRule.name,
          description: `Color prints account for ${metrics.colorPrintPercentage.toFixed(1)}% of your volume.`,
          action: colorRatioRule.recommendation
        });
      }
    }

    // Rule: Average Order Value pricing trigger
    const aovRule = rules.find((r: any) => r.id === "PR-01");
    if (aovRule && metrics.avgOrderValue < 50.0 && metrics.avgOrderValue > 0) {
      recommendations.push({
        type: "PRICING",
        priority: "HIGH",
        title: "Optimize Checkout Values",
        description: `Your average order value is ₹${metrics.avgOrderValue.toFixed(2)}, which is below target benchmarks.`,
        action: "Create a bundled offering (e.g. Spiral Binding + Glossy Cover for student reports) to raise average order sizes."
      });
    }

    // Rule: Bulk discount check
    const bulkRule = rules.find((r: any) => r.id === "PR-03");
    if (bulkRule) {
      const hasBulkOrders = metrics.topServices.some((s: any) => s.count > 100);
      if (hasBulkOrders) {
        recommendations.push({
          type: "PRICING",
          priority: "LOW",
          title: bulkRule.name,
          description: "High-volume orders detected in your transaction history.",
          action: bulkRule.recommendation
        });
      }
    }

    // Default recommendation if none triggered
    if (recommendations.length === 0) {
      recommendations.push({
        type: "PRICING",
        priority: "LOW",
        title: "Regular Pricing Audit",
        description: "Your pricing margins and average order values look stable.",
        action: "Run a monthly check of local competitor rates to ensure pricing is aligned with market rates."
      });
    }

    return recommendations;
  }
}
