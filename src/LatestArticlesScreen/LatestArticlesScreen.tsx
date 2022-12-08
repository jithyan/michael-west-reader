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

function NewsItem({
    id,
    title,
    imageURL,
    author,
    published,
}: Omit<ArticleDescription, "category">) {
    return (
        <>
            <View className="basis-2/3">
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
            <View className="basis-1/3">
                <Text className="text-zinc-200 bg-orange-400 text-center text-xs">
                    News
                </Text>
                <Image
                    className="aspect-square rounded-md"
                    source={{ uri: imageURL }}
                />
            </View>
        </>
    );
}

function StoryItem({
    id,
    title,
    imageURL,
    author,
    published,
}: Omit<ArticleDescription, "category">) {
    return (
        <View className="flex-initial flex-col">
            <View className="bg-yellow-500 rounded-md px-0.5 pt-0.5">
                <Text className=" text-zinc-800 font-extrabold text-md px-2">
                    Story
                </Text>
                <View className=" basis-full my-0.5">
                    <Image
                        className="aspect-video rounded-md"
                        source={{ uri: imageURL }}
                    />
                </View>
            </View>
            <View className="basis-full  rounded-md  my-0.5">
                <Text className=" text-zinc-300 font-extrabold text-xl p-0.5">
                    {title}
                </Text>
            </View>
            <View className="flex-initial flex-row">
                <Text className="text-zinc-300 font-light text-xs mr-1">
                    {author}
                </Text>
                <Text className="text-zinc-300 font-light text-xs">
                    {published}
                </Text>
            </View>
        </View>
    );
}

function Article({
    category,
    onTouch,
    ...rest
}: ArticleDescription & { onTouch: () => void }) {
    return (
        <Pressable onPress={onTouch}>
            <View className="flex-initial flex-row px-1 py-2 my-1 border-solid border-b-2 border-slate-500">
                {category === "news" ? (
                    <NewsItem {...rest} />
                ) : (
                    <StoryItem {...rest} />
                )}
            </View>
        </Pressable>
    );
}

function LatestArticles({ navigation }: Pick<HomeProps, "navigation">) {
    const latestStories = useRecoilValue(latestArticlesList);

    return (
        <FlatList
            className="my-8"
            data={latestStories}
            renderItem={({ item }) => (
                <Article
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
        <SafeAreaView className="container bg-blue-900 px-4 py-2">
            <Suspense
                fallback={<LoadingSpinner text="Fetching latest articles..." />}
            >
                <LatestArticles navigation={navigation} />
            </Suspense>
        </SafeAreaView>
    );
}
