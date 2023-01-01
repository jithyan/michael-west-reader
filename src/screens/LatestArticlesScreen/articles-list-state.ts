import { compareDesc } from "date-fns";
import { atom, selector, useRecoilState } from "recoil";
import { paragraphsReadAtom } from "~screens/ArticleScreen/article-state";
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

export const latestArticlesListSelector = selector({
    key: "latestArticlesList",
    get: async () => {
        const articles = await Promise.all([
            fetchAndParseArticles("story", 1),
            fetchAndParseArticles("story", 2),
            fetchAndParseArticles("news", 1),
            fetchAndParseArticles("news", 2),
            fetchAndParseArticles("news", 3),
            fetchAndParseArticles("news", 4),
            fetchAndParseArticles("news", 5),
        ]);

        const flattened = articles.flatMap((a) => a);
        flattened.sort((a, b) => compareDesc(a.date, b.date));

        const ids = new Set<string>();
        const uniqueArticles = flattened.filter((a) => {
            if (ids.has(a.id)) {
                return false;
            }
            ids.add(a.id);
            return true;
        });

        return uniqueArticles;
    },
});

export const filteredArticlesSelector = selector({
    key: "filteredArticles",
    get: async ({ get }) => {
        const articles = get(latestArticlesListSelector);
        const storiesOnly = get(storiesOnlyAtom);
        const unreadOnly = get(unreadOnlyAtom);

        if (!storiesOnly && !unreadOnly) {
            return articles;
        }

        const paragraphsRead = get(paragraphsReadAtom);

        if (storiesOnly && unreadOnly) {
            return articles.filter(
                (a) => a.category === "story" && paragraphsRead.get(a.id, 0) < 1
            );
        }

        return articles.filter(
            (a) =>
                (storiesOnly && a.category === "story") ||
                (unreadOnly && paragraphsRead.get(a.id, 0) < 1)
        );
    },
});

const storiesOnlyAtom = atom({
    key: "storiesOnlyAtom",
    default: false,
});

const unreadOnlyAtom = atom({
    key: "unreadOnlyAtom",
    default: false,
});

export function useFilterState() {
    const [storiesOnly, setStoriesOnly] = useRecoilState(storiesOnlyAtom);
    const [unreadOnly, setUnreadOnly] = useRecoilState(unreadOnlyAtom);

    return {
        storiesOnly,
        unreadOnly,
        setStoriesOnly,
        setUnreadOnly,
    };
}
