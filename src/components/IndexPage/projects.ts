import lunchMapsImage from "../../../public/img/lunch_maps.jpg";
import WeatherWear from "../../../public/img/whether_wear.jpg";
export interface ProjectDetail {
  title: string;
  content: string;
}

export interface Project {
  name: string;
  image: string;
  alt: string;
  width: number;
  height: number;
  link: string;
  description: string;
  details: ProjectDetail[];
  github: string;
  mockup: string;
}
const projects: Project[] = [
  {
    name: "Lunch Maps",
    image: lunchMapsImage.src,
    alt: "Lunch Maps",
    width: 293,
    height: 271,
    link: "https://main.dkpyfpx5izj45.amplifyapp.com/",
    description:
      "エリア検索や現在地の場所周辺でランチできるお店をピックアップしてくれるアプリです。<br />500m〜1km範囲内で、GoogleMapの口コミ情報を元に高評価または低価格で提供しているお店はマップ上で一目でわかるようにしています。<br />またログイン（Googleアカウント認証）することで、お店をお気に入り登録可能です。（お気に入りしたお店はマップ上でお気に入り専用のピンアイコンされます。）<br />※こちらはReact/Next.jsの学習も兼ねて自主制作したWebアプリケーションです。",
    details: [
      {
        title: "言語・フレームワークなど",
        content:
          "Next.js / React Hooks / グローバルステート(useContext) / TypeScript / Emotion",
      },
      { title: "IDE", content: "VSCode" },
      {
        title: "API",
        content:
          "GoogleMapsPlatform（Maps JavaScript API / Places API / Directions API / Geocoding API）/ GeoLocation API",
      },
      { title: "データベース", content: "FireStore" },
      { title: "ユーザー認証", content: "Firebase Authentication" },
      { title: "ホスティング", content: "AWS Amplify" },
    ],
    github: "https://github.com/imoto-rec-git/lunchmaps",
    mockup:
      "https://www.figma.com/file/0ssqcCEBjw2hYuoyLqjmm4/LunchMaps?node-id=0%3A1&amp;t=OqxH4D8zrHqcp9dI-1",
  },
  {
    name: "Weather Wear",
    image: WeatherWear.src,
    alt: "Weather Wear",
    width: 293,
    height: 271,
    link: "https://main.d33hf0l3u2s078.amplifyapp.com/",
    description:
      "今日の天気から服装を提示するアプリです。<br />※こちらはReact/Next.jsの学習も兼ねて自主制作したWebアプリケーションです。",
    details: [
      {
        title: "言語・フレームワークなど",
        content: "Next.js / React Hooks / TypeScript / Emotion",
      },
      { title: "IDE", content: "VSCode" },
      { title: "API", content: "Weather Forecast API / GeoLocation API" },
      { title: "ホスティング", content: "AWS Amplify" },
    ],
    github: "https://github.com/imoto-rec-git/weather_wear",
    mockup:
      "https://www.figma.com/file/3375ruikf5EoZy2IvEmC6s/WeatherWear?node-id=0%3A1&t=74Drokcv74rNVHmg-1",
  },
];
