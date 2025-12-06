import { type SchemaTypeDefinition } from "sanity";
import homepage from "./homepage";
import servicePage from "./servicePage";
import simplePage from "./simplePage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homepage, servicePage, simplePage],
};
