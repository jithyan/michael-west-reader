import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom, DefaultValue, selectorFamily } from "recoil";
import { ArticleDescription } from "../LatestArticlesScreen/articles-list-page-parser";
import { parseArticle } from "./article-page-parser";
import { Map, Set } from "immutable";

type ParagraphsReadCacheObject = Record<string, string[]>;

export const paragraphsReadAtom = atom({
    key: "paragraphsRead",
    default: Map<string, Set<string>>(),
    effects: [
        ({ setSelf, onSet }) => {
            setSelf(
                AsyncStorage.getItem("paragraphsRead")
                    .then((item) => {
                        if (typeof item === "string") {
                            const storageItem = JSON.parse(
                                item
                            ) as ParagraphsReadCacheObject;
                            return Map(
                                Object.keys(storageItem).map((key) => [
                                    key,
                                    Set(storageItem[key]),
                                ])
                            );
                        }
                        return new DefaultValue();
                    })
                    .catch((e) => {
                        console.error(
                            "Error grabbing storage for paragraphsRead",
                            e
                        );
                        return new DefaultValue();
                    })
            );

            onSet((newValue, _, isReset) => {
                isReset
                    ? AsyncStorage.removeItem("paragraphsRead")
                    : AsyncStorage.setItem(
                          "paragraphsRead",
                          JSON.stringify(
                              newValue
                                  .toArray()
                                  .reduce((prev, [key, value]) => {
                                      prev[key] = value.toJS() as string[];
                                      return prev;
                                  }, {} as ParagraphsReadCacheObject)
                          )
                      );
            });
        },
    ],
});

export const paragraphsReadForCurrentArticleSelector = selectorFamily<
    number | string,
    string
>({
    key: "paragraphsReadForCurrentArticle",
    get:
        (id) =>
        ({ get }) => {
            return get(paragraphsReadAtom).get(id)?.size ?? 0;
        },
    set:
        (storyId) =>
        ({ set }, paragraphId: string) => {
            set(paragraphsReadAtom, (prev) =>
                prev.set(
                    storyId,
                    prev.get(storyId, Set<string>()).add(paragraphId)
                )
            );
        },
});

type TotalParagraphsCacheObject = Record<string, number>;

export const totalNumParagraphsAtom = atom({
    key: "totalNumParagraphs",
    default: Map<string, number>(),
    effects: [
        ({ setSelf, onSet }) => {
            setSelf(
                AsyncStorage.getItem("totalNumParagraphs")
                    .then((item) => {
                        if (typeof item === "string") {
                            const storageItem = JSON.parse(
                                item
                            ) as TotalParagraphsCacheObject;
                            return Map(
                                Object.keys(storageItem).map((key) => [
                                    key,
                                    storageItem[key],
                                ])
                            );
                        }
                        return new DefaultValue();
                    })
                    .catch((e) => {
                        console.error(
                            "Error grabbing storage for paragraphsRead",
                            e
                        );
                        return new DefaultValue();
                    })
            );

            onSet((newValue, _, isReset) => {
                isReset
                    ? AsyncStorage.removeItem("totalNumParagraphs")
                    : AsyncStorage.setItem(
                          "totalNumParagraphs",
                          JSON.stringify(
                              newValue.toJSON() as TotalParagraphsCacheObject
                          )
                      );
            });
        },
    ],
});

export const totalParagraphsForCurrentArticleSelector = selectorFamily<
    number,
    string
>({
    key: "totalParagraphsForCurrentArticleSelector",
    get:
        (storyId) =>
        ({ get }) => {
            return get(totalNumParagraphsAtom).get(storyId, -1);
        },
    set:
        (storyId) =>
        ({ set, get }, totalNum: number) => {
            set(totalNumParagraphsAtom, (prev) => prev.set(storyId, totalNum));
        },
});

export const currentArticleReadingProgressSelector = selectorFamily<
    number,
    string
>({
    key: "currentArticleReadingProgressAtom",
    get:
        (storyId) =>
        ({ get }) => {
            const paragraphsRead = get(
                paragraphsReadForCurrentArticleSelector(storyId)
            );
            const totalParagraphsInCurrentArticle = get(
                totalParagraphsForCurrentArticleSelector(storyId)
            );

            if (totalParagraphsInCurrentArticle < 1) {
                return 0;
            }

            if (
                Number.isInteger(paragraphsRead) &&
                Number.isInteger(totalParagraphsInCurrentArticle)
            ) {
                return Math.round(
                    ((paragraphsRead as number) /
                        totalParagraphsInCurrentArticle) *
                        100
                );
            }

            return 0;
        },
});

export const getParsedArticleFromURLSelector = selectorFamily({
    key: "parsedArticle",
    get: (args: Pick<ArticleDescription, "id" | "storyURL">) => async () => {
        return parseArticle(args);
    },
});
