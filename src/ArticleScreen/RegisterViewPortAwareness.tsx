import { InView } from "react-native-intersection-observer";
import { useSetRecoilState } from "recoil";
import { paragraphsReadForCurrentArticleSelector } from "./article-state";

export function RegisterViewPortAwareness({
    children,
    storyId,
    hash,
}: {
    children: JSX.Element;
    storyId: string;
    hash: string;
}) {
    const setParagraphAsRead = useSetRecoilState(
        paragraphsReadForCurrentArticleSelector(storyId)
    );

    return (
        <InView
            triggerOnce={true}
            onChange={(InView) => {
                if (InView) {
                    setParagraphAsRead(hash);
                }
            }}
        >
            {children}
        </InView>
    );
}
