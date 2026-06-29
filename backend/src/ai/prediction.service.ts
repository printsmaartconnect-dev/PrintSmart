import fs from "fs";
import path from "path";

export interface PredictionData {
  tomorrowWorkload: {
    ordersCount: number;
    pagesCount: number;
    growthPercentage: number;
  };
  weeklyOutlook: {
    estimatedRevenue: number;
    projectedPagesCount: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    action: string;
  }>;
}

export class PredictionService {
  private static loadTrends() {
    try {
      const filePath = path.resolve(__dirname, "../../knowledge/seasonal_trends.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent).trends || [];
      }
    } catch (err) {
      console.error("Failed to load seasonal trends:", err);
    }
    return [];
  }

  static getPredictions(metrics: any): PredictionData {
    const trends = this.loadTrends();
    const recommendations: Array<{ title: string; description: string; action: string }> = [];

    // Calculate baseline tomorrow workload (avg based on last 30 days)
    const currentMonthOrdersCount = metrics.monthlyRevenue > 0 ? (metrics.monthlyRevenue / (metrics.avgOrderValue || 20)) : 10;
    const baselineDailyOrders = Math.max(Math.round(currentMonthOrdersCount / 30), 2);
    const baselineDailyPages = Math.round((metrics.totalWeeklyPages || 100) / 7);

    // Apply day of week and seasonal multipliers
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay(); // 0 is Sunday, 1 is Monday...
    const tomorrowMonth = tomorrow.getMonth() + 1; // 1-12

    let multiplier = 1.0;

    // Apply Day of Week trends
    const dayTrend = trends.find((t: any) => t.day_of_week && t.day_of_week.includes(tomorrowDay));
    if (dayTrend) {
      multiplier *= dayTrend.demand_multiplier;
      recommendations.push({
        title: dayTrend.name,
        description: `Tomorrow is a high-volume day of the week according to seasonal profiles.`,
        action: dayTrend.recommended_action
      });
    }

    // Apply Month/Season trends
    const monthTrend = trends.find((t: any) => t.month && t.month.includes(tomorrowMonth));
    if (monthTrend) {
      multiplier *= monthTrend.demand_multiplier;
      recommendations.push({
        title: monthTrend.name,
        description: `Current season sees a ${((monthTrend.demand_multiplier - 1) * 100).toFixed(0)}% demand lift.`,
        action: monthTrend.recommended_action
      });
    }

    const predictedOrders = Math.round(baselineDailyOrders * multiplier);
    const predictedPages = Math.round(baselineDailyPages * multiplier);
    const growthPct = (multiplier - 1.0) * 100;

    // Projected weekly outlook
    const estimatedWeeklyRevenue = metrics.weeklyRevenue > 0 ? metrics.weeklyRevenue * multiplier : 1500 * multiplier;
    const projectedPages = Math.round((metrics.totalWeeklyPages || 200) * multiplier);

    // Add generic forecast check
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Normal Demands Foreseen",
        description: "No significant seasonal spikes or weekend workload changes predicted for tomorrow.",
        action: "Focus on closing pending orders in the queue to maintain a clean backlog."
      });
    }

    return {
      tomorrowWorkload: {
        ordersCount: predictedOrders,
        pagesCount: predictedPages,
        growthPercentage: parseFloat(growthPct.toFixed(1))
      },
      weeklyOutlook: {
        estimatedRevenue: parseFloat(estimatedWeeklyRevenue.toFixed(2)),
        projectedPagesCount: projectedPages
      },
      recommendations
    };
  }
}
