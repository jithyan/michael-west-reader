import React, { Suspense } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    Image,
    Pressable,
} from "react-native";
import { selector, useRecoilValue, useSetRecoilState } from "recoil";
import { getLatestArticlesHTMLPageForCategory } from "./articles-list-page-api";
import {
    ArticleDescription,
    parseLatestArticlesHTMLPage,
} from "./articles-list-page-parser";
import { toSentenceCase } from "../core/util";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { LoadingSpinner } from "../core/components";

export const latestArticlesList = selector({
    key: "latestArticlesList",
    get: async () => {
        const articles = await Promise.all([
            getLatestArticlesHTMLPageForCategory("news").then(
                (latestNewsPageBody) =>
                    parseLatestArticlesHTMLPage(latestNewsPageBody, "news")
            ),
            getLatestArticlesHTMLPageForCategory("story").then(
                (latestStoriesPageBody) =>
                    parseLatestArticlesHTMLPage(latestStoriesPageBody, "story")
            ),
        ]);

        return articles.flatMap((a) => a);
    },
});

function Story({
    id,
    title,
    imageURL,
    author,
    published,
    category,
    onTouch,
}: ArticleDescription & { onTouch: () => void }) {
    return (
        <Pressable onPress={onTouch}>
            <View
                className="flex-initial flex-row p-1 my-1 border-solid border-b-2 border-slate-500"
                key={id}
            >
                <View className="basis-2/3">
                    <Text className="text-zinc-200 bg-orange-400 rounded-lg text-center">
                        {toSentenceCase(category)}
                    </Text>
                    <Text className="text-zinc-300 font-extrabold text-xl p-0.5">
                        {title}
                    </Text>
                    <View className="flex-initial flex-row">
                        <Text className="text-zinc-300 font-light text-xs mr-1">
                            {author}
                        </Text>
                        <Text className="text-zinc-300 font-light text-xs">
                            {published}
                        </Text>
                    </View>
                </View>
                <View className="basis-1/3 p-1">
                    <Image
                        className="aspect-square rounded-md"
                        source={{ uri: imageURL }}
                    />
                </View>
            </View>
        </Pressable>
    );
}

function LatestArticles({ navigation }: Pick<HomeProps, "navigation">) {
    const latestStories = useRecoilValue(latestArticlesList);

    return (
        <FlatList
            className=" mt-8 mb-8"
            data={latestStories}
            renderItem={({ item }) => (
                <Story
                    {...item}
                    onTouch={() => {
                        navigation.navigate("ArticleScreen", {
                            id: item.id,
                            storyURL: item.storyURL,
                            title: item.title,
                        });
                    }}
                />
            )}
            keyExtractor={(item) => item.id}
        />
    );
}

type HomeProps = NativeStackScreenProps<
    RootStackParamList,
    "LatestArticlesList"
>;

export function LatestArticlesScreen({ route, navigation }: HomeProps) {
    return (
        <SafeAreaView className="container bg-stone-800 px-4 py-2">
            <Suspense
                fallback={<LoadingSpinner text="Fetching latest articles..." />}
            >
                <LatestArticles navigation={navigation} />
            </Suspense>
        </SafeAreaView>
    );
}
