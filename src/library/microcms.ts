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

// OGP画像を生成する関数
async function generateOGPImage({
  title,
  outputFilePath,
}: GenerateThumbnailParams): Promise<void> {
  const ogpTemplatePath = "./public/img/baseOGPImage.png"; // OGP用背景画像パス

  try {
    const outputDir = path.dirname(outputFilePath);
    await fsExtra.ensureDir(outputDir);

    // テキスト分割（OGP用の幅指定）
    const font = "60px Noto Sans JP"; // OGP用フォントサイズ
    const lines = splitTextByWidth(title, 700, font);

    // SVGでOGP用のテキストを作成
    const ogpSvg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title {
          font-size: 60px;
          font-family: Noto Sans JP;
          font-weight: bold;
          fill: black;
        }
      </style>
      <rect width="1200" height="630" fill="transparent" />
      ${(() => {
        const lineHeight = 80;
        const totalTextHeight = lines.length * lineHeight;
        const startY = (600 - totalTextHeight) / 2 + lineHeight;
        return lines
          .map(
            (line, index) =>
              `<text x="100" y="${startY + index * lineHeight}" class="title">${line}</text>`
          )
          .join("\n");
      })()}
    </svg>
    `;
    const textBuffer = Buffer.from(ogpSvg);

    // 背景画像にSVGを合成
    await sharp(ogpTemplatePath)
      .composite([{ input: textBuffer, blend: "over" }])
      .toFile(outputFilePath);

    console.log(`OGP画像生成成功: ${outputFilePath}`);
  } catch (error) {
    console.error("OGP画像生成中にエラー発生:", error);
  }
}

// ブログ記事のOGP画像も生成する処理を追加
async function generateBlogThumbnails() {
  try {
    const blogs = await client.get({
      endpoint: "blogs",
      queries: { limit: 100 },
    });

    const thumbnailDir = "./public/img/article";
    const ogpDir = "./public/img/ogp";
    await fsExtra.ensureDir(thumbnailDir);
    await fsExtra.ensureDir(ogpDir);

    for (const blog of blogs.contents) {
      const thumbnailPath = path.join(thumbnailDir, `${blog.id}.webp`);
      const ogpPath = path.join(ogpDir, `${blog.id}.webp`);

      // サムネイル生成
      await generateThumbnail({
        title: blog.title,
        outputFilePath: thumbnailPath,
      });

      // OGP画像生成
      await generateOGPImage({
        title: blog.title,
        outputFilePath: ogpPath,
      });

      console.log(`ブログID: ${blog.id} の画像生成完了`);
    }
  } catch (error) {
    console.error("画像生成中にエラー発生:", error);
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
