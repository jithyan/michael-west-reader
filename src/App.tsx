import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./Home/Home";
import { Article } from "./Article/Article";
import { ArticleDescription } from "./Home/parser";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    Home: undefined;
    Article: Pick<ArticleDescription, "id" | "storyURL">;
};

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} options={{}} />
                <Stack.Screen name="Article" component={Article} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

registerRootComponent(App);
