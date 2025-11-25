export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">About TurnSet Clean</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission and story.
          </p>
        </div>

        <div className="mt-12">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              TODO: Connect to Sanity
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              About page content will be fetched from Sanity CMS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

