import { Suspense, useEffect } from "react";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { LoadingSpinner } from "~core/components";
import {
    paragraphsReadAtom,
    totalNumParagraphsAtom,
} from "~screens/ArticleScreen/article-state";
import { latestArticlesList } from "~screens/LatestArticlesScreen/articles-list-state";

export function InitializeApp({ children }: { children: JSX.Element }) {
    return (
        <RecoilRoot>
            <Suspense fallback={<LoadingSpinner text="Initializing..." />}>
                <LoadAtomsSyncedToStorage>
                    <>
                        <PruneItemsFromStorage />
                        {children}
                    </>
                </LoadAtomsSyncedToStorage>
            </Suspense>
        </RecoilRoot>
    );
}

function LoadAtomsSyncedToStorage({ children }: { children: JSX.Element }) {
    const paragraphsRead = useRecoilValue(paragraphsReadAtom);
    const totalNumParagraphs = useRecoilValue(totalNumParagraphsAtom);
    return paragraphsRead && totalNumParagraphs ? children : null;
}

function PruneItemsFromStorage() {
    const latestStories = useRecoilValue(latestArticlesList);
    const setParagraphsRead = useSetRecoilState(paragraphsReadAtom);
    const setTotalParagraphs = useSetRecoilState(totalNumParagraphsAtom);

    useEffect(() => {
        const currentStoryIds = new Set(latestStories.map((s) => s.id));

        setParagraphsRead((prev) => {
            const staleIdsToRemove = [];

            prev.forEach((_, k) => {
                if (!currentStoryIds.has(k)) {
                    staleIdsToRemove.push(k);
                }
            });

            console.debug(
                "staleIdsToRemove - paragraphs read",
                staleIdsToRemove
            );
            return prev.deleteAll(staleIdsToRemove);
        });

        setTotalParagraphs((prev) => {
            const staleIdsToRemove = [];

            prev.forEach((_, k) => {
                if (!currentStoryIds.has(k)) {
                    staleIdsToRemove.push(k);
                }
            });

            console.debug(
                "staleIdsToRemove - total paragraphs",
                staleIdsToRemove
            );
            return prev.deleteAll(staleIdsToRemove);
        });
    }, [latestStories]);

    return null;
}
