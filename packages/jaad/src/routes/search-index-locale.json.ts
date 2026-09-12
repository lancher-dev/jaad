import type { APIRoute, GetStaticPaths } from "astro";
import { getServedLocales } from "../collection.ts";
import { searchIndexResponse } from "../utils/endpoints.ts";

export const getStaticPaths: GetStaticPaths = async () =>
  (await getServedLocales()).map((locale) => ({ params: { locale } }));

export const GET: APIRoute = ({ params }) => searchIndexResponse(params.locale);
