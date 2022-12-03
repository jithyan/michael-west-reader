import React, { Suspense } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    Image,
    ActivityIndicator,
} from "react-native";
import { atom, useAtom } from "jotai";
import { getLatestArticlesHTMLPageForCategory } from "./api";
import { ArticleDescription, parseLatestNewsPage } from "./parser";
import { toSentenceCase } from "../core/util";
import { Map } from "immutable";

const latestArticlesList = atom(async (get) => {
    const articles = await Promise.all([
        getLatestArticlesHTMLPageForCategory("news").then(
            (latestNewsPageBody) =>
                parseLatestNewsPage(latestNewsPageBody, "news")
        ),
        getLatestArticlesHTMLPageForCategory("story").then(
            (latestStoriesPageBody) =>
                parseLatestNewsPage(latestStoriesPageBody, "story")
        ),
    ]);

    return articles.flatMap((a) => a);
});

const articleStatus = atom(Map<string, { pctRead: number }>());

function Story({
    id,
    title,
    imageURL,
    author,
    published,
    category,
}: ArticleDescription) {
    return (
        <View
            className="flex-initial flex-row p-1"
            onTouchStart={() => {}}
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
    );
}

function LatestArticles() {
    const [latestStories] = useAtom(latestArticlesList);

    return (
        <FlatList
            data={latestStories}
            renderItem={({ item }) => <Story {...item} />}
            keyExtractor={(item) => item.id}
        />
    );
}

export function Home() {
    return (
        <SafeAreaView className="container bg-stone-800">
            <Suspense fallback={<ActivityIndicator size="large" />}>
                <LatestArticles />
            </Suspense>
        </SafeAreaView>
    );
}
