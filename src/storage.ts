import fs from "fs";
import path from "path";

export async function saveJsonReport(
    report: unknown,
    prefix: string = "workflow",
): Promise<string> {
    const runsDir = path.join(process.cwd(), "runs");

    if (!fs.existsSync(runsDir)) {
        fs.mkdirSync(runsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(runsDir, `${prefix}-${timestamp}.json`);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");

    return filePath;
}

export async function saveTextReport(
    content: string,

    prefix: string = "workflow",

    extension: string = "md",
): Promise<string> {
    const runsDir = path.join(process.cwd(), "runs");

    if (!fs.existsSync(runsDir)) {
        fs.mkdirSync(runsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const filePath = path.join(runsDir, `${prefix}-${timestamp}.${extension}`);

    fs.writeFileSync(filePath, content, "utf-8");

    return filePath;
}
