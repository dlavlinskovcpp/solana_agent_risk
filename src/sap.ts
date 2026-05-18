export type SapTool = {
    id: string;
    name: string;
    description: string;
    category: "search" | "analysis" | "summary" | "payment";
};

export async function discoverSapTools(target: string): Promise<SapTool[]> {
    console.log("\n[SAP] Discovering tools for target:", target);

    const tools: SapTool[] = [
        {
            id: "sap-web-search",
            name: "Web Search Tool",
            description: "Searches public web information about a target",
            category: "search",
        },
        {
            id: "sap-risk-analyzer",
            name: "Risk Analyzer Tool",
            description: "Analyzes public signals and produces risk indicators",
            category: "analysis",
        },
        {
            id: "sap-summary-generator",
            name: "Summary Generator Tool",
            description: "Generates final AI-readable report",
            category: "summary",
        },
    ];

    console.log("[SAP] Found tools:", tools.map((tool) => tool.name).join(", "));

    return tools;
}

export function selectTool(tools: SapTool[], category: SapTool["category"]): SapTool {
    const tool = tools.find((item) => item.category === category);

    if (!tool) {
        throw new Error(`No SAP tool found for category: ${category}`);
    }

    console.log(`[SAP] Selected ${category} tool:`, tool.name);

    return tool;
}
