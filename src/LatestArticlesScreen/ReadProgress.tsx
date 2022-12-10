import { View, Text } from "react-native";
import { useRecoilValue } from "recoil";
import { currentArticleReadingProgressSelector } from "../ArticleScreen/article-state";
import { FilledTick, Eye, UnfilledTick } from "../core/icons";
import { ArticleDescription } from "./articles-list-page-parser";

function ProgressRow({ icon, text }: { icon: JSX.Element; text: string }) {
    return (
        <View className="flex-initial flex-row mx-2 my-2">
            <View className="mx-1">{icon}</View>
            <Text className="text-zinc-300 font-light text-xs pt-1">
                {text}
            </Text>
        </View>
    );
}

export function ReadProgress({ id }: Pick<ArticleDescription, "id">) {
    const pct = useRecoilValue(currentArticleReadingProgressSelector(id));

    if (pct === 100) {
        return <ProgressRow icon={<FilledTick />} text="Read" />;
    }

    if (pct === 0) {
        return <ProgressRow icon={<Eye />} text="Unread" />;
    }

    return <ProgressRow icon={<UnfilledTick />} text={`${pct}% Read`} />;
}
