"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PricingService {
    static loadRules() {
        try {
            const filePath = path_1.default.resolve(__dirname, "../../knowledge/pricing_rules.json");
            if (fs_1.default.existsSync(filePath)) {
                const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
                return JSON.parse(fileContent).rules || [];
            }
        }
        catch (err) {
            console.error("Failed to load pricing rules:", err);
        }
        return [];
    }
    static getRecommendations(metrics) {
        const rules = this.loadRules();
        const recommendations = [];
        // Rule: Color to B&W ratio
        const colorRatioRule = rules.find((r) => r.id === "PR-02");
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
        const aovRule = rules.find((r) => r.id === "PR-01");
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
        const bulkRule = rules.find((r) => r.id === "PR-03");
        if (bulkRule) {
            const hasBulkOrders = metrics.topServices.some((s) => s.count > 100);
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
exports.PricingService = PricingService;
