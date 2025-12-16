import { type SchemaTypeDefinition } from "sanity";
import homepage from "./homepage";
import simplePage from "./simplePage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homepage, simplePage],
};
