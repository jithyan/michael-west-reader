import parse, { NodeType } from "node-html-parser";
import { View, Text, Image, Pressable, Linking } from "react-native";
import htmlToReactParser, {
    HTMLReactParserOptions,
    Element,
    domToReact,
} from "html-react-parser";
import { h64 } from "xxhashjs";
import { ArticleDescription } from "~screens/LatestArticlesScreen/articles-list-page-parser";
import { RegisterViewPortAwareness } from "./RegisterViewPortAwareness";
import { ARTICLE_SECTION_READ_SEED } from "~core/seeds";
import { ArticleText } from "~core/components";

type ElemParser = (
    domNode: Element,
    meta: { storyId: string; paragraph: { count: number } }
) => void;

const getOptions = ({ id }: Pick<ArticleDescription, "id">) => {
    const paragraph = { count: 0 };
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (
                domNode.nodeType === NodeType.TEXT_NODE &&
                typeof (domNode as any).data === "string" &&
                (domNode as any).data.trim() !== ""
            ) {
                return <Text>{(domNode as any).data.trim()}</Text>;
            } else if (domNode instanceof Element && domNode.attribs) {
                const { name } = domNode;
                const { children } = domNode;

                const parseChildren = () => domToReact(children, options);

                switch (name) {
                    case "blockquote":
                        if (domNode.attribs?.class?.includes("wp-embed")) {
                            return <></>;
                        }
                        return (
                            <View className="bg-slate-300 border-solid border-2 border-slate-400 p-2 mx-4 my-4 rounded-md">
                                {parseChildren()}
                            </View>
                        );

                    case "iframe":
                        return <></>;

                    case "span":
                        return <>{parseChildren()}</>;

                    case "a":
                        if ((domNode.firstChild as any)?.name === "img") {
                            return <>{parseChildren()}</>;
                        }

                        const { href } = domNode.attribs ?? {};

                        return (
                            <Pressable
                                onPress={() => {
                                    Linking.openURL(href);
                                }}
                            >
                                <ArticleText
                                    textColor="text-sky-600"
                                    textStyle="underline"
                                    padding="pt-4"
                                    margin="mx-2"
                                >
                                    {parseChildren()}
                                </ArticleText>
                            </Pressable>
                        );

                    case "div":
                        if (
                            domNode.attribs?.class === "molongui-clearfix" ||
                            domNode.attribs.id?.startsWith("mab-") ||
                            domNode.attribs?.class?.includes("wp-embed")
                        ) {
                            return <></>;
                        }
                        return <>{parseChildren()}</>;

                    case "h2":
                    case "h3":
                    case "h4":
                    case "h5":
                    case "h6":
                        return (
                            <ArticleText
                                textSize="text-lg"
                                fontWeight="font-bold"
                                padding="p-1.5"
                            >
                                {parseChildren()}
                            </ArticleText>
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

                    case "em":
                        return (
                            <ArticleText textStyle="italic">
                                {" "}
                                {parseChildren()}{" "}
                            </ArticleText>
                        );

                    case "strong":
                        return (
                            <ArticleText fontWeight="font-semibold">
                                {" "}
                                {parseChildren()}{" "}
                            </ArticleText>
                        );

                    case "p":
                        const textNodes = domNode.childNodes
                            .filter((n) => n.nodeType === NodeType.TEXT_NODE)
                            .map((n) => (n as any).data as string);
                        paragraph.count++;

                        const hash = textNodes
                            .reduce(
                                (prev, curr) => prev.update(curr),
                                h64(ARTICLE_SECTION_READ_SEED)
                            )
                            .digest()
                            .toString();

                        return (
                            <RegisterViewPortAwareness storyId={id} hash={hash}>
                                <ArticleText margin="mb-2" padding="p-2">
                                    {parseChildren()}
                                </ArticleText>
                            </RegisterViewPortAwareness>
                        );

                    default:
                        return <></>;
                }
            } else {
                return <></>;
            }
        },
    };

    return { options, paragraph };
};

export async function parseArticle({
    storyURL,
    id,
}: Pick<ArticleDescription, "id" | "storyURL">) {
    const response = await fetch(storyURL);
    const dom = parse(await response.text());
    const div = dom.getElementById("old-post");

    const coverImage = htmlToReactParser(
        dom
            .querySelector(".featured-image")
            .getElementsByTagName("img")
            .toString(),
        getOptions({ id }).options
    ) as JSX.Element;

    const { options, paragraph } = getOptions({ id });
    const restOfBody = htmlToReactParser(
        div.toString(),
        options
    ) as JSX.Element;

    return {
        body: (
            <>
                <View>{coverImage}</View>
                <View>{restOfBody}</View>
            </>
        ),
        numParagraphs: paragraph.count,
    };
}
