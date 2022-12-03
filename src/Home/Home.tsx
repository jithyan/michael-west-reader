import React, { Suspense } from "react";
import { SafeAreaView, FlatList, Text, View, Image } from "react-native";
import { atom, useAtom } from "jotai";

import { LoadingSpinner } from "../core/components";
import { getLatestArticlesHTMLPageForCategory } from "./api";
import { ArticleDescription, parseLatestNewsPage } from "./parser";

const latestArticlesList = atom(async (get) => {
    const articles = await Promise.all([
        getLatestArticlesHTMLPageForCategory("news").then(
            (latestNewsPageBody) =>
                parseLatestNewsPage(latestNewsPageBody, "news")
        ),
        getLatestArticlesHTMLPageForCategory("stories").then(
            (latestStoriesPageBody) =>
                parseLatestNewsPage(latestStoriesPageBody, "stories")
        ),
    ]);

    return articles.flatMap((a) => a);
});

function Story({ id, title, imageURL, author, published }: ArticleDescription) {
    return (
        <View
            className="flex-initial flex-row p-1"
            onTouchStart={() => {}}
            key={id}
        >
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
            <Image className="basis-1/3" source={{ uri: imageURL }} />
        </View>
    );
}

function LatestStories() {
    const [latestStories] = useAtom(latestArticlesList);

    return (
        <FlatList
            data={latestStories}
            renderItem={({ item }) => <Story {...item} />}
            keyExtractor={(item) => item.id}
            className="bg-stone-800 "
        />
    );
}

export function Home() {
    return (
        <SafeAreaView className="container">
            <Suspense fallback={<LoadingSpinner />}>
                <LatestStories />
            </Suspense>
        </SafeAreaView>
    );
}
