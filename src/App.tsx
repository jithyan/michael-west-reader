import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LatestArticlesScreen } from "./LatestArticlesScreen/LatestArticlesScreen";
import { ArticleScreen } from "./ArticleScreen/ArticleScreen";
import { ArticleDescription } from "./LatestArticlesScreen/articles-list-page-parser";
import { RecoilRoot, useRecoilValue } from "recoil";
import { LoadingSpinner } from "./core/components";
import { Suspense } from "react";
import { paragraphsReadAtom } from "./ArticleScreen/article-state";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    LatestArticlesList: undefined;
    ArticleScreen: Pick<ArticleDescription, "id" | "storyURL" | "title">;
};

function LoadAppPersistence({ children }: { children: JSX.Element }) {
    useRecoilValue(paragraphsReadAtom);
    return children;
}

export default function App() {
    return (
        <RecoilRoot>
            <Suspense fallback={<LoadingSpinner text="Initializing..." />}>
                <LoadAppPersistence>
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
                </LoadAppPersistence>
            </Suspense>
        </RecoilRoot>
    );
}

registerRootComponent(App);
