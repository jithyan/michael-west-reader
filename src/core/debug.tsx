import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRecoilValue } from "recoil";
import {
    paragraphsReadForCurrentArticleSelector,
    totalParagraphsForCurrentArticleSelector,
    currentArticleReadingProgressSelector,
    paragraphsReadAtom,
    totalNumParagraphsAtom,
} from "../ArticleScreen/article-state";
import { latestArticlesList } from "../LatestArticlesScreen/articles-list-state";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function DebugReadProgress({ id }: { id: string }) {
    const numRead = useRecoilValue(paragraphsReadForCurrentArticleSelector(id));
    const total = useRecoilValue(totalParagraphsForCurrentArticleSelector(id));
    const pct = useRecoilValue(currentArticleReadingProgressSelector(id));

    return (
        <View className="mt-1 p-1 flex-row flex-initial">
            <Text>
                r:{numRead} t:{total} {pct}%
            </Text>
            <Text> | storyId: {id}</Text>
        </View>
    );
}

export function DebugStats() {
    const [storage, setStorage] = useState<number>(0);
    const latestArticles = useRecoilValue(latestArticlesList);
    const totalNumParagraphs = useRecoilValue(totalNumParagraphsAtom);
    const paragraphsRead = useRecoilValue(paragraphsReadAtom);

    useEffect(() => {
        Promise.all([
            AsyncStorage.getItem("paragraphsRead"),
            AsyncStorage.getItem("totalNumParagraphs"),
        ]).then((r) => {
            if (typeof r[0] === "string") {
                setStorage((s) => s + r[0].length);
            }
            if (typeof r[1] === "string") {
                setStorage((s) => s + r[1].length);
            }
        });
    }, []);

    return (
        <View className="flex-initial flex-row mt-8">
            <Text className="text-white font-semibold p-0.5">
                <Text className="p-2">
                    Storage size: {Math.trunc((storage * 2) / 1024)}KB |{" "}
                </Text>
                <Text className="p-2">
                    News:{" "}
                    {latestArticles.reduce(
                        (prev, curr) =>
                            curr.category === "news" ? prev + 1 : prev,
                        0
                    )}
                    {" | "}
                </Text>
                <Text className="p-2">
                    Stories:{" "}
                    {latestArticles.reduce(
                        (prev, curr) =>
                            curr.category === "story" ? prev + 1 : prev,
                        0
                    )}
                    {" | "}
                </Text>
                <Text className="p-2">
                    total ps: {totalNumParagraphs.size}; p read:{" "}
                    {paragraphsRead.size}
                    {" | "}
                </Text>
            </Text>
        </View>
    );
}
