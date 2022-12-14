import { ReactNode } from "react";
import { Text } from "react-native";
import Spinner from "react-native-loading-spinner-overlay/lib";
import {
    TextSize,
    TextColor,
    Padding,
    Margin,
    TextStyle,
    FontWeight,
} from "~types/tailwind";

export function LoadingSpinner({
    text = "Loading...",
    visible = true,
}: {
    text: string;
    visible?: boolean;
}) {
    return <Spinner visible={visible} textContent={text} />;
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

function toClassName(...classNames: string[]): string {
    return classNames
        .map((c) => c.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
}

type ArticleTextProps = {
    children: ReactNode;
    fontWeight?: FontWeight | "";
    textSize?: TextSize | "";
    textStyle?: TextStyle | "";
    textColor?: TextColor | "";
    padding?: Padding | "";
    margin?: Margin | "";
};

export function ArticleText({
    children,
    textSize = "text-base",
    fontWeight = "font-normal",
    textStyle = "",
    textColor = "text-slate-800",
    padding = "p-2",
    margin = "mb-2",
}: ArticleTextProps) {
    return (
        <Text
            className={toClassName(
                textSize,
                fontWeight,
                textStyle,
                textColor,
                padding,
                margin
            )}
        >
            {children}
        </Text>
    );
}
