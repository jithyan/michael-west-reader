import { NetworkError } from "../../core/errors";

type CategoriesBaseUrl = "https://michaelwest.com.au/category/";
type CategoriesSubPath = "aap-news/" | "latest-posts/";
type CategoriesFullPath = `${CategoriesBaseUrl}${CategoriesSubPath}`;
type CategoryFullPathWithPageNumber = `${CategoriesFullPath}page/${number}/`;

export type Category = "news" | "story";

const CategoryToSubPath = {
    news: "aap-news/",
    story: "latest-posts/",
} as const satisfies Record<Category, CategoriesSubPath>;

function getUrlForCategoryPage(
    path: CategoriesFullPath,
    pageNumber: number
): CategoryFullPathWithPageNumber | CategoriesFullPath {
    if (typeof pageNumber !== "number" || pageNumber < 1) {
        throw new Error("Unexpected page number: " + pageNumber);
    }

    if (pageNumber === 1) {
        return path;
    }

    return `${path}page/${pageNumber}/`;
}

export async function getLatestArticlesHTMLPageForCategory(
    category: keyof typeof CategoryToSubPath,
    page: number = 1
): Promise<string> {
    try {
        const response = await fetch(
            getUrlForCategoryPage(
                `https://michaelwest.com.au/category/${CategoryToSubPath[category]}`,
                page
            )
        );
        return response.text();
    } catch (e) {
        throw new NetworkError(
            `Error fetching page ${page} for category ${category}`,
            { cause: e }
        );
    }
}
