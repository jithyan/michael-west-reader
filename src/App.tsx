import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InitializeApp } from "./InitializeApp";
import { ArticleScreen } from "~screens/ArticleScreen/ArticleScreen";
import { ArticleDescription } from "~screens/LatestArticlesScreen/articles-list-page-parser";
import { LatestArticlesScreen } from "~screens/LatestArticlesScreen/LatestArticlesScreen";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    LatestArticlesList: undefined;
    ArticleScreen: Pick<ArticleDescription, "id" | "storyURL" | "title">;
};

export default function App() {
    return (
        <InitializeApp>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="LatestArticlesList"
                        component={LatestArticlesScreen}
                        options={{
                            header: () => <></>,
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
        </InitializeApp>
    );
}

registerRootComponent(App);
