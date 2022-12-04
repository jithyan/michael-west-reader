import { parse, HTMLElement } from "node-html-parser";
import { ParsingError } from "../core/errors";
import { Category } from "./api";

class Article implements ArticleDescription {
    readonly title: string;
    readonly id: string;
    readonly imageURL: string;
    readonly summary: string;
    readonly published: string;
    readonly author: string;
    readonly storyURL: string;
    readonly category: Category;

    constructor(article: HTMLElement, category: Category) {
        const { storyURL, title } = extractTitleAndURLFromArticle(article);

        this.title = title;
        this.id = extractIdFromArticle(article);
        this.storyURL = storyURL;
        this.imageURL = extractImageURLFromArticle(article);
        this.summary = extractSummaryFromArticle(article);
        this.published = extractPublishedDateFromArticle(article);
        this.author = extractAuthorFromArticle(article);
        this.category = category;
    }
}

export interface ArticleDescription {
    title: string;
    id: string;
    imageURL: string;
    summary: string;
    published: string;
    author: string;
    storyURL: string;
    category: Category;
}

function parseArticle(
    article: HTMLElement,
    category: Category
): ArticleDescription {
    return new Article(article, category);
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

export function parseLatestArticlesHTMLPage(
    pageHTML: string,
    category: Category
): ArticleDescription[] {
    try {
        const dom = parse(pageHTML);
        const articles = dom.querySelectorAll("article") ?? [];
        const articleIds = new Set<string>();
        const uniqueArticles: ArticleDescription[] = [];

        for (const article of articles) {
            const id = extractIdFromArticle(article);
            if (!articleIds.has(id)) {
                articleIds.add(id);
                uniqueArticles.push(parseArticle(article, category));
            }
        }
        return uniqueArticles;
    } catch (e) {
        throw new ParsingError(`Error parsing page for category ${category}`, {
            cause: e,
        });
    }
}
