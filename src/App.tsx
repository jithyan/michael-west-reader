import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./Home/Home";
import { Article, paragraphsReadAtom } from "./Article/Article";
import { ArticleDescription } from "./Home/parser";
import { RecoilRoot, useRecoilValue } from "recoil";
import { LoadingSpinner } from "./core/components";
import { Suspense } from "react";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    Home: undefined;
    Article: Pick<ArticleDescription, "id" | "storyURL" | "title">;
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
                                name="Home"
                                component={Home}
                                options={{
                                    header: () => <></>,
                                }}
                            />
                            <Stack.Screen
                                name="Article"
                                component={Article}
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
