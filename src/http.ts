export async function getJson<T>(
    url: string,
    headers: Record<string, string> = {},
): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...headers,
        },
    });

    if (!response.ok) {
        const body = await response.text();

        throw new Error(
            `HTTP request failed: ${response.status} ${response.statusText}\n${body}`,
        );
    }

    return (await response.json()) as T;
}
