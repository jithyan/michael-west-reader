import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    Share,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import { selectorFamily, useRecoilValue, useSetRecoilState } from "recoil";
import { IOScrollView } from "react-native-intersection-observer";
import { RootStackParamList } from "../../App";
import { ArticleText, LoadingSpinner, Show } from "~core/components";
import { ArticleDescription } from "~screens/LatestArticlesScreen/articles-list-page-parser";
import { DebugReadProgress } from "~core/debug";
import { totalParagraphsForCurrentArticleSelector } from "./article-state";
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
        <SafeAreaView className="container bg-zinc-200 p-1">
            <View>
                <Show when={false}>
                    <DebugReadProgress id={id} />
                </Show>
                <IOScrollView>
                    <ScrollView className="p-1">
                        <Text className="px-2 mt-0.5 mb-0.5 text-2xl font-extrabold">
                            {title}
                        </Text>
                        <ShareArticle storyURL={storyURL} />
                        <React.Suspense
                            fallback={
                                <LoadingSpinner text="Loading article..." />
                            }
                        >
                            <ArticleBody storyURL={storyURL} id={id} />
                            <SupportMichaelWestSection />
                        </React.Suspense>
                    </ScrollView>
                </IOScrollView>
            </View>
        </SafeAreaView>
    );
}

function ShareArticle({ storyURL }: { storyURL: string }) {
    return (
        <View className="flex items-start mt-2 ml-2">
            <Pressable
                onPress={() => {
                    Share.share({ url: storyURL, message: storyURL });
                }}
            >
                <ArticleText
                    textColor="text-gray-700"
                    textSize="text-xs"
                    fontWeight="font-bold"
                    textStyle="underline"
                    otherClassNames={[
                        "rounded-md",
                        "border-solid",
                        "border-2",
                        "border-gray-600",
                        "p-1",
                    ]}
                >
                    Share article
                </ArticleText>
            </Pressable>
        </View>
    );
}

function SupportMichaelWestSection() {
    return (
        <View className=" flex-none flex-col bg-amber-600 rounded-md p-4 -mt-2 mb-4">
            <Pressable
                onPress={() => {
                    Linking.openURL("https://michaelwest.com.au/support-us/");
                }}
            >
                <Text className="font-extrabold mb-1">
                    Don't pay so you can read it.
                </Text>
                <Text className=" font-semibold mb-1">
                    Pay so that{" "}
                    <Text className="font-semibold italic">everyone</Text> can.
                </Text>
                <Text className=" text-white">
                    Press here to become a supporter
                </Text>
            </Pressable>
        </View>
    );
}
