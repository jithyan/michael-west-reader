import { Suspense, useEffect } from "react";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { LoadingSpinner } from "~core/components";
import { paragraphsReadAtom } from "~screens/ArticleScreen/article-state";
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
    const v = useRecoilValue(paragraphsReadAtom);
    return v ? children : null;
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
