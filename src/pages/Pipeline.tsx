import { useState } from "react";
import { Alert, App, Avatar, Badge, Button, Empty, Select, Tag } from "antd";
import { useWorkspace } from "../domain/Store";
import { money, owners, stages } from "../domain/model";
export default function Pipeline() {
  const { data, setData } = useWorkspace();
  const { message } = App.useApp();
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const move = (id: string, stage: number) => {
    setData((d) => ({
      ...d,
      deals: d.deals.map((x) => (x.id === id ? { ...x, stage } : x)),
    }));
    setDragged(null);
    setOver(null);
    message.success(`已移动到「${stages[stage]}」`);
  };
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">OPPORTUNITIES IN MOTION</span>
          <h1>商机看板</h1>
          <p>从初次接洽，到达成合作。</p>
        </div>
        <Tag color="success">{data.deals.length} 个演示商机</Tag>
      </div>
      <Alert
        className="pipeline-tip"
        type="info"
        title="拖动卡片调整阶段，也可以使用卡片下方的阶段选择器。"
        closable
      />
      <div className="pipeline-board">
        {stages.map((stage, i) => {
          const deals = data.deals.filter((d) => d.stage === i);
          return (
            <section
              key={stage}
              className={`pipeline-column ${over === i ? "drag-over" : ""}`}
              aria-label={stage}
              onDragOver={(e) => {
                if (dragged) {
                  e.preventDefault();
                  setOver(i);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = dragged ?? e.dataTransfer.getData("text/plain");
                if (data.deals.some((d) => d.id === id)) move(id, i);
              }}
            >
              <header>
                <div>
                  <span
                    style={{
                      background: ["#a39060", "#9580a3", "#b66a4d", "#3b694b"][
                        i
                      ],
                    }}
                  />
                  {stage}
                  <small>{deals.length}</small>
                </div>
                <p>{money(deals.reduce((sum, d) => sum + d.amount, 0))}</p>
              </header>
              <div className="pipeline-cards">
                {deals.map((d) => (
                  <article
                    key={d.id}
                    className={`deal-card ${dragged === d.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", d.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragged(d.id);
                    }}
                    onDragEnd={() => {
                      setDragged(null);
                      setOver(null);
                    }}
                    aria-label={d.name}
                  >
                    <Tag
                      color={
                        i === 3 ? "success" : i === 2 ? "warning" : "default"
                      }
                    >
                      {i === 3 ? "已达成合作" : "进行中"}
                    </Tag>
                    <h2>{d.name}</h2>
                    <p>{d.company}</p>
                    <strong>{money(d.amount)}</strong>
                    <footer>
                      <Avatar
                        size={28}
                        style={{
                          background: "#e9efdf",
                          color: "#496544",
                          fontSize: 10,
                        }}
                      >
                        {owners.find((o) => o.id === d.owner)?.initials}
                      </Avatar>
                      <Select
                        aria-label={`${d.name}的阶段`}
                        size="small"
                        value={d.stage}
                        onChange={(stage) => move(d.id, stage)}
                        options={stages.map((label, value) => ({
                          label,
                          value,
                        }))}
                      />
                    </footer>
                  </article>
                ))}
                {!deals.length && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="拖动商机到这里"
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
