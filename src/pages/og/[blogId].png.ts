import { getBlogDetail, getBlogs } from "../../library/microcms";
import type { APIContext } from "astro";
import { getOgImage } from "../../components/OgImage/OgImage";

export async function getStaticPaths() {
  const response = await getBlogs({ fields: ["id"] });
  return response.contents.map((content: any) => ({
    params: {
      blogId: content.id,
    },
  }));
}

export async function GET({ params }: APIContext) {
  if (!params.blogId) {
    return new Response(null, { status: 404 });
  }
  const blog = await getBlogDetail(params.blogId as string);
  return new Response(await getOgImage(blog));
}
