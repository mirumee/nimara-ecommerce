import { Skeleton } from "@nimara/ui/components/skeleton";

import edjsHTML from "editorjs-html";
import xss from "xss";

import { type CMSPageViewProps } from "../shared/types";
import { CMSPageProvider } from "../shared/providers/cms-page-provider";

const parser = edjsHTML();

type EditorJSContent = {
    blocks?: Array<string>;
};

/**
 * Standard view for the CMS page.
 * @param props - The properties for the CMS page view.
 * @returns A React component rendering the standard CMS page.
 */
export const StandardCMSPageView = async (props: CMSPageViewProps) => {
    const { slug } = await props.params;

    return (
        <CMSPageProvider
            slug={slug}
            services={props.services}
            render={({ content }) => {
                let contentHtml: string[] | null = null;

                if (content) {
                    try {
                        const parsedContent = JSON.parse(content) as EditorJSContent;

                        if (parsedContent && parsedContent.blocks) {
                            contentHtml = parser.parse(parsedContent);
                        }
                    } catch (error) {
                        contentHtml = [content];
                    }
                }

                return (
                    <div className="text-primary container pb-6">
                        {contentHtml ? (
                            <div className="prose prose-h1:my-6 prose-h1:text-primary prose-h1:text-center prose-h1:text-4xl prose-h2:text-primary prose-h2:text-center prose-h2:text-4xl prose-p:my-0 dark:prose-p:text-stone-200 min-w-full break-words">
                                {contentHtml.map((htmlContent) => (
                                    <div
                                        key={htmlContent}
                                        dangerouslySetInnerHTML={{ __html: xss(htmlContent) }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                );
            }}
        />
    );
};

/**
 * Skeleton component for the standard CMS page view.
 * This component is used to display a loading state while the CMS page data is being fetched.
 * @returns A skeleton component for the standard CMS page view.
 */
export const StandardCMSPageViewSkeleton = () => (
    <div className="text-primary container pb-6">
        <div className="prose min-w-full break-words">
            <Skeleton className="mb-6 h-12 w-3/4" />
            <Skeleton className="mb-4 h-6 w-full" />
            <Skeleton className="mb-4 h-6 w-full" />
            <Skeleton className="mb-4 h-6 w-5/6" />
            <Skeleton className="mb-6 h-12 w-2/3" />
            <Skeleton className="mb-4 h-6 w-full" />
            <Skeleton className="mb-4 h-6 w-4/5" />
        </div>
    </div>
);

