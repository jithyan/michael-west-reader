import { compareDesc } from "date-fns";
import { selector } from "recoil";
import {
    Category,
    getLatestArticlesHTMLPageForCategory,
} from "./articles-list-page-api";
import { parseLatestArticlesHTMLPage } from "./articles-list-page-parser";

const fetchAndParseArticles = (category: Category, pageNumber: number) =>
    getLatestArticlesHTMLPageForCategory(category, pageNumber).then(
        (latestNewsPageBody) =>
            parseLatestArticlesHTMLPage(latestNewsPageBody, category)
    );

export const latestArticlesList = selector({
    key: "latestArticlesList",
    get: async () => {
        const articles = await Promise.all([
            fetchAndParseArticles("news", 1),
            fetchAndParseArticles("news", 2),
            fetchAndParseArticles("news", 3),
            fetchAndParseArticles("news", 4),
            fetchAndParseArticles("news", 5),
            fetchAndParseArticles("story", 1),
            fetchAndParseArticles("story", 2),
        ]);

        const flattened = articles.flatMap((a) => a);
        flattened.sort((a, b) => compareDesc(a.date, b.date));

        return flattened;
    },
});
