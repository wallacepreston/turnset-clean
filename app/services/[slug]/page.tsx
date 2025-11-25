type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Service: {slug}
          </h1>
          <p className="text-muted-foreground">
            Service detail page for: <code className="text-sm">{slug}</code>
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              TODO: Connect to Shopify
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Product details will be fetched from Shopify Storefront API
            </p>
          </div>

          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              TODO: Connect to Sanity
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Service-specific content (what&apos;s included, FAQs) will be
              fetched from Sanity CMS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

