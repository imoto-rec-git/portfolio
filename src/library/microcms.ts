//SDK利用準備
import { createCanvas } from "canvas";
import fsExtra from "fs-extra/esm";
import type { MicroCMSQueries } from "microcms-js-sdk";
import { createClient } from "microcms-js-sdk";
import sharp from "sharp";
import path from "path";

const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

//型定義
export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
};
export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
};

//APIの呼び出し
export const getBlogs = async (queries?: MicroCMSQueries) => {
  return await client.get<BlogResponse>({ endpoint: "blogs", queries });
};
export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Blog>({
    endpoint: "blogs",
    contentId,
    queries,
  });
};

// サムネイル生成関数の型定義
type GenerateThumbnailParams = {
  title: string;
  outputFilePath: string;
};

// 改行位置等が気になったりしたので、英単語と日本語を考慮して分割する関数
const splitTextByWidth = (
  text: string,
  maxWidth: number,
  font: string
): string[] => {
  const canvas = createCanvas(1, 1); // 仮のキャンバス作成
  const context = canvas.getContext("2d");
  context.font = font; // フォントの設定

  const lines: string[] = [];
  let currentLine = "";

  // 正規表現で単語と日本語文字を分割
  const tokens = text.match(/[\u3040-\u30FF\u4E00-\u9FAF]|[a-zA-Z]+|./g) || [];

  // 分割された各トークンを処理
  for (const token of tokens) {
    // 現在の行にトークンを追加した場合の仮の行を作成
    const testLine = currentLine ? `${currentLine}${token}` : token;
    // 仮の行の幅を計測
    const testLineWidth = context.measureText(testLine).width;

    // 仮の行が最大幅を超える場合
    if (testLineWidth > maxWidth) {
      // 現在の行が空なら、トークンをそのまま行として追加
      if (currentLine === "") {
        lines.push(token);
        currentLine = ""; // 次の行の処理に備えて初期化
      } else {
        // 現在の行を追加し、新しい行を開始
        lines.push(currentLine);
        currentLine = token;
      }
    } else {
      // 仮の行の幅が収まる場合、現在の行にトークンを追加
      currentLine = testLine;
    }
  }

  // 最後の行が空でなければ追加
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

// サムネイルを生成する関数
async function generateThumbnail({
  title,
  outputFilePath,
}: GenerateThumbnailParams): Promise<void> {
  const templatePath = "./public/img/baseArticleImage.png"; // 背景画像のパス

  try {
    // 出力先のディレクトリがなかった場合は作成する
    const outputDir = path.dirname(outputFilePath);
    await fsExtra.ensureDir(outputDir);

    // テキストが640pxに収まるように分割
    const font = "43px Noto Sans JP"; // 使用するフォントとサイズ（幅計算のため）
    const lines = splitTextByWidth(title, 640, font); // 分割された行

    // SVGでテキストを作成
    const textSvg = `
    <svg width="800" height="495" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title {
          font-size: 43px;
          font-family: Noto Sans JP;
          font-weight: bold;
          fill: black;
        }
      </style>
      <rect width="800" height="495" fill="transparent" />
      ${(() => {
        const lineHeight = 60; // 行間
        const totalTextHeight = lines.length * lineHeight; // 全テキストの高さ
        const startY = (460 - totalTextHeight) / 2 + lineHeight; // SVG全体の中央に揃える
        return lines
          .map(
            (line, index) =>
              `<text x="60" y="${startY + index * lineHeight}" class="title">${line}</text>`
          )
          .join("\n");
      })()}
    </svg>
    `;
    const textBuffer = Buffer.from(textSvg); // SVGをバッファとして保持

    // 背景画像にSVGを合成
    await sharp(templatePath)
      .composite([{ input: textBuffer, blend: "over" }])
      .toFile(outputFilePath);

    console.log(`サムネイル生成成功: ${outputFilePath}`);
  } catch (error) {
    console.error("サムネイル生成中にエラー発生:", error);
  }
}

// サムネイルを自動で生成する関数
async function generateBlogThumbnails() {
  try {
    // microCMSクライアントの作成
    const client = createClient({
      serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: import.meta.env.MICROCMS_API_KEY,
    });

    // ブログ記事を取得
    const blogs = await client.get({
      endpoint: "blogs", // エンドポイント（例なので変更してください）
      queries: {
        limit: 100, // 取得する記事数（必要に応じて調整）
      },
    });

    // サムネイル保存先ディレクトリ（public/にしていますが、src/でもOK）
    const thumbnailDir = "./public/img/article";
    await fsExtra.ensureDir(thumbnailDir);

    // 各記事のサムネイルを生成
    for (const blog of blogs.contents) {
      // サムネイルのファイル名を記事IDから生成
      const thumbnailPath = path.join(thumbnailDir, `${blog.id}.webp`);

      // すでにサムネイルが存在する場合はスキップ（必要に応じてコメントアウト）
      // if (await fsExtra.pathExists(thumbnailPath)) {
      //   console.log(`サムネイル already exists: ${blog.id}`);
      //   continue;
      // }

      // サムネイル生成
      await generateThumbnail({
        title: blog.title,
        outputFilePath: thumbnailPath,
      });

      console.log(`サムネイル自動生成完了: ${blog.id}`);
    }
  } catch (error) {
    console.error("サムネイル自動生成中にエラー発生:", error);
  }
}

// サムネイル生成の実行
(async () => {
  try {
    await generateBlogThumbnails();
  } catch (error) {
    console.error("エラー:", error);
  }
})();

// ビルド時や定期的に実行する
export async function generateAllThumbnails() {
  await generateBlogThumbnails();
}
