import { View, Text } from "react-native";
import { useRecoilValue } from "recoil";
import { currentArticleReadingProgressSelector } from "../ArticleScreen/article-state";
import { FilledTick, Eye, UnfilledTick } from "../core/icons";
import { ArticleDescription } from "./articles-list-page-parser";

export function ReadProgress({ id }: Pick<ArticleDescription, "id">) {
    const pct = useRecoilValue(currentArticleReadingProgressSelector(id));

    if (pct === 100) {
        return (
            <View>
                <View>
                    <FilledTick />
                </View>
                <Text className="text-zinc-300 font-light text">Read</Text>
            </View>
        );
    }

    if (pct === 0) {
        return (
            <View>
                <View>
                    <Eye />
                </View>
                <Text className="text-zinc-300 font-light text">Unread</Text>
            </View>
        );
    }

    return (
        <View className="flex-initial flex-row mx-2 my-2">
            <View className="mx-1">
                <UnfilledTick />
            </View>
            <Text className="text-zinc-300 font-light text">{pct}% read</Text>
        </View>
    );
}
