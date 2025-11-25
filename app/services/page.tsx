import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | TurnSet Clean",
  description: "Choose from our range of professional cleaning services for your property.",
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of professional cleaning services for your
            property.
          </p>
        </div>

        <div className="mt-12">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              TODO: Connect to Shopify
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Service listings will be fetched from Shopify Storefront API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

