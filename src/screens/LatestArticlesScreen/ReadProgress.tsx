import { View, Text } from "react-native";
import { useRecoilValue } from "recoil";
import { currentArticleReadingProgressSelector } from "~screens/ArticleScreen/article-state";
import { FilledTick, Eye } from "~core/icons";
import { ArticleDescription } from "./articles-list-page-parser";
import { TextColor } from "~types/tailwind";
import { ArticleText } from "~core/components";

function ProgressRow({
    icon,
    text,
    textColor = "text-zinc-100",
}: {
    icon: JSX.Element;
    text: string;
    textColor?: TextColor;
}) {
    return (
        <View className="flex-initial flex-row mx-2 my-2">
            <View className="mx-1">{icon}</View>
            <ArticleText
                fontWeight="font-light"
                textSize="text-xs"
                padding="p-1"
                margin="m-0"
                textColor={textColor}
            >
                {text}
            </ArticleText>
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

    return (
        <ProgressRow
            icon={<Eye color="cyan" />}
            text={`${pct}% Read`}
            textColor="text-cyan-300"
        />
    );
}
