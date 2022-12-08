import { View, Image, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import React, { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { LoadingSpinner } from "../core/components";
import { IOScrollView } from "react-native-intersection-observer";
import {
    getParsedArticleFromURLSelector,
    totalParagraphsForCurrentArticleSelector,
    paragraphsReadForCurrentArticleSelector,
    currentArticleReadingProgressSelector,
    currentArticleAtom,
} from "./article-state";

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
