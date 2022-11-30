import { Text, Image } from "react-native";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
    return <Text>{text}</Text>;
}

export function Show({
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
