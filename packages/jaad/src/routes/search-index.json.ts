import type { APIRoute } from "astro";
import { searchIndexResponse } from "../utils/endpoints.ts";

export const GET: APIRoute = () => searchIndexResponse();
