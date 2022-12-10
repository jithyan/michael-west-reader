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
import {
    Category,
    getLatestArticlesHTMLPageForCategory,
} from "./articles-list-page-api";
import {
    ArticleDescription,
    parseLatestArticlesHTMLPage,
} from "./articles-list-page-parser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { LoadingSpinner } from "../core/components";
import { compareDesc } from "date-fns/esm";
import { format, getDayOfYear } from "date-fns";
import { currentArticleReadingProgressSelector } from "../ArticleScreen/article-state";

const fetchAndParseArticles = (category: Category, pageNumber: number) =>
    getLatestArticlesHTMLPageForCategory(category, pageNumber).then(
        (latestNewsPageBody) =>
            parseLatestArticlesHTMLPage(latestNewsPageBody, category)
    );

function addDateItems(
    articles: ArticleDescription[]
): Array<ArticleDescription | string> {
    let currentDay = -1;
    return articles
        .map((article, i) => {
            if (
                i === articles.length ||
                currentDay === getDayOfYear(article.date)
            ) {
                return [article];
            }
            currentDay = getDayOfYear(article.date);
            return [format(article.date, "PPPP"), article];
        })
        .flatMap((a) => a);
}

export const latestArticlesList = selector({
    key: "latestArticlesList",
    get: async () => {
        const articles = await Promise.all([
            fetchAndParseArticles("news", 1),
            fetchAndParseArticles("news", 2),
            fetchAndParseArticles("news", 3),
            fetchAndParseArticles("news", 4),
            fetchAndParseArticles("news", 5),
            fetchAndParseArticles("story", 1),
            fetchAndParseArticles("story", 2),
        ]);

        const flattened = articles.flatMap((a) => a);
        flattened.sort((a, b) => compareDesc(a.date, b.date));

        return flattened;
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

export function ReadProgress() {
    const pct = useRecoilValue(currentArticleReadingProgressSelector);

    // if (pct === 100) {
    //     return (
    //         <View>
    //             <View>
    //                 <FilledTick />
    //             </View>
    //             <Text>Read</Text>
    //         </View>
    //     );
    // }

    // if (pct === 0) {
    //     <View>
    //         <View>
    //             <Eye />
    //         </View>
    //         <Text>Unread</Text>
    //     </View>;
    // }

    return (
        <View>
            {/* <View>
                <UnfilledTick />
            </View> */}
            <Text>read</Text>;
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

function DateItem({ date }: { date: string }) {
    return (
        <View className=" bg-yellow-500 flex-initial flex-row px-1 py-2 my-1 border-solid border-b-2 border-slate-500">
            <Text className="text-zinc-800 font-extrabold text-md mr-1">
                {date}
            </Text>
        </View>
    );
}

function LatestArticles({ navigation }: Pick<HomeProps, "navigation">) {
    const latestStories = useRecoilValue(latestArticlesList);
    return (
        <FlatList
            className="my-8"
            data={addDateItems(latestStories)}
            renderItem={({ item }) =>
                typeof item === "string" ? (
                    <DateItem date={item} />
                ) : (
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
                )
            }
            keyExtractor={(item) => (typeof item === "string" ? item : item.id)}
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
