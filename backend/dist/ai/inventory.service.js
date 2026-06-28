"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class InventoryService {
    static loadRules() {
        try {
            const filePath = path_1.default.resolve(__dirname, "../../knowledge/inventory_rules.json");
            if (fs_1.default.existsSync(filePath)) {
                const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
                return JSON.parse(fileContent).rules || [];
            }
        }
        catch (err) {
            console.error("Failed to load inventory rules:", err);
        }
        return [];
    }
    static getRecommendations(metrics) {
        const rules = this.loadRules();
        const recommendations = [];
        const lowStockItems = metrics.inventoryStatus.filter((item) => item.status === "LOW");
        // Check specific items low stock rules
        lowStockItems.forEach((item) => {
            const matchingRule = rules.find((r) => r.item && item.itemName.toLowerCase().includes(r.item.toLowerCase()));
            recommendations.push({
                type: "INVENTORY",
                priority: "HIGH",
                title: `Low Stock: ${item.itemName}`,
                description: `Current quantity is only ${item.quantity} ${item.unit} (Threshold is ${item.minThreshold}).`,
                action: matchingRule ? matchingRule.recommendation : `Reorder ${item.itemName} immediately to prevent operational bottlenecks.`
            });
        });
        // Check overall paper stock estimation
        const totalWeeklyPages = metrics.totalWeeklyPages || 0;
        const paperPacks = metrics.inventoryStatus.find((item) => item.itemName.toLowerCase().includes("paper") || item.itemName.toLowerCase().includes("a4"));
        if (paperPacks) {
            // Estimate pages in stock (assuming 500 pages per pack)
            const estimatedPagesInStock = paperPacks.quantity * 500;
            const averageDailyUsage = totalWeeklyPages / 7;
            let daysRemaining = 99;
            if (averageDailyUsage > 0) {
                daysRemaining = estimatedPagesInStock / averageDailyUsage;
            }
            const daysRule = rules.find((r) => r.metric === "days_remaining");
            if (daysRule && daysRemaining < 7) {
                recommendations.push({
                    type: "INVENTORY",
                    priority: "HIGH",
                    title: "Critical Stock Runout",
                    description: `Current paper packs (${paperPacks.quantity}) will last approximately ${daysRemaining.toFixed(1)} days based on recent printing speeds.`,
                    action: daysRule.recommendation
                });
            }
        }
        if (recommendations.length === 0) {
            recommendations.push({
                type: "INVENTORY",
                priority: "LOW",
                title: "Inventory Stock Healthy",
                description: "All core inventory items are currently above safety thresholds.",
                action: "Do a weekly physical count audit to verify database stock numbers match real stock."
            });
        }
        return recommendations;
    }
}
exports.InventoryService = InventoryService;
