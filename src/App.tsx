import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InitializeReader } from "./InitializeReader";
import { ArticleScreen } from "~screens/ArticleScreen/ArticleScreen";
import { ArticleDescription } from "~screens/LatestArticlesScreen/articles-list-page-parser";
import { LatestArticlesScreen } from "~screens/LatestArticlesScreen/LatestArticlesScreen";
import { View } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import { ArticleText } from "~core/components";

function ErrorMsg() {
    return (
        <View className="container bg-sky-800 flex flex-col items-center h-full w-full">
            <ArticleText
                textColor="text-gray-200"
                textSize="text-3xl"
                fontWeight="font-bold"
                padding="pt-40 pb-24"
            >
                Something went wrong.
            </ArticleText>
            <ArticleText textSize="text-xl" textColor="text-gray-300">
                Please restart the app
            </ArticleText>
        </View>
    );
}
const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    LatestArticlesList: undefined;
    ArticleScreen: Pick<ArticleDescription, "id" | "storyURL" | "title">;
};

export default function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorMsg}>
            <InitializeReader>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="LatestArticlesList">
                        <Stack.Screen
                            name="LatestArticlesList"
                            component={LatestArticlesScreen}
                            options={{
                                header: () => (
                                    <View className="bg-sky-900"></View>
                                ),
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
        </ErrorBoundary>
    );
}

registerRootComponent(App);
