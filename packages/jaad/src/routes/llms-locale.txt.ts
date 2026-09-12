import type { APIRoute, GetStaticPaths } from "astro";
import { getServedLocales } from "../collection.ts";
import { llmsResponse } from "../utils/endpoints.ts";

export const getStaticPaths: GetStaticPaths = async () =>
  (await getServedLocales()).map((locale) => ({ params: { locale } }));

export const GET: APIRoute = ({ site, params }) =>
  llmsResponse(site, params.locale);
