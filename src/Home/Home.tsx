import React, { Suspense } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
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
        <View className="flex-1 bg-stone-800 ">
            {latestStories.map(({ id, title, imageURL }) => (
                <View
                    className="grid grid-cols-2 gap-1"
                    onTouchStart={() => {}}
                    key={id}
                >
                    <Text className="text-zinc-300 font-extrabold text-xl">
                        {title}
                    </Text>
                    <Image
                        className="aspect-square"
                        source={{ uri: imageURL }}
                        style={{ width: 100, height: 100 }}
                    />
                </View>
            ))}
        </View>
    );
}

export function Home() {
    return (
        <View className="container flex-1 bg-slate">
            <Suspense fallback={<LoadingSpinner />}>
                <LatestStories />
            </Suspense>
        </View>
    );
}
