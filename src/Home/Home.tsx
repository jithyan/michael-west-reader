import React, { Suspense } from "react";
import { SafeAreaView, ScrollView, Text, View, Image } from "react-native";
import { atom, useAtom } from "jotai";

import { LoadingSpinner } from "../core/components";
import { getLatestStoriesPage } from "./api";
import { parseLatestStoriesPage } from "./parser";

const latestArticlesList = atom(async (get) => {
    const [success, pageBody] = await getLatestStoriesPage();
    if (success) {
        return parseLatestStoriesPage(pageBody);
    }
    return Promise.reject("Failed to fetch latest stories");
});

function LatestStories() {
    const [latestStories] = useAtom(latestArticlesList);

    return (
        <ScrollView className="bg-stone-800 ">
            {latestStories.map(({ id, title, imageURL, author, published }) => (
                <View
                    className="flex-initial flex-row "
                    onTouchStart={() => {}}
                    key={id}
                >
                    <View className="basis-2/3 p-2">
                        <Text className="text-zinc-300 font-extrabold text-xl">
                            {title}
                        </Text>
                        <View className="flex-initial flex-row">
                            <Text className="text-zinc-300 font-light text-xs">
                                {author.trim()}
                            </Text>
                            <Text className="text-zinc-300 font-light text-xs">
                                {published.trim()}
                            </Text>
                        </View>
                    </View>
                    <Image className="basis-1/3" source={{ uri: imageURL }} />
                </View>
            ))}
        </ScrollView>
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
