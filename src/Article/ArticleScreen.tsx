import { View, Image, Text, ScrollView } from "react-native";
import parse, { NodeType } from "node-html-parser";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import React, { useEffect, useId } from "react";
import htmlToReactParser, {
    HTMLReactParserOptions,
    Element,
    domToReact,
} from "html-react-parser";
import {
    atom,
    DefaultValue,
    selector,
    selectorFamily,
    useRecoilValue,
    useSetRecoilState,
} from "recoil";
import { LoadingSpinner } from "../core/components";
import { ArticleDescription } from "../LatestArticlesScreen/articles-list-page-parser";
import { Map, Set } from "immutable";
import { IOScrollView, InView } from "react-native-intersection-observer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const currentArticleAtom = atom<Partial<Readonly<ArticleDescription>>>({
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

const paragraphsReadForCurrentArticleSelector = selector<number | string>({
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

const totalNumParagraphsAtom = atom({
    key: "totalNumParagraphs",
    default: Map<string, number>(),
});

const totalParagraphsForCurrentArticleSelector = selector<number>({
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

const currentArticleReadingProgressSelector = selector<number>({
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

const RegisterViewPortAwareness = ({ children }: { children: JSX.Element }) => {
    const id = useId();
    const setParagraphAsRead = useSetRecoilState(
        paragraphsReadForCurrentArticleSelector
    );

    return (
        <InView
            triggerOnce={true}
            onChange={(InView) => {
                if (InView) {
                    setParagraphAsRead(id);
                }
            }}
        >
            {children}
        </InView>
    );
};

const options: HTMLReactParserOptions = {
    replace: (domNode) => {
        if (
            domNode.nodeType === NodeType.TEXT_NODE &&
            typeof (domNode as any).data === "string" &&
            (domNode as any).data.trim() !== ""
        ) {
            return <Text>{(domNode as any).data.trim()}</Text>;
        } else if (domNode instanceof Element && domNode.attribs) {
            const { name, nodeType } = domNode;
            const { children } = domNode;

            const parseChildren = () => domToReact(children, options);

            switch (name) {
                case "blockquote":
                    if (domNode.attribs?.class?.includes("wp-embed")) {
                        return <></>;
                    }
                    return (
                        <View className="bg-gray-400 p-2 mx-4 my-4 rounded-md">
                            {parseChildren()}
                        </View>
                    );

                case "iframe":
                    return <></>;

                case "span":
                    return <Text>{parseChildren()}</Text>;

                case "a":
                    if ((domNode.firstChild as any)?.name === "img") {
                        return <>{parseChildren()}</>;
                    }
                    return (
                        <Text className="text-sky-600 underline">
                            {parseChildren()}
                        </Text>
                    );

                case "div":
                    if (domNode.attribs?.class === "molongui-clearfix") {
                        return <></>;
                    }
                    if (domNode.attribs.id?.startsWith("mab-")) {
                        return <></>;
                    }
                    if (domNode.attribs?.class?.includes("wp-embed")) {
                        console.log("dom", domNode.attribs?.class);
                        return <></>;
                    }
                    return <>{parseChildren()}</>;

                case "h1":
                    return (
                        <Text className=" text-purple-800 text-2xl font-extrabold">
                            {parseChildren()}
                        </Text>
                    );

                case "h2":
                case "h3":
                    return (
                        <Text className="text-lg font-bold mb-2 px-2 pt-1.5">
                            {parseChildren()}
                        </Text>
                    );

                case "img":
                    return (
                        <View className="my-8 px-2">
                            <Image
                                source={{ uri: domNode.attribs.src }}
                                className="aspect-video"
                            />
                        </View>
                    );

                case "emphasis":
                case "strong":
                    return (
                        <Text className="text-md font-semibold">
                            {" "}
                            {parseChildren()}{" "}
                        </Text>
                    );

                case "p":
                    return (
                        <RegisterViewPortAwareness>
                            <Text className=" text-base font-normal mb-2 p-2">
                                {parseChildren()}
                            </Text>
                        </RegisterViewPortAwareness>
                    );

                default:
                    return <></>;
            }
        } else {
            return <></>;
        }
    },
};

const getParsedArticleFromURLSelector = selectorFamily({
    key: "parsedArticle",
    get: (storyURL: string) => async () => {
        return parseArticle(storyURL);
    },
});

async function parseArticle(storyURL: string) {
    const response = await fetch(storyURL);
    const dom = parse(await response.text());
    const div = dom.getElementById("old-post");

    const coverImage = htmlToReactParser(
        dom
            .querySelector(".featured-image")
            .getElementsByTagName("img")
            .toString(),
        options
    ) as JSX.Element;

    const restOfBody = htmlToReactParser(
        div.toString(),
        options
    ) as JSX.Element;

    return {
        body: (
            <>
                <View>{coverImage}</View>
                <View>{restOfBody}</View>
            </>
        ),
        numParagraphs: div
            .getElementsByTagName("p")
            .map((e) => e.textContent?.trim())
            .filter(Boolean).length,
    };
}

function ArticleBody({ storyURL }: { storyURL: string }) {
    const { body, numParagraphs } = useRecoilValue(
        getParsedArticleFromURLSelector(storyURL)
    );

    const setTotalParagraphs = useSetRecoilState(
        totalParagraphsForCurrentArticleSelector
    );

    useEffect(() => {
        setTotalParagraphs(numParagraphs);
    }, [numParagraphs]);

    return body;
}

function PctRead({ id }: { id: string }) {
    const numRead = useRecoilValue(paragraphsReadForCurrentArticleSelector);
    const total = useRecoilValue(totalParagraphsForCurrentArticleSelector);
    const pct = useRecoilValue(currentArticleReadingProgressSelector);

    return (
        <View>
            <Text>
                r:{numRead} t:{total} {pct}%
            </Text>
        </View>
    );
}

type ArticleProps = NativeStackScreenProps<RootStackParamList, "ArticleScreen">;

export function ArticleScreen({ route }: ArticleProps) {
    const { storyURL, id, title } = route.params;
    const setCurrentArticle = useSetRecoilState(currentArticleAtom);

    useEffect(() => {
        setCurrentArticle({ id, storyURL, title });

        return () => {
            setCurrentArticle(null);
        };
    }, [id, storyURL, title, setCurrentArticle]);

    return (
        <View className="container bg-zinc-100 p-1">
            <PctRead id={id} />
            <IOScrollView>
                <ScrollView className="p-1">
                    <Text className="px-2 mt-2 mb-0.5 text-2xl font-extrabold">
                        {title}
                    </Text>
                    <React.Suspense
                        fallback={<LoadingSpinner text="Loading article..." />}
                    >
                        <ArticleBody storyURL={storyURL} />
                    </React.Suspense>
                </ScrollView>
            </IOScrollView>
        </View>
    );
}
