import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import React, { useEffect } from "react";
import { selectorFamily, useRecoilValue, useSetRecoilState } from "recoil";
import { LoadingSpinner } from "../core/components";
import { IOScrollView } from "react-native-intersection-observer";
import { totalParagraphsForCurrentArticleSelector } from "./article-state";
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

type ArticleProps = NativeStackScreenProps<RootStackParamList, "ArticleScreen">;

export function ArticleScreen({ route }: ArticleProps) {
    const { storyURL, id, title } = route.params;

    return (
        <View className="container bg-zinc-200 p-1">
            <IOScrollView>
                <ScrollView className="p-1">
                    <Text className="px-2 mt-2 mb-0.5 text-2xl font-extrabold">
                        {title}
                    </Text>
                    <React.Suspense
                        fallback={<LoadingSpinner text="Loading article..." />}
                    >
                        <ArticleBody storyURL={storyURL} id={id} />
                        <View className=" flex-none flex-col">
                            <Pressable
                                className=" bg-amber-600 rounded-md p-4"
                                onPress={() => {
                                    Linking.openURL(
                                        "https://michaelwest.com.au/support-us/"
                                    );
                                }}
                            >
                                <Text className="font-extrabold mb-0.5">
                                    Don't pay so you can read it.
                                </Text>
                                <Text className=" font-semibold mb-0.5">
                                    Pay so that{" "}
                                    <Text className="font-semibold italic">
                                        everyone
                                    </Text>{" "}
                                    can.
                                </Text>
                                <Text className=" text-white">
                                    Press here to become a supporter
                                </Text>
                            </Pressable>
                        </View>
                    </React.Suspense>
                </ScrollView>
            </IOScrollView>
        </View>
    );
}
