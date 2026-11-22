import { useState } from "react";
import {
  App,
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Mentions,
  Radio,
  Rate,
  Select,
  Slider,
  Space,
  Switch,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
} from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { DefaultOptionType } from "antd/es/select";
import { cities, options, Output, treeData, type DemoProps } from "./shared";
import { usePreferences } from "../../app/Preferences";
import {
  DateTimeRangePicker,
  type DateTimeRange,
} from "../../components/DateTimeRangePicker";

function DateTimeRangeDemo() {
  const [range, setRange] = useState<DateTimeRange>({ from: "", to: "" });
  const { preferences } = usePreferences();
  return (
    <DateTimeRangePicker
      value={range}
      onChange={setRange}
      defaultOpen
      dateFormat={preferences.dateFormat}
      weekStartsOn={preferences.weekStartsOn}
    />
  );
}

export default function InputDemos({ id, variant: v }: DemoProps) {
  const { preset, appearance } = usePreferences();
  const { message } = App.useApp();
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [number, setNumber] = useState(36);
  const [color, setColor] = useState<string>(preset.primary);
  const [checked, setChecked] = useState<string[]>(["Jakarta"]);
  const [form] = Form.useForm();
  const fieldStyle = { width: "100%", maxWidth: 340 };
  switch (id) {
    case "input":
      return (
        <Space orientation="vertical" style={fieldStyle}>
          <Input
            placeholder="请输入客户名称"
            aria-label="客户名称"
            allowClear={v === 0}
            prefix={v === 1 ? <UserOutlined aria-hidden="true" /> : undefined}
            status={v === 1 ? "error" : undefined}
            showCount={v === 1}
            maxLength={v === 1 ? 30 : undefined}
          />
          {v === 1 ? (
            <>
              <Input
                placeholder="客户邮箱"
                aria-label="客户邮箱"
                suffix="@example.com"
              />
              <span style={{ color: "var(--ui-error)" }}>
                请输入有效的客户名称
              </span>
            </>
          ) : (
            <Input disabled placeholder="不可编辑" />
          )}
        </Space>
      );
    case "search":
      return (
        <>
          <Input.Search
            style={fieldStyle}
            placeholder="搜索城市名称"
            aria-label="搜索城市名称"
            allowClear
            enterButton={
              v === 1 ? "搜索" : <SearchOutlined aria-hidden="true" />
            }
            onChange={
              v === 0
                ? (e) => {
                    if (!(e.nativeEvent as InputEvent).isComposing)
                      setText(e.target.value);
                  }
                : undefined
            }
            onCompositionEnd={
              v === 0 ? (e) => setText(e.currentTarget.value) : undefined
            }
            onSearch={setText}
          />
          <Output>
            {cities
              .filter((c) => c.toLowerCase().includes(text.toLowerCase()))
              .join(" · ") || "没有找到匹配的城市"}
          </Output>
        </>
      );
    case "textarea":
      return (
        <Input.TextArea
          aria-label="客户备注"
          placeholder="填写客户备注"
          autoSize={v === 0 ? { minRows: 2, maxRows: 5 } : undefined}
          rows={3}
          showCount={v === 1}
          maxLength={v === 1 ? 100 : undefined}
        />
      );
    case "input-number":
      return (
        <Space wrap>
          <InputNumber
            aria-label="数值"
            min={0}
            max={v === 0 ? 100 : 10000}
            defaultValue={v === 0 ? 1 : 1.25}
            step={v === 0 ? 1 : 0.25}
            precision={v === 0 ? 0 : 2}
          />
          {v === 1 && (
            <InputNumber aria-label="大步长" defaultValue={100} step={100} />
          )}
        </Space>
      );
    case "select":
      return (
        <Space orientation="vertical" style={fieldStyle}>
          <Select<string, DefaultOptionType>
            aria-label="选择城市"
            style={{ width: "100%" }}
            placeholder="请选择城市"
            allowClear
            showSearch={v === 1}
            options={
              v === 1
                ? [
                    {
                      label: "Java",
                      options: [
                        ...options.slice(0, 3),
                        { value: "closed", label: "暂未开放", disabled: true },
                      ],
                    },
                    { label: "其他地区", options: options.slice(3) },
                  ]
                : options
            }
          />
          {v === 0 && (
            <Select
              style={{ width: "100%" }}
              aria-label="禁用选择器"
              disabled
              defaultValue="Jakarta"
              options={options}
            />
          )}
        </Space>
      );
    case "multi-select":
      return (
        <>
          <Select
            aria-label="选择多个城市"
            style={fieldStyle}
            mode="multiple"
            placeholder="请选择城市"
            defaultValue={v === 1 ? ["Jakarta", "Bandung"] : undefined}
            options={options}
            maxCount={v === 0 ? 3 : undefined}
            allowClear
            onChange={setChosen}
          />
          <Output>
            {v === 0 ? "最多选择 3 项。" : ""}
            {chosen.length
              ? `当前选择：${chosen.join("、")}`
              : "选择城市后查看结果"}
          </Output>
        </>
      );
    case "autocomplete":
      return (
        <AutoComplete
          aria-label={v === 0 ? "城市建议" : "邮箱补全"}
          style={fieldStyle}
          value={text}
          onChange={setText}
          placeholder={v === 0 ? "输入城市名称" : "输入邮箱前缀"}
          options={
            v === 0
              ? options.filter((o) =>
                  o.value.toLowerCase().includes(text.toLowerCase()),
                )
              : text && !text.includes("@")
                ? ["gmail.com", "outlook.com", "example.com"].map((x) => ({
                    value: `${text}@${x}`,
                  }))
                : []
          }
        />
      );
    case "cascader":
      return (
        <Cascader
          aria-label="选择地区"
          style={fieldStyle}
          defaultValue={v === 1 ? ["id", "java", "Jakarta"] : undefined}
          options={[
            {
              value: "id",
              label: "Indonesia",
              children: [
                {
                  value: "java",
                  label: "Java",
                  children: cities
                    .slice(0, 3)
                    .map((x) => ({ value: x, label: x })),
                },
                {
                  value: "sumatra",
                  label: "Sumatra",
                  children: [{ value: "Medan", label: "Medan" }],
                },
              ],
            },
          ]}
          placeholder="请选择地区"
        />
      );
    case "tree-select":
      return (
        <TreeSelect
          aria-label="树形地区选择"
          style={fieldStyle}
          treeData={treeData}
          treeCheckable={v === 0}
          treeDefaultExpandAll
          allowClear
          placeholder="请选择地区"
        />
      );
    case "checkbox":
      return v === 0 ? (
        <Space wrap>
          <Checkbox>未选择</Checkbox>
          <Checkbox defaultChecked>已选择</Checkbox>
          <Checkbox disabled>禁用</Checkbox>
        </Space>
      ) : (
        <>
          <Checkbox
            checked={checked.length === cities.length}
            indeterminate={checked.length > 0 && checked.length < cities.length}
            onChange={(e) => setChecked(e.target.checked ? cities : [])}
          >
            全选城市
          </Checkbox>
          <div style={{ marginTop: 16 }}>
            <Checkbox.Group
              options={cities}
              value={checked}
              onChange={(values) => setChecked(values as string[])}
            />
          </div>
          <Output>已选 {checked.length} 个城市</Output>
        </>
      );
    case "radio":
      return (
        <Radio.Group
          defaultValue="standard"
          options={[
            { value: "standard", label: "标准" },
            { value: "compact", label: "紧凑" },
            { value: "disabled", label: "禁用", disabled: v === 1 },
          ]}
          style={
            v === 1
              ? { display: "flex", flexDirection: "column", gap: 12 }
              : undefined
          }
        />
      );
    case "switch":
      return (
        <Space>
          <Switch
            aria-label="消息通知"
            checked={enabled}
            onChange={setEnabled}
            disabled={v === 1}
          />
          <span>{enabled ? "通知已开启" : "通知已关闭"}</span>
        </Space>
      );
    case "slider":
      return (
        <div style={fieldStyle}>
          {v === 1 ? (
            <Slider range defaultValue={[20, 60]} />
          ) : (
            <Slider
              defaultValue={30}
              marks={{ 0: "0", 25: "25", 50: "50", 100: "100" }}
            />
          )}
          {v === 1 && <Slider disabled defaultValue={40} />}
        </div>
      );
    case "rate":
      return (
        <>
          <Rate
            allowHalf={v === 1}
            value={number > 5 ? 3 : number}
            onChange={setNumber}
          />
          <Output>
            {["", "很差", "一般", "不错", "满意", "非常满意"][
              number > 5 ? 3 : Math.ceil(number)
            ] || "尚未评分"}
          </Output>
        </>
      );
    case "date-picker":
      if (v >= 3)
        return (
          <DatePicker.RangePicker
            style={{ maxWidth: "100%" }}
            presets={
              v === 4
                ? [
                    {
                      label: "最近 7 天",
                      value: [dayjs().subtract(6, "day"), dayjs()],
                    },
                    {
                      label: "本月",
                      value: [dayjs().startOf("month"), dayjs().endOf("month")],
                    },
                  ]
                : undefined
            }
          />
        );
      return (
        <Space wrap>
          <DatePicker
            aria-label={v === 1 ? "选择月份" : "选择日期"}
            picker={v === 1 ? "month" : "date"}
            disabledDate={
              v === 1 ? (d) => d.isBefore(dayjs().startOf("month")) : undefined
            }
          />
          {v === 0 && (
            <DatePicker
              aria-label="默认日期"
              defaultValue={dayjs("2026-11-16")}
            />
          )}
          <DatePicker aria-label="禁用日期" disabled />
        </Space>
      );
    case "date-time-picker":
      return <DateTimeRangeDemo />;
    case "time-picker":
      return (
        <Space wrap>
          <TimePicker
            aria-label="选择时间"
            format="HH:mm"
            minuteStep={v === 1 ? 15 : 1}
            defaultValue={v === 0 ? dayjs("2026-11-16T09:00:00") : undefined}
          />
          {v === 1 ? (
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} />
          ) : (
            <TimePicker disabled />
          )}
        </Space>
      );
    case "color-picker":
      return (
        <Space>
          <ColorPicker
            value={color}
            onChange={(c) => setColor(c.toHexString())}
            showText
            presets={
              v === 0
                ? [
                    {
                      label: "Dalton Styles",
                      colors: [
                        preset.primary,
                        preset.navigation,
                        appearance.layout,
                        appearance.success,
                        appearance.warning,
                      ],
                    },
                  ]
                : undefined
            }
          />
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: color,
              border: "1px solid var(--ui-border)",
            }}
          />
        </Space>
      );
    case "upload":
      return (
        <>
          <Upload
            maxCount={v === 0 ? 1 : 5}
            multiple={v === 1}
            accept={v === 1 ? "image/*" : ".csv,.pdf,.txt"}
            listType={v === 1 ? "picture" : "text"}
            beforeUpload={(file) => {
              const valid =
                file.size <= 5 * 1024 * 1024 &&
                (v === 1
                  ? file.type.startsWith("image/")
                  : /\.(csv|pdf|txt)$/i.test(file.name));
              if (!valid) {
                message.error("请选择符合类型且不超过 5 MB 的文件");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
          >
            <Button icon={<UploadOutlined aria-hidden="true" />}>
              选择{v === 1 ? "图片" : "文件"}
            </Button>
          </Upload>
          <Output>
            仅在本地预览，单文件不超过 5 MB。
            {v === 0 ? "支持 CSV、PDF、TXT。" : "最多 5 张图片。"}
          </Output>
        </>
      );
    case "transfer":
      return (
        <div style={{ overflowX: "auto" }}>
          <Transfer
            dataSource={(v === 0
              ? cities
              : ["Maya", "Rizky", "Sarah", "Dalton"]
            ).map((x) => ({ key: x, title: x }))}
            titles={["待分配", "已分配"]}
            targetKeys={chosen}
            onChange={(keys) => setChosen(keys as string[])}
            render={(item) => item.title}
            showSearch
            listStyle={{ width: 180, height: 220 }}
          />
        </div>
      );
    case "form":
      return (
        <Form
          name={`demo-${id}-${v}`}
          form={form}
          layout={v === 0 ? "vertical" : "horizontal"}
          labelCol={v === 1 ? { span: 5 } : undefined}
          wrapperCol={v === 1 ? { span: 19 } : undefined}
          style={{ maxWidth: 480 }}
          onFinish={() => {
            message.success("已保存演示表单");
            form.resetFields();
          }}
        >
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: "请输入客户名称" }]}
          >
            <Input placeholder="例如 Sagara Retail" />
          </Form.Item>
          <Form.Item
            name="email"
            label="联系邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item name="city" label="所在城市">
            <Select options={options} placeholder="请选择" />
          </Form.Item>
          <Form.Item wrapperCol={v === 1 ? { offset: 5, span: 19 } : undefined}>
            <Space>
              <Button onClick={() => form.resetFields()}>重置</Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      );
    case "input-tag":
      return (
        <Select
          aria-label="添加标签"
          mode="tags"
          style={fieldStyle}
          placeholder="输入后按回车添加"
          maxCount={v === 1 ? 5 : undefined}
          defaultValue={["重点客户"]}
          options={[{ value: "重点客户" }, { value: "待跟进" }]}
        />
      );
    case "mentions":
      return (
        <Mentions
          aria-label="提及团队成员"
          style={fieldStyle}
          placeholder="输入 @ 提及成员"
          options={["Maya", "Rizky", "Sarah"].map((value) => ({
            value,
            label: value,
          }))}
          defaultValue={v === 1 ? "请 @Maya 跟进此客户" : ""}
        />
      );
    case "otp":
      return (
        <>
          <Input.OTP
            length={v === 0 ? 6 : 4}
            mask={v === 1 ? "●" : undefined}
            onChange={setText}
          />
          <Output>
            {text
              ? `已输入 ${text.length} 位，演示不进行真实验证`
              : "输入验证码，完成后显示结果"}
          </Output>
        </>
      );
    default:
      throw new Error(`Unknown input demo: ${id}`);
  }
}
