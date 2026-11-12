import type { APIRoute, GetStaticPaths } from "astro";
import { getCatalogue } from "../../lib/catalogue";

export const getStaticPaths: GetStaticPaths = async () => {
  const prompts = await getCatalogue();
  return prompts.flatMap(prompt => {
    const files = [{ params: { file: `${prompt.id}.md` }, props: { bytes: prompt.bytes, contentType: "text/markdown; charset=utf-8" } }];
    if (prompt.source) {
      files.push({ params: { file: prompt.source.license.file }, props: { bytes: prompt.source.license.bytes, contentType: "text/plain; charset=utf-8" } });
    }
    return files;
  });
};

export const GET: APIRoute = ({ props }) => new Response(new Uint8Array(props.bytes), {
  headers: { "Content-Type": props.contentType },
});
