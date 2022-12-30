import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InitializeReader } from "./InitializeReader";
import { ArticleScreen } from "~screens/ArticleScreen/ArticleScreen";
import { ArticleDescription } from "~screens/LatestArticlesScreen/articles-list-page-parser";
import { LatestArticlesScreen } from "~screens/LatestArticlesScreen/LatestArticlesScreen";
import { View } from "react-native";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    LatestArticlesList: undefined;
    ArticleScreen: Pick<ArticleDescription, "id" | "storyURL" | "title">;
};

export default function App() {
    return (
        <InitializeReader>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="LatestArticlesList">
                    <Stack.Screen
                        name="LatestArticlesList"
                        component={LatestArticlesScreen}
                        options={{
                            header: () => <View className="bg-sky-900"></View>,
                        }}
                    />
                    <Stack.Screen
                        name="ArticleScreen"
                        component={ArticleScreen}
                        options={{
                            headerTitle: "",
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </InitializeReader>
    );
}

registerRootComponent(App);
