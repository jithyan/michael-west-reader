const LATEST_STORIES_BASE_URL = "https://michaelwest.com.au/category/aap-news/";

function getUrlForLatestStoriesPage(pageNumber: number): string {
    if (typeof pageNumber !== "number" || pageNumber < 1) {
        throw new Error("Unexpected page number: " + pageNumber);
    }

    if (pageNumber === 1) {
        return LATEST_STORIES_BASE_URL;
    }

    return `${LATEST_STORIES_BASE_URL}page/${pageNumber}/`;
}

export async function getLatestStoriesPage(
    page: number = 1
): Promise<[true, string] | [false, undefined]> {
    try {
        const response = await fetch(getUrlForLatestStoriesPage(page));
        const body = await response.text();
        return [true, body];
    } catch (e) {
        console.error(e);
        return [false, undefined];
    }
}
