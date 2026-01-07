import { releasePendingOrders } from "../Services/stockCleanup.service.js";
import { env } from "process";

const INTERVAL_MS = 60 * 1000; // Run every 1 minute

export function initCronJobs() {
    console.log("Initializing background cron jobs...");

    // Job 1: Stock Release
    // Runs every minute, checks for orders older than 15 mins
    setInterval(async () => {
        try {
            // Logic: Release orders pending for > 15 minutes
            const result = await releasePendingOrders(15);
            if (result.processedCount > 0) {
                console.log(`[Cron] Stock Release: ${result.message}`);
            }
        } catch (error) {
            console.error("[Cron] Stock Release Job Failed:", error.message);
        }
    }, INTERVAL_MS);

    console.log("Background jobs scheduled.");
}
