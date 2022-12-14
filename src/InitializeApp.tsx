import { Map } from "immutable";
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

        setParagraphsRead(removeStaleIds(currentStoryIds));
        setTotalParagraphs(removeStaleIds(currentStoryIds));
    }, [latestStories]);

    return null;
}

function removeStaleIds(
    currentStoryIds: Set<string>
): (mapFromStorage: Map<string, any>) => Map<string, any> {
    return (mapFromStorage) => {
        const staleIdsToRemove: string[] = [];

        mapFromStorage.forEach((_, k) => {
            if (!currentStoryIds.has(k)) {
                staleIdsToRemove.push(k);
            }
        });

        return mapFromStorage.deleteAll(staleIdsToRemove);
    };
}
