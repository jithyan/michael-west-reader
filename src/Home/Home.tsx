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
        <>
            {latestStories.map(({ id, title, imageURL }) => (
                <View onTouchStart={() => {}} key={id}>
                    <Image
                        source={{ uri: imageURL }}
                        style={{ width: 400, height: 200 }}
                    />
                    <Text>{title}</Text>
                </View>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});

export function Home() {
    return (
        <View style={styles.container}>
            <Suspense fallback={<LoadingSpinner />}>
                <LatestStories />
            </Suspense>
        </View>
    );
}
