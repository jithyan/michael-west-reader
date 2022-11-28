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
    const title = h2Tag?.textContent;
    const storyURL = h2Tag?.querySelector("a")?.textContent;

    if (!Boolean(title) || !Boolean(storyURL)) {
        throw new Error("Parsing error: Article heading  not present");
    }

    return {
        title,
        storyURL,
    };
}

function extractIdFromArticle(article: HTMLElement): string {
    return article.id;
}

function extractImageURLFromArticle(article: HTMLElement): string {
    const imgTag = article.querySelector("img");
    return imgTag.attributes.src ?? "";
}

function extractSummaryFromArticle(article: HTMLElement): string {
    return article.querySelector(".entry-summary")?.textContent ?? "";
}

function extractPublishedDateFromArticle(article: HTMLElement): string {
    return article.querySelector(".published").textContent ?? "";
}

function extractAuthorFromArticle(article: HTMLElement): string {
    return article.querySelector(".author")?.textContent ?? "";
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
