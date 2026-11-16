import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";
const entries = [
  {
    to: "/components/button",
    title: "组件库",
    en: "Components",
    description: "探索组件、交互与使用代码",
    preview: "components",
  },
  {
    to: "/examples/overview",
    title: "页面样例",
    en: "Workspace",
    description: "在完整后台中体验组件的组合",
    preview: "workspace",
  },
];
export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <Brand />
        <span className="home-edition">
          VOL. 01 <i /> REACT + ANT DESIGN
        </span>
      </header>
      <main className="home-main">
        <div className="home-intro">
          <span className="eyebrow">DALTON STYLES</span>
          <h1>组件与页面</h1>
          <p>从一个组件，到完整的工作界面。</p>
        </div>
        <div className="entry-grid">
          {entries.map((entry, i) => (
            <Link className="entry" key={entry.to} to={entry.to}>
              <div className="entry-image">
                <img
                  className="entry-thumbnail"
                  src={`${import.meta.env.BASE_URL}previews/${entry.preview}.png`}
                  alt={`${entry.title}页面预览`}
                  width={1280}
                  height={850}
                />
                <span className="entry-open">
                  <ArrowRightOutlined aria-hidden="true" />
                </span>
              </div>
              <div className="entry-caption">
                <div>
                  <span className="entry-index">0{i + 1}</span>
                  <h2>
                    {entry.title}
                    <small>{entry.en}</small>
                  </h2>
                </div>
                <p>{entry.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <footer className="home-footer">
        <span>Dalton Styles</span>
        <span>陶土橙 · 森林绿 · 暖白</span>
        <span>DESIGNED TO WORK TOGETHER</span>
      </footer>
    </div>
  );
}
