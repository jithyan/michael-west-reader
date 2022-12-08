import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { ArticleDescription } from "../LatestArticlesScreen/articles-list-page-parser";
import { parseArticle } from "./article-page-parser";
import { Map, Set } from "immutable";

export const currentArticleAtom = atom<Partial<Readonly<ArticleDescription>>>({
    key: "currentArticle",
    default: null,
});

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

export const paragraphsReadForCurrentArticleSelector = selector<
    number | string
>({
    key: "paragraphsReadForCurrentArticle",
    get: ({ get }) => {
        const currentArticle = get(currentArticleAtom);

        if (!currentArticle?.id) {
            return null;
        }

        return get(paragraphsReadAtom).get(currentArticle.id)?.size ?? 0;
    },
    set: ({ set, get }, id: string) => {
        const currentArticle = get(currentArticleAtom);
        if (!currentArticle?.id) {
            return;
        }
        set(paragraphsReadAtom, (prev) =>
            prev.set(
                currentArticle.id,
                prev.get(currentArticle.id, Set<string>()).add(id)
            )
        );
    },
});

export const totalNumParagraphsAtom = atom({
    key: "totalNumParagraphs",
    default: Map<string, number>(),
});

export const totalParagraphsForCurrentArticleSelector = selector<number>({
    key: "totalParagraphsForCurrentArticleSelector",
    get: ({ get }) => {
        const currentArticle = get(currentArticleAtom);

        if (!currentArticle?.id) {
            return -1;
        }

        return get(totalNumParagraphsAtom).get(currentArticle.id, -1);
    },
    set: ({ set, get }, totalNum: number) => {
        const currentArticle = get(currentArticleAtom);
        if (!currentArticle?.id) {
            return;
        }
        set(totalNumParagraphsAtom, (prev) =>
            prev.set(currentArticle.id, totalNum)
        );
    },
});

export const currentArticleReadingProgressSelector = selector<number>({
    key: "currentArticleReadingProgressAtom",
    get: ({ get }) => {
        const paragraphsRead = get(paragraphsReadForCurrentArticleSelector);
        const totalParagraphsInCurrentArticle = get(
            totalParagraphsForCurrentArticleSelector
        );

        if (
            Number.isInteger(paragraphsRead) &&
            Number.isInteger(totalParagraphsInCurrentArticle)
        ) {
            return paragraphsRead <= totalParagraphsInCurrentArticle - 1
                ? Math.round(
                      ((paragraphsRead as number) /
                          totalParagraphsInCurrentArticle) *
                          100
                  )
                : 100;
        }

        return 0;
    },
});

export const getParsedArticleFromURLSelector = selectorFamily({
    key: "parsedArticle",
    get: (storyURL: string) => async () => {
        return parseArticle(storyURL);
    },
});
