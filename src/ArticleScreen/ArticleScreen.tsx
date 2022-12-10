import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import React, { useEffect } from "react";
import { selectorFamily, useRecoilValue, useSetRecoilState } from "recoil";
import { LoadingSpinner } from "../core/components";
import { IOScrollView } from "react-native-intersection-observer";
import {
    totalParagraphsForCurrentArticleSelector,
    paragraphsReadForCurrentArticleSelector,
    currentArticleReadingProgressSelector,
} from "./article-state";
import { ArticleDescription } from "../LatestArticlesScreen/articles-list-page-parser";
import { parseArticle } from "./article-page-parser";

export const getParsedArticleFromURLSelector = selectorFamily({
    key: "parsedArticle",
    get: (args: Pick<ArticleDescription, "id" | "storyURL">) => async () => {
        return parseArticle(args);
    },
});

function ArticleBody(props: Pick<ArticleDescription, "id" | "storyURL">) {
    const { body, numParagraphs } = useRecoilValue(
        getParsedArticleFromURLSelector(props)
    );

    const setTotalParagraphs = useSetRecoilState(
        totalParagraphsForCurrentArticleSelector(props.id)
    );

    useEffect(() => {
        setTotalParagraphs(numParagraphs);
    }, [numParagraphs]);

    return body;
}

function PctRead({ id }: { id: string }) {
    const numRead = useRecoilValue(paragraphsReadForCurrentArticleSelector(id));
    const total = useRecoilValue(totalParagraphsForCurrentArticleSelector(id));
    const pct = useRecoilValue(currentArticleReadingProgressSelector(id));

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
                        <ArticleBody storyURL={storyURL} id={id} />
                    </React.Suspense>
                </ScrollView>
            </IOScrollView>
        </View>
    );
}
