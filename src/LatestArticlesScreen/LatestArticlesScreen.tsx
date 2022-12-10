import React, { Suspense } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    Image,
    Pressable,
} from "react-native";
import { selector, useRecoilValue } from "recoil";
import {
    Category,
    getLatestArticlesHTMLPageForCategory,
} from "./articles-list-page-api";
import {
    ArticleDescription,
    isArticleDescription,
    parseLatestArticlesHTMLPage,
} from "./articles-list-page-parser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { LoadingSpinner } from "../core/components";
import { compareDesc } from "date-fns/esm";
import { format, getDayOfYear } from "date-fns";
import { ReadProgress } from "./ReadProgress";
import { SvgCssUri, SvgUri } from "react-native-svg";

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
                <Text className="text-zinc-200 font-extrabold text-xl p-0.5">
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
                <ReadProgress id={id} />
            </View>
            <View className="basis-1/3">
                <Text className="text-zinc-800 bg-amber-500 text-center text-xs rounded-t-md">
                    News
                </Text>
                <Image
                    className="aspect-square rounded-b-md"
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
            <View className=" bg-amber-500 rounded-md px-0.5 pt-0.5">
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
            <View className="basis-full rounded-md  my-0.5">
                <Text className=" text-zinc-200 font-extrabold text-xl p-0.5">
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
            <ReadProgress id={id} />
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
        <View className=" bg-yellow-500 flex-initial flex-row px-4 py-2 my-2 border-solid border-b-2 border-sky-800 rounded-lg">
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
            data={[
                <View className="p-0 my-2 mx-6 bg-slate-200 rounded-xl flex-shrink flex-row border-solid">
                    <SvgCssUri
                        className="p-0 m-0 aspect-video"
                        color="white"
                        width="100%"
                        height="100%"
                        uri="https://michaelwest.com.au/wp-content/uploads/2022/03/MWMlogo-un1-1.svg"
                    />
                </View>,
                ...addDateItems(latestStories),
            ]}
            renderItem={({ item }) =>
                isArticleDescription(item) ? (
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
                ) : typeof item === "string" ? (
                    <DateItem date={item} />
                ) : (
                    item
                )
            }
            keyExtractor={(item) =>
                isArticleDescription(item)
                    ? item.id
                    : typeof item === "string"
                    ? item
                    : "coverImage"
            }
        />
    );
}

type HomeProps = NativeStackScreenProps<
    RootStackParamList,
    "LatestArticlesList"
>;

export function LatestArticlesScreen({ route, navigation }: HomeProps) {
    return (
        <SafeAreaView className="container bg-sky-900 px-4 py-2">
            <Suspense
                fallback={<LoadingSpinner text="Fetching latest articles..." />}
            >
                <LatestArticles navigation={navigation} />
            </Suspense>
        </SafeAreaView>
    );
}
