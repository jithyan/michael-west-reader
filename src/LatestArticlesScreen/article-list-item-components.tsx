import { View, Pressable, Text, Image } from "react-native";
import { ArticleDescription } from "./articles-list-page-parser";
import { ReadProgress } from "./ReadProgress";

type CategoryItemProps = Omit<ArticleDescription, "category">;

export function NewsItem({
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
                <Image
                    className="aspect-square rounded-b-md"
                    source={{ uri: imageURL }}
                />
            </View>
        </>
    );
}

export function StoryItem({
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

export function Article({
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
