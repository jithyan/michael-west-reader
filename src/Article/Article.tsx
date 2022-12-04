import { atom } from "jotai";
import { View, Text } from "react-native";
import { Map } from "immutable";

const article = atom(
    Map<string, { pctRead: number; parsedElements: JSX.Element }>()
);

export function Article() {
    return (
        <View>
            <Text>Article</Text>
        </View>
    );
}
