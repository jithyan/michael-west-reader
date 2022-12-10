import { parse, HTMLElement } from "node-html-parser";
import { ParsingError } from "../core/errors";
import { Category } from "./articles-list-page-api";
import { parse as dateParse, set } from "date-fns";

export function isArticleDescription(obj: any): obj is ArticleDescription {
    return (
        typeof obj === "object" &&
        Boolean(obj.id) &&
        Boolean(obj.title) &&
        Boolean(obj.storyURL)
    );
}

function parseDateWithoutTime(dateString: string): Date {
    return set(dateParse(dateString, "MMMM d, yyyy", new Date()), {
        hours: 23,
        minutes: 59,
    });
}

function parseDateWithTime(dateString: string): Date {
    return dateParse(dateString, "MMMM d, yyyy HH:mm", new Date());
}

class Article implements ArticleDescription {
    readonly title: string;
    readonly id: string;
    readonly imageURL: string;
    readonly summary: string;
    readonly published: string;
    readonly author: string;
    readonly storyURL: string;
    readonly category: Category;
    readonly date: Date;

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
        this.date =
            category === "news"
                ? parseDateWithTime(this.published)
                : parseDateWithoutTime(this.published);
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
    date: Date;
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
    const storyURL = h2Tag?.querySelector("a").getAttribute("href");

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
    return imgTag?.attributes.src?.trim() ?? "";
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
        console.log(e);
        throw new ParsingError(`Error parsing page for category ${category}`, {
            cause: e,
        });
    }
}
