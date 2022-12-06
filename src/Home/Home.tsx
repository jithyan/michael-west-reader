import React, { Suspense } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    Image,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { atom, useAtom } from "jotai";
import { getLatestArticlesHTMLPageForCategory } from "./api";
import { ArticleDescription, parseLatestArticlesHTMLPage } from "./parser";
import { toSentenceCase } from "../core/util";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

const latestArticlesList = atom(async (get) => {
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
            <View className="flex-initial flex-row p-1" key={id}>
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
    const [latestStories] = useAtom(latestArticlesList);

    return (
        <FlatList
            data={latestStories}
            renderItem={({ item }) => (
                <Story
                    {...item}
                    onTouch={() => {
                        navigation.navigate("Article", {
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

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export function Home({ route, navigation }: HomeProps) {
    return (
        <SafeAreaView className="container bg-stone-800">
            <Suspense fallback={<ActivityIndicator size="large" />}>
                <LatestArticles navigation={navigation} />
            </Suspense>
        </SafeAreaView>
    );
}
