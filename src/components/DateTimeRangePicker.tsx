import { useId, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import {
  CalendarOutlined,
  CloseCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  formatDate,
  parseDate,
  weekdays,
  type DateFormat,
  type WeekStart,
} from "../domain/date";
import "./DateTimeRangePicker.css";

/** Local date and time strings in YYYY-MM-DDTHH:mm format. Empty means unbounded. */
export type DateTimeRange = { from: string; to: string };

type Props = {
  value: DateTimeRange;
  onChange: (range: DateTimeRange) => void;
  defaultOpen?: boolean;
  timeZone?: string;
  dateFormat?: DateFormat;
  weekStartsOn?: WeekStart;
};

type Endpoint = keyof DateTimeRange;
type Field = "date" | "time";
type TimePart = "hour" | "minute";
type Draft = Record<
  Endpoint,
  { date: string; time: string; dateText?: string }
>;
type RangeField = { side: Endpoint; field: Field };
const endpointNames = { from: "开始", to: "结束" };
const sides = ["from", "to"] as const;
const dayShifts: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};
const firstDay = "0001-01-01";
const lastDay = "9999-12-31";
const pad = (n: number) => String(n).padStart(2, "0");
const fromIso = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date) => date.toISOString().split("T")[0]!;
const monthOf = (date: string) => date.slice(0, 7);
function localMinute(timeZone?: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts()
      .map(({ type, value }) => [type, value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function parseTime(input: string) {
  const text = input.trim();
  return !text || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : null;
}

function draftFrom(value: DateTimeRange): Draft {
  function fields(side: Endpoint) {
    const [date = "", time = ""] = value[side].split("T");
    return { date, time };
  }
  return { from: fields("from"), to: fields("to") };
}

function RangeEndpointValue({
  side,
  value,
  dateFormat,
}: {
  side: Endpoint;
  value: string;
  dateFormat: DateFormat;
}) {
  const [date = "", time = ""] = value.split("T");
  return (
    <span className="dtr-inline-endpoint" data-empty={!date || undefined}>
      <span className="dtr-inline-date">
        {formatDate(date, dateFormat) || `${endpointNames[side]}日期时间`}
      </span>{" "}
      <span className="dtr-inline-time">{time}</span>
    </span>
  );
}

type CalendarProps = {
  cursor: string;
  selected: string;
  other: string;
  today: string;
  dateFormat: DateFormat;
  weekStartsOn: WeekStart;
  onNavigate: (day: string) => void;
  onSelect: (day: string) => void;
};

function Calendar({
  cursor,
  selected,
  other,
  today,
  dateFormat,
  weekStartsOn,
  onNavigate,
  onSelect,
}: CalendarProps) {
  const grid = useRef<HTMLDivElement>(null);
  const focusDay = useRef(false);
  const month = monthOf(cursor);
  const first = fromIso(`${month}-01`);
  const label = `${first.getUTCFullYear()}年${first.getUTCMonth() + 1}月`;
  const leading = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const orderedWeekdays = [
    ...weekdays.slice(weekStartsOn),
    ...weekdays.slice(0, weekStartsOn),
  ];

  useLayoutEffect(() => {
    if (focusDay.current) {
      grid.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${cursor}"]`)
        ?.focus();
      focusDay.current = false;
    }
  }, [cursor]);

  function browse(step: number) {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + step);
    onNavigate(toIso(date));
  }

  function move(event: KeyboardEvent, day: string) {
    const shift = dayShifts[event.key];
    if (!shift) return;
    event.preventDefault();
    const date = fromIso(day);
    date.setUTCDate(date.getUTCDate() + shift);
    if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return;
    focusDay.current = true;
    onNavigate(toIso(date));
  }

  return (
    <>
      <div className="dtr-month">
        <button
          type="button"
          aria-label="上个月"
          disabled={month === monthOf(firstDay)}
          onClick={() => browse(-1)}
        >
          <LeftOutlined aria-hidden="true" />
        </button>
        <strong aria-live="polite">{label}</strong>
        <button
          type="button"
          aria-label="下个月"
          disabled={month === monthOf(lastDay)}
          onClick={() => browse(1)}
        >
          <RightOutlined aria-hidden="true" />
        </button>
      </div>
      <div ref={grid} role="grid" aria-label={label}>
        <div className="dtr-week" role="row">
          {orderedWeekdays.map((day) => (
            <span key={day} role="columnheader">
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div className="dtr-week" role="row" key={week}>
            {weekdays.map((weekday, index) => {
              const date = new Date(first);
              date.setUTCDate(1 - leading + week * 7 + index);
              const iso = toIso(date);
              const inMonth = monthOf(iso) === month;
              return (
                <div
                  key={weekday}
                  role="gridcell"
                  aria-selected={inMonth && iso === selected}
                >
                  {inMonth ? (
                    <button
                      type="button"
                      data-day={iso}
                      data-other={iso === other || undefined}
                      aria-label={`${formatDate(iso, dateFormat)} ${weekdays[date.getUTCDay()]}`}
                      aria-current={iso === today ? "date" : undefined}
                      tabIndex={iso === cursor ? 0 : -1}
                      onKeyDown={(event) => move(event, iso)}
                      onClick={() => onSelect(iso)}
                    >
                      {date.getUTCDate()}
                    </button>
                  ) : (
                    <span className="dtr-outside-day" aria-hidden="true">
                      {date.getUTCDate()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function TimeColumn({
  label,
  count,
  value,
  initialCursor,
  onSelect,
}: {
  label: string;
  count: number;
  value: number | undefined;
  initialCursor: number;
  onSelect: (value: number) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<number>();
  const current = focused ?? value ?? initialCursor;

  useLayoutEffect(() => {
    const node = list.current;
    const option = node?.querySelector<HTMLButtonElement>(
      `[data-time="${current}"]`,
    );
    if (!node || !option) return;
    node.scrollTop =
      option.offsetTop - (node.clientHeight - option.offsetHeight) / 2;
    if (focused !== undefined) option.focus({ preventScroll: true });
  }, [current, focused]);

  function move(event: KeyboardEvent, index: number) {
    const next = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: count - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const bounded = Math.max(0, Math.min(count - 1, next));
    if (bounded === current) return;
    setFocused(bounded);
  }

  return (
    <div className="dtr-time-column">
      <strong aria-hidden="true">{label}</strong>
      <div
        className="dtr-time-list"
        role="group"
        aria-label={label}
        ref={list}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(undefined);
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <button
            type="button"
            key={index}
            data-time={index}
            aria-pressed={value === index}
            tabIndex={current === index ? 0 : -1}
            onKeyDown={(event) => move(event, index)}
            onClick={() => {
              setFocused(undefined);
              onSelect(index);
            }}
          >
            {pad(index)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DateTimeRangePicker({
  value,
  onChange,
  defaultOpen = false,
  timeZone,
  dateFormat = "DD/MM/YYYY",
  weekStartsOn = 1,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState<Endpoint>("from");
  const [draft, setDraft] = useState(() => draftFrom(value));
  const [today, setToday] = useState(() => localMinute(timeZone).date);
  const [cursor, setCursor] = useState(
    () => value.from.slice(0, 10) || value.to.slice(0, 10) || today,
  );
  const [error, setError] = useState<RangeField & { message: string }>();
  const [timeParts, setTimeParts] = useState<Partial<Record<TimePart, number>>>(
    {},
  );
  const root = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<RangeField | "trigger">(undefined);
  const editedField = useRef<RangeField>(undefined);
  const panelId = useId();
  const errorId = `${panelId}-error`;
  const other = active === "from" ? "to" : "from";
  const date = draft[active].date;
  const time = parseTime(draft[active].time);
  const hour = time ? Number(time.slice(0, 2)) : undefined;
  const minute = time ? Number(time.slice(3)) : undefined;
  const choosingTime =
    timeParts.hour !== undefined || timeParts.minute !== undefined;
  const canChooseEnd = !!(draft.from.date && parseTime(draft.from.time));
  const canConfirm =
    !choosingTime &&
    sides.every((side) => draft[side].date && parseTime(draft[side].time));
  const hasValue = open
    ? choosingTime ||
      sides.some(
        (side) => draft[side].date || draft[side].dateText || draft[side].time,
      )
    : !!(value.from || value.to);

  useLayoutEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = undefined;
    if (!target) return;
    const selector =
      target === "trigger"
        ? ".dtr-trigger"
        : `[data-side="${target.side}"][data-field="${target.field}"]`;
    root.current
      ?.querySelector<HTMLElement>(selector)
      ?.focus({ preventScroll: target === "trigger" });
  });

  function close() {
    editedField.current = undefined;
    focusTarget.current = "trigger";
    setOpen(false);
  }

  function clear() {
    const empty = { from: "", to: "" };
    setDraft(draftFrom(empty));
    setTimeParts({});
    setActive("from");
    setError(undefined);
    onChange(empty);
    close();
  }

  function activate(side: Endpoint, fields = draft, day = today) {
    const alternate = side === "from" ? "to" : "from";
    setActive(side);
    setCursor(fields[side].date || fields[alternate].date || day);
    setTimeParts({});
  }

  function openPicker() {
    const fields = draftFrom(value);
    const day = localMinute(timeZone).date;
    setDraft(fields);
    setToday(day);
    activate("from", fields, day);
    setError(undefined);
    focusTarget.current = { side: "from", field: "date" };
    setOpen(true);
  }

  function editInput(target: RangeField, text: string) {
    const { side, field } = target;
    editedField.current = target;
    const parsedDate = field === "date" ? parseDate(text, dateFormat) : null;
    setDraft((current) => ({
      ...current,
      [side]: {
        ...current[side],
        ...(field === "date"
          ? {
              date: parsedDate ?? "",
              dateText: parsedDate === null ? text : undefined,
            }
          : { time: text }),
      },
    }));
    setError(undefined);
    if (field === "time") setTimeParts({});
  }

  function completeField(target: RangeField, text: string, moveFocus = true) {
    const { side, field } = target;
    editedField.current = undefined;
    const parsed =
      field === "date" ? parseDate(text, dateFormat) : parseTime(text);
    if (parsed === null) {
      if (moveFocus) focusTarget.current = target;
      setError({
        ...target,
        message:
          field === "date"
            ? `请输入有效日期：${dateFormat}`
            : "请输入有效时间：HH:mm",
      });
      return;
    }

    const fields = {
      ...draft,
      [side]: {
        ...draft[side],
        ...(field === "date"
          ? { date: parsed, dateText: undefined }
          : { time: parsed }),
      },
    };
    setDraft(fields);
    setError(undefined);
    if (field === "time") setTimeParts({});
    if (field === "date" && parsed) setCursor(parsed);
    if (!parsed) return;

    const next: DateTimeRange = { from: "", to: "" };
    for (const side of sides) {
      const day = fields[side].date;
      const minute = parseTime(fields[side].time);
      if (day && minute) next[side] = `${day}T${minute}`;
    }
    if (next.from && next.to) {
      if (next.from >= next.to) {
        if (moveFocus) focusTarget.current = target;
        setError({ ...target, message: "结束时间必须晚于开始时间。" });
      }
      return;
    }
    if (side === "from" && field === "time" && next.from) {
      activate("to", fields);
      focusTarget.current = { side: "to", field: "date" };
    } else if (field === "date" && moveFocus) {
      focusTarget.current = { side, field: "time" };
    }
  }

  function quickSelect(field: Field) {
    const now = localMinute(timeZone);
    setToday(now.date);
    completeField(
      { side: active, field },
      field === "date" ? formatDate(now.date, dateFormat) : now.time,
    );
  }

  function confirm() {
    if (!canConfirm) return;
    const next = {
      from: `${draft.from.date}T${parseTime(draft.from.time)}`,
      to: `${draft.to.date}T${parseTime(draft.to.time)}`,
    };
    if (next.from >= next.to) {
      const target = { side: "to", field: "time" } as const;
      activate("to");
      focusTarget.current = target;
      setError({ ...target, message: "结束时间必须晚于开始时间。" });
      return;
    }
    onChange(next);
    close();
  }

  function selectTime(part: TimePart, value: number) {
    const selected = { hour, minute, ...timeParts, [part]: value };
    if (selected.hour !== undefined && selected.minute !== undefined) {
      completeField(
        { side: active, field: "time" },
        `${pad(selected.hour)}:${pad(selected.minute)}`,
      );
    } else {
      setTimeParts(selected);
      setError(undefined);
    }
  }

  function fieldKey(
    event: KeyboardEvent<HTMLInputElement>,
    target: RangeField,
  ) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    completeField(target, event.currentTarget.value);
  }

  function blurField(target: RangeField, event: FocusEvent<HTMLInputElement>) {
    if (
      event.relatedTarget?.closest(
        ".dtr-toggle, .dtr-inline-clear, .dtr-confirm",
      )
    )
      return;
    const edited = editedField.current;
    if (edited?.side === target.side && edited.field === target.field)
      completeField(target, event.currentTarget.value, false);
  }

  function inlineField(side: Endpoint, field: Field) {
    const target = { side, field };
    const isDate = field === "date";
    const disabled =
      (side === "to" && !canChooseEnd) || (!isDate && !draft[side].date);
    const invalid = error?.side === side && error.field === field;
    let text = isDate
      ? (draft[side].dateText ?? formatDate(draft[side].date, dateFormat))
      : draft[side].time;
    if (!isDate && side === active && choosingTime) {
      const { hour, minute } = timeParts;
      text = `${hour === undefined ? "--" : pad(hour)}:${minute === undefined ? "--" : pad(minute)}`;
    }
    return (
      <input
        className={`dtr-inline-${field}`}
        data-side={side}
        data-field={field}
        aria-label={`${endpointNames[side]}${isDate ? "日期" : "时间"}`}
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={invalid || undefined}
        value={text}
        placeholder={isDate ? `${endpointNames[side]}日期时间` : "HH:mm"}
        title={isDate ? dateFormat : "HH:mm"}
        maxLength={isDate ? 10 : 5}
        autoComplete="off"
        disabled={disabled}
        onFocus={() => {
          if (side !== active) activate(side);
        }}
        onChange={(event) => editInput(target, event.target.value)}
        onBlur={(event) => blurField(target, event)}
        onKeyDown={(event) => fieldKey(event, target)}
      />
    );
  }

  return (
    <div
      className="dtr"
      ref={root}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
    >
      <div className="dtr-control" data-has-value={hasValue || undefined}>
        {open ? (
          <div className="dtr-selection" role="group" aria-label="所选范围">
            <div
              className="dtr-inline-endpoint"
              data-empty={
                (!draft.from.date && !draft.from.dateText) || undefined
              }
              data-active={active === "from" || undefined}
              role="group"
              aria-label="开始时间（含）"
            >
              {inlineField("from", "date")}
              {inlineField("from", "time")}
            </div>
            <span aria-hidden="true">→</span>
            <div
              className="dtr-inline-endpoint"
              data-empty={(!draft.to.date && !draft.to.dateText) || undefined}
              data-active={active === "to" || undefined}
              role="group"
              aria-label="结束时间（不含）"
            >
              {inlineField("to", "date")}
              {inlineField("to", "time")}
            </div>
            <button
              className="dtr-toggle dtr-toolbar-icon"
              type="button"
              aria-label="收起范围选择器"
              aria-expanded="true"
              aria-controls={panelId}
              onMouseDown={(event) => event.preventDefault()}
              onClick={close}
            >
              <CalendarOutlined aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            className="dtr-trigger"
            type="button"
            aria-expanded="false"
            onClick={openPicker}
          >
            <RangeEndpointValue
              side="from"
              value={value.from}
              dateFormat={dateFormat}
            />
            <span aria-hidden="true">→</span>
            <RangeEndpointValue
              side="to"
              value={value.to}
              dateFormat={dateFormat}
            />
            <span className="dtr-toolbar-icon" aria-hidden="true">
              <CalendarOutlined />
            </span>
          </button>
        )}
        {hasValue && (
          <button
            className="dtr-inline-clear"
            type="button"
            aria-label="清空时间范围"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
          >
            <CloseCircleFilled aria-hidden="true" />
          </button>
        )}
      </div>
      {open && (
        <div
          className="dtr-panel"
          id={panelId}
          role="group"
          aria-label="日期时间范围"
        >
          <div className="dtr-main">
            <div className="dtr-fields">
              <div className="dtr-date">
                <Calendar
                  cursor={cursor}
                  selected={date || ""}
                  other={draft[other].date || ""}
                  today={today}
                  dateFormat={dateFormat}
                  weekStartsOn={weekStartsOn}
                  onNavigate={setCursor}
                  onSelect={(day) =>
                    completeField(
                      { side: active, field: "date" },
                      formatDate(day, dateFormat),
                    )
                  }
                />
                <button
                  type="button"
                  className="dtr-quick"
                  onClick={() => quickSelect("date")}
                >
                  今天
                </button>
              </div>
              <fieldset className="dtr-time" disabled={!date}>
                <div className="dtr-time-columns" key={active}>
                  <TimeColumn
                    label="小时"
                    count={24}
                    value={choosingTime ? timeParts.hour : hour}
                    initialCursor={hour ?? 9}
                    onSelect={(value) => selectTime("hour", value)}
                  />
                  <TimeColumn
                    label="分钟"
                    count={60}
                    value={choosingTime ? timeParts.minute : minute}
                    initialCursor={minute ?? 0}
                    onSelect={(value) => selectTime("minute", value)}
                  />
                </div>
                <div className="dtr-time-actions">
                  <button
                    type="button"
                    className="dtr-quick"
                    onClick={() => quickSelect("time")}
                  >
                    此刻
                  </button>
                  <button
                    type="button"
                    className="dtr-confirm"
                    disabled={!canConfirm}
                    onClick={confirm}
                  >
                    确定
                  </button>
                </div>
              </fieldset>
            </div>
            {error && (
              <p id={errorId} className="dtr-error" role="alert">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
