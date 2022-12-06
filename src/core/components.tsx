import Spinner from "react-native-loading-spinner-overlay/lib";

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
