import { parse, HTMLElement } from "node-html-parser";

export interface ArticleDescription {
    title: string;
    id: string;
    imageURL: string;
    summary: string;
    published: string;
    author: string;
    storyURL: string;
}

function parseArticle(article: HTMLElement): ArticleDescription {
    return {
        ...extractTitleAndURLFromArticle(article),
        id: extractIdFromArticle(article),
        imageURL: extractImageURLFromArticle(article),
        summary: extractSummaryFromArticle(article),
        published: extractPublishedDateFromArticle(article),
        author: extractAuthorFromArticle(article),
    };
}

function extractTitleAndURLFromArticle(article: HTMLElement): {
    title: string;
    storyURL: string;
} {
    const h2Tag = article.querySelector("h2");
    const title = h2Tag?.textContent?.trim();
    const storyURL = h2Tag?.querySelector("a")?.textContent?.trim();

    if (!Boolean(title) || !Boolean(storyURL)) {
        throw new Error("Parsing error: Article heading  not present");
    }

    return {
        title,
        storyURL,
    };
}

function extractIdFromArticle(article: HTMLElement): string {
    const id = article.id?.trim();
    if (!id) {
        throw new Error("Parsing error: Article id not present");
    }
    return id;
}

function extractImageURLFromArticle(article: HTMLElement): string {
    const imgTag = article.querySelector("img");
    return imgTag.attributes.src?.trim() ?? "";
}

function extractSummaryFromArticle(article: HTMLElement): string {
    return article.querySelector(".entry-summary")?.textContent?.trim() ?? "";
}

function extractPublishedDateFromArticle(article: HTMLElement): string {
    return article.querySelector(".published").textContent?.trim() ?? "";
}

function extractAuthorFromArticle(article: HTMLElement): string {
    return article.querySelector(".author")?.textContent?.trim() ?? "";
}

export function parseLatestStoriesPage(pageHTML: string): ArticleDescription[] {
    const dom = parse(pageHTML);
    const articles = dom.querySelectorAll("article") ?? [];
    const articleIds = new Set<string>();
    const uniqueArticles: ArticleDescription[] = [];

    for (const article of articles) {
        const id = extractIdFromArticle(article);
        if (!articleIds.has(id)) {
            articleIds.add(id);
            uniqueArticles.push(parseArticle(article));
        }
    }
    return uniqueArticles;
}
