import type { APIRoute, GetStaticPaths } from "astro";
import config from "virtual:jaad/config";
import { searchIndexResponse } from "../utils/endpoints.ts";
import { prefixedLocales } from "../urls.ts";

export const getStaticPaths: GetStaticPaths = () =>
  prefixedLocales(config).map((locale) => ({ params: { locale } }));

export const GET: APIRoute = ({ params }) => searchIndexResponse(params.locale);
