import React, { Suspense, useMemo } from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import { useRecoilValue } from "recoil";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format, getDayOfYear } from "date-fns";
import { ArticleDescription } from "./articles-list-page-parser";
import { RootStackParamList } from "../../App";
import { LoadingSpinner, Show } from "~core/components";
import { DebugStats } from "~core/debug";
import { filteredArticlesSelector } from "./articles-list-state";
import {
    ArticleItem,
    DateItem,
    MichaelWestSVG,
    FilterAndResetButtonItem,
} from "./list-item-components";

function toArticleProps(
    articles: ArticleDescription[],
    navigation: HomeProps["navigation"]
): ArticleProps[] {
    return articles.map((article) => ({
        ...article,
        type: "article",
        key: article.id,
        onTouch: () => {
            navigation.navigate("ArticleScreen", {
                id: article.id,
                storyURL: article.storyURL,
                title: article.title,
            });
        },
    }));
}

function toDateItemProp(date: Date): DateItemProps {
    const formattedDate = format(date, "PPPP");
    return {
        type: "date",
        date: formattedDate,
        key: formattedDate,
    };
}

function toStaticItemProp(key: string, element: JSX.Element): StaticItemProps {
    return {
        type: "static",
        key,
        element,
    };
}

function toStaticComponentItemProp(
    key: string,
    Component: () => JSX.Element
): StaticComponentItemProps {
    return {
        type: "static-component",
        key,
        Component,
    };
}

function groupArticlePropsByDateItemProps(
    articles: ArticleProps[]
): Array<ArticleProps | DateItemProps> {
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
            return [toDateItemProp(article.date), article];
        })
        .flatMap((a) => a);
}

type ArticleProps = ArticleDescription & {
    type: "article";
    key: string;
    onTouch: () => void;
};
type DateItemProps = { type: "date"; key: string; date: string };
type StaticItemProps = { type: "static"; key: string; element: JSX.Element };
type StaticComponentItemProps = {
    type: "static-component";
    key: string;
    Component: () => JSX.Element;
};

type ListItemProps =
    | ArticleProps
    | DateItemProps
    | StaticItemProps
    | StaticComponentItemProps;

function ListItem(props: ListItemProps) {
    switch (props.type) {
        case "article":
            return <ArticleItem {...props} />;

        case "date":
            return <DateItem {...props} />;

        case "static":
            return props.element;

        case "static-component":
            const { Component } = props;
            return <Component />;

        default:
            throw new Error(`Unknown list item type: ${props}`);
    }
}

function LatestArticles({ navigation }: Pick<HomeProps, "navigation">) {
    const latestStories = useRecoilValue(filteredArticlesSelector);
    const listItems: ListItemProps[] = useMemo(
        () => [
            toStaticItemProp("michael-west-svg", MichaelWestSVG),
            toStaticComponentItemProp("reset", FilterAndResetButtonItem),
            ...groupArticlePropsByDateItemProps(
                toArticleProps(latestStories, navigation)
            ),
        ],
        [latestStories, navigation]
    );

    return (
        <FlatList
            className="my-8"
            data={listItems}
            renderItem={({ item }) => <ListItem {...item} />}
            keyExtractor={(item) => item.key}
        />
    );
}

type HomeProps = NativeStackScreenProps<
    RootStackParamList,
    "LatestArticlesList"
>;

export function LatestArticlesScreen({ route, navigation }: HomeProps) {
    return (
        <SafeAreaView className="bg-sky-900 w-full h-full">
            <View className="px-4 pt-4">
                <Suspense
                    fallback={
                        <LoadingSpinner text="Fetching latest articles..." />
                    }
                >
                    <Show when={process.env.NODE_ENV === "development"}>
                        <DebugStats />
                    </Show>
                    <LatestArticles navigation={navigation} />
                </Suspense>
            </View>
        </SafeAreaView>
    );
}
