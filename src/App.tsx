import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { getLatestStoriesPage } from "./api";
import { ArticleDescription, parseLatestStoriesPage } from "./parser";

const Stack = createNativeStackNavigator();

async function initalize() {
    const [success, pageBody] = await getLatestStoriesPage();

    if (success) {
        return parseLatestStoriesPage(pageBody);
    }

    throw new Error("Failed to fetch latest stories");
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<ArticleDescription[]>([]);

    useEffect(() => {
        initalize()
            .then((data) => {
                console.log("Number of articles", data.length);
                setState(data);
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <NavigationContainer>
            <View style={styles.container}>
                <Show when={loading}>
                    <Text>Loading...</Text>
                </Show>
                <Show when={!loading && Boolean(state)}>
                    <>
                        {state.map(({ id, title, imageURL }) => (
                            <View onTouchStart={() => {}} key={id}>
                                <Image
                                    source={{ uri: imageURL }}
                                    style={{ width: 400, height: 200 }}
                                />
                                <Text>{title}</Text>
                            </View>
                        ))}
                    </>
                </Show>
                <StatusBar style="auto" />
            </View>
        </NavigationContainer>
    );
}

function Show({
    when,
    elseShow = null,
    children,
}: {
    when: boolean;
    elseShow?: JSX.Element | null;
    children: JSX.Element;
}) {
    return when ? children : elseShow;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});

registerRootComponent(App);
