import { View, Image, Text, ScrollView } from "react-native";
import parse, { NodeType } from "node-html-parser";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import React from "react";
import htmlToReactParser, {
    HTMLReactParserOptions,
    Element,
    domToReact,
} from "html-react-parser";
import { selectorFamily, useRecoilValue } from "recoil";
import { LoadingSpinner } from "../core/components";

const options: HTMLReactParserOptions = {
    replace: (domNode) => {
        if (
            domNode.nodeType === NodeType.TEXT_NODE &&
            typeof (domNode as any).data === "string" &&
            (domNode as any).data.trim() !== ""
        ) {
            return <Text>{(domNode as any).data.trim()}</Text>;
        } else if (domNode instanceof Element && domNode.attribs) {
            const { name, nodeType } = domNode;
            const { children } = domNode;

            const parseChildren = () => domToReact(children, options);

            switch (name) {
                case "blockquote":
                    if (domNode.attribs?.class?.includes("wp-embed")) {
                        return <></>;
                    }
                    return (
                        <View className="bg-gray-400 p-2 mx-4 my-4 rounded-md">
                            {parseChildren()}
                        </View>
                    );

                case "iframe":
                    return <></>;

                case "span":
                    return <Text>{parseChildren()}</Text>;

                case "a":
                    if ((domNode.firstChild as any)?.name === "img") {
                        return <>{parseChildren()}</>;
                    }
                    return (
                        <Text className="text-sky-600 underline">
                            {parseChildren()}
                        </Text>
                    );

                case "div":
                    if (domNode.attribs?.class === "molongui-clearfix") {
                        return <></>;
                    }
                    if (domNode.attribs.id?.startsWith("mab-")) {
                        return <></>;
                    }
                    if (domNode.attribs?.class?.includes("wp-embed")) {
                        console.log("dom", domNode.attribs?.class);
                        return <></>;
                    }
                    return <>{parseChildren()}</>;

                case "h1":
                    return (
                        <Text className=" text-purple-800 text-2xl font-extrabold">
                            {parseChildren()}
                        </Text>
                    );

                case "h2":
                case "h3":
                    return (
                        <Text className="text-lg font-bold mb-2 px-2 pt-1.5">
                            {parseChildren()}
                        </Text>
                    );

                case "img":
                    return (
                        <View className="my-8 px-2">
                            <Image
                                source={{ uri: domNode.attribs.src }}
                                className="aspect-video"
                            />
                        </View>
                    );

                case "emphasis":
                case "strong":
                    return (
                        <Text className="text-md font-semibold">
                            {" "}
                            {parseChildren()}{" "}
                        </Text>
                    );

                case "p":
                    return (
                        <Text className=" text-base font-normal mb-2 p-2">
                            {parseChildren()}
                        </Text>
                    );

                default:
                    return <></>;
            }
        } else {
            return <></>;
        }
    },
};

const getParsedArticleFromURLSelector = selectorFamily({
    key: "parsedArticle",
    get: (storyURL: string) => async () => {
        return parseArticle(storyURL);
    },
});

async function parseArticle(storyURL: string) {
    const response = await fetch(storyURL);
    const dom = parse(await response.text());
    const div = dom.getElementById("old-post");

    const coverImage = htmlToReactParser(
        dom
            .querySelector(".featured-image")
            .getElementsByTagName("img")
            .toString(),
        options
    ) as JSX.Element;

    const restOfBody = htmlToReactParser(
        div.toString(),
        options
    ) as JSX.Element;
    console.log("Array slice", React.Children.toArray(restOfBody).slice(0, 3));
    return (
        <>
            <View>{coverImage}</View>
            <View>{restOfBody}</View>
        </>
    );
}

function ArticleBody({ storyURL }: { storyURL: string }) {
    return useRecoilValue(getParsedArticleFromURLSelector(storyURL));
}

type ArticleProps = NativeStackScreenProps<RootStackParamList, "Article">;

export function Article({ route }: ArticleProps) {
    const { storyURL, id, title } = route.params;

    return (
        <View className="container bg-zinc-100 p-1">
            <ScrollView className="p-1">
                <Text className="px-2 mt-2 mb-0.5 text-2xl font-extrabold">
                    {title}
                </Text>
                <React.Suspense
                    fallback={<LoadingSpinner text="Loading article..." />}
                >
                    <ArticleBody storyURL={storyURL} />
                </React.Suspense>
            </ScrollView>
        </View>
    );
}
