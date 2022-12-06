import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./Home/Home";
import { Article } from "./Article/Article";
import { ArticleDescription } from "./Home/parser";
import { RecoilRoot } from "recoil";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    Home: undefined;
    Article: Pick<ArticleDescription, "id" | "storyURL" | "title">;
};

export default function App() {
    return (
        <RecoilRoot>
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
        </RecoilRoot>
    );
}

registerRootComponent(App);
