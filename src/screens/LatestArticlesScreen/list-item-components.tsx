import { View, Pressable, Text, Image } from "react-native";
import FastImageTemp from "react-native-fast-image";
import { SvgCssUri } from "react-native-svg";
import { useRecoilRefresher_UNSTABLE } from "recoil";
import { ArticleText, Show } from "~core/components";
import { ArticleDescription } from "./articles-list-page-parser";
import {
    latestArticlesListSelector,
    useFilterState,
} from "./articles-list-state";
import { ReadProgress } from "./ReadProgress";

const FastImage =
    process.env.NODE_ENV === "development" ? Image : FastImageTemp;

export const MichaelWestSVG = (
    <View className="p-0 my-2 mx-6 bg-slate-200 rounded-xl flex-shrink flex-row border-solid">
        <SvgCssUri
            className="p-0 m-0 aspect-video"
            color="white"
            width="100%"
            height="100%"
            uri="https://michaelwest.com.au/wp-content/uploads/2022/03/MWMlogo-un1-1.svg"
        />
    </View>
);

export function DateItem({ date }: { date: string }) {
    return (
        <View className=" bg-yellow-500 flex-initial flex-row px-4 py-2 my-2 border-solid border-b-2 border-sky-800 rounded-lg">
            <Text className="text-zinc-800 font-extrabold text-md mr-1">
                {date}
            </Text>
        </View>
    );
}

export function FilterAndResetButtonItem() {
    const reset = useRecoilRefresher_UNSTABLE(latestArticlesListSelector);
    const { setStoriesOnly, setUnreadOnly, storiesOnly, unreadOnly } =
        useFilterState();

    return (
        <View className="flex-row flex-initial">
            <Pressable onPress={reset}>
                <View className="basis-1/3">
                    <ArticleText>Refresh</ArticleText>
                </View>
            </Pressable>
            <Pressable onPress={() => setStoriesOnly((prev) => !prev)}>
                <View className="basis-1/3">
                    <ArticleText
                        textColor={
                            storiesOnly ? "text-amber-400" : "text-slate-200"
                        }
                    >
                        Stories only
                    </ArticleText>
                </View>
            </Pressable>
            <Pressable onPress={() => setUnreadOnly((prev) => !prev)}>
                <View className="basis-1/3">
                    <ArticleText
                        textColor={
                            unreadOnly ? "text-amber-400" : "text-slate-200"
                        }
                    >
                        Unread only
                    </ArticleText>
                </View>
            </Pressable>
        </View>
    );
}

type CategoryItemProps = Omit<ArticleDescription, "category">;

function NewsItem({
    id,
    title,
    imageURL,
    author,
    published,
}: CategoryItemProps) {
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
                <Show when={imageURL.length > 1}>
                    <FastImage
                        className="aspect-square rounded-b-md"
                        source={{ uri: imageURL }}
                    />
                </Show>
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
}: CategoryItemProps) {
    return (
        <View className="flex-initial flex-col">
            <View className=" bg-amber-500 rounded-md px-0.5 pt-0.5">
                <Text className=" text-zinc-800 font-extrabold text-md px-2">
                    Story
                </Text>
                <View className=" basis-full my-0.5">
                    <FastImage
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

export function ArticleItem({
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
