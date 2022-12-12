import { View, Text } from "react-native";
import { SvgCssUri } from "react-native-svg";

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
