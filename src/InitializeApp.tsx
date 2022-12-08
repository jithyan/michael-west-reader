import { Suspense, useEffect } from "react";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { paragraphsReadAtom } from "./ArticleScreen/article-state";
import { LoadingSpinner } from "./core/components";
import { latestArticlesList } from "./LatestArticlesScreen/LatestArticlesScreen";

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
    useRecoilValue(paragraphsReadAtom);
    return children;
}

function PruneItemsFromStorage() {
    const latestStories = useRecoilValue(latestArticlesList);
    const setParagraphsRead = useSetRecoilState(paragraphsReadAtom);

    useEffect(() => {
        setParagraphsRead((prev) => {
            const currentStoryIds = new Set(latestStories.map((s) => s.id));
            const staleIdsToRemove = [];

            prev.forEach((_, k) => {
                if (!currentStoryIds.has(k)) {
                    staleIdsToRemove.push(k);
                }
            });

            console.debug("staleIdsToRemove", staleIdsToRemove);
            return prev.deleteAll(staleIdsToRemove);
        });
    }, [latestStories]);

    return null;
}
