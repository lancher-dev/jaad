import type { APIRoute } from "astro";
import { llmsResponse } from "../utils/endpoints.ts";

export const GET: APIRoute = ({ site }) => llmsResponse(site);
