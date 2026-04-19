import BlogMoreInfo from "@/src/ui/modules/blog_pages/blog_more_info";

type BlogDetailsPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
    const { slug } = await params;

    return <BlogMoreInfo key={slug} />;
}
