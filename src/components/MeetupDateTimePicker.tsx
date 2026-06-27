import React, {useState} from 'react';
import {Modal, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * 약속 날짜·시간 선택기
 * - 날짜: 월 단위 캘린더 (오늘~+10일만 선택 가능, 범위 밖은 비활성)
 * - 시간: 오전/오후 + 시(1~12) + 분(5분 단위) 셀렉트박스
 *
 * value/onChange는 'YYYY-MM-DDTHH:mm' 형식 문자열을 주고받는다(날짜 미선택 시 '').
 */
type Props = {
  value: string;
  onChange: (v: string) => void;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const HOURS = Array.from({length: 12}, (_, i) => i + 1); // 1~12
const MINUTES = Array.from({length: 12}, (_, i) => i * 5); // 0,5,...,55

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function parseValue(v: string) {
  if (v && v.length >= 16) {
    const dateStr = v.slice(0, 10);
    const hh = parseInt(v.slice(11, 13), 10);
    const mm = parseInt(v.slice(14, 16), 10);
    const ampm: '오전' | '오후' = hh < 12 ? '오전' : '오후';
    let hour12 = hh % 12;
    if (hour12 === 0) hour12 = 12;
    const minute = (Math.round(mm / 5) * 5) % 60;
    return {dateStr, ampm, hour12, minute};
  }
  return {dateStr: '', ampm: '오전' as const, hour12: 7, minute: 0};
}

// ── 셀렉트박스 (탭하면 옵션 목록을 바텀시트로 표시) ──────────
function SelectBox({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: {label: string; value: number}[];
  onSelect: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
        style={{borderWidth: 1, borderColor: '#e5e7eb'}}>
        <Text className="text-sm text-gray-900">{value}</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          className="flex-1 justify-center px-10"
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            <View
              className="rounded-2xl bg-white py-2"
              style={{maxHeight: 280}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.map(opt => {
                  const selected = opt.label === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        onSelect(opt.value);
                        setOpen(false);
                      }}
                      className="px-5 py-3">
                      <Text
                        className="text-center text-base"
                        style={{
                          color: selected ? '#f97316' : '#374151',
                          fontWeight: selected ? '700' : '400',
                        }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function MeetupDateTimePicker({value, onChange}: Props) {
  const init = parseValue(value);

  const [dateStr, setDateStr] = useState(init.dateStr);
  const [ampm, setAmpm] = useState<'오전' | '오후'>(init.ampm);
  const [hour12, setHour12] = useState(init.hour12);
  const [minute, setMinute] = useState(init.minute);

  // 선택 가능 범위: 오늘 ~ +10일
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 10);
  const minStr = toDateStr(today);
  const maxStr = toDateStr(maxDate);

  const initialMonth = dateStr
    ? new Date(parseInt(dateStr.slice(0, 4), 10), parseInt(dateStr.slice(5, 7), 10) - 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const [viewY, setViewY] = useState(initialMonth.getFullYear());
  const [viewM, setViewM] = useState(initialMonth.getMonth()); // 0-based

  const emit = (next: {
    dateStr?: string;
    ampm?: '오전' | '오후';
    hour12?: number;
    minute?: number;
  }) => {
    const d = next.dateStr ?? dateStr;
    const ap = next.ampm ?? ampm;
    const h = next.hour12 ?? hour12;
    const m = next.minute ?? minute;
    if (!d) {
      onChange('');
      return;
    }
    let h24 = h % 12;
    if (ap === '오후') h24 += 12;
    onChange(`${d}T${pad2(h24)}:${pad2(m)}`);
  };

  // 캘린더 그리드 계산
  const firstWeekday = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({length: firstWeekday}, () => null),
    ...Array.from({length: daysInMonth}, (_, i) => i + 1),
  ];

  const prevDisabled = viewY < today.getFullYear() ||
    (viewY === today.getFullYear() && viewM <= today.getMonth());
  const nextDisabled = viewY > maxDate.getFullYear() ||
    (viewY === maxDate.getFullYear() && viewM >= maxDate.getMonth());

  const goPrev = () => {
    if (prevDisabled) return;
    if (viewM === 0) {
      setViewY(viewY - 1);
      setViewM(11);
    } else {
      setViewM(viewM - 1);
    }
  };
  const goNext = () => {
    if (nextDisabled) return;
    if (viewM === 11) {
      setViewY(viewY + 1);
      setViewM(0);
    } else {
      setViewM(viewM + 1);
    }
  };

  return (
    <View>
      {/* 캘린더 */}
      <View
        className="mb-3 rounded-xl bg-gray-50 p-3"
        style={{borderWidth: 1, borderColor: '#e5e7eb'}}>
        {/* 월 이동 헤더 */}
        <View className="mb-2 flex-row items-center justify-between px-1">
          <TouchableOpacity onPress={goPrev} disabled={prevDisabled} className="p-1">
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={prevDisabled ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-gray-900">
            {viewY}년 {viewM + 1}월
          </Text>
          <TouchableOpacity onPress={goNext} disabled={nextDisabled} className="p-1">
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={nextDisabled ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
        </View>

        {/* 요일 */}
        <View className="flex-row">
          {WEEKDAYS.map((w, i) => (
            <View key={w} style={{width: `${100 / 7}%`}} className="items-center py-1">
              <Text
                className="text-xs"
                style={{color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#9ca3af'}}>
                {w}
              </Text>
            </View>
          ))}
        </View>

        {/* 날짜 셀 */}
        <View className="flex-row flex-wrap">
          {cells.map((day, idx) => {
            if (day === null) {
              return <View key={`b${idx}`} style={{width: `${100 / 7}%`, height: 40}} />;
            }
            const ds = `${viewY}-${pad2(viewM + 1)}-${pad2(day)}`;
            const enabled = ds >= minStr && ds <= maxStr;
            const selected = ds === dateStr;
            return (
              <TouchableOpacity
                key={ds}
                disabled={!enabled}
                onPress={() => {
                  setDateStr(ds);
                  emit({dateStr: ds});
                }}
                style={{width: `${100 / 7}%`, height: 40}}
                className="items-center justify-center">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{backgroundColor: selected ? '#f97316' : 'transparent'}}>
                  <Text
                    className="text-sm"
                    style={{
                      color: selected ? '#fff' : enabled ? '#374151' : '#d1d5db',
                      fontWeight: selected ? '700' : '400',
                    }}>
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 시간: 오전/오후 + 시 + 분 */}
      <View className="flex-row items-center" style={{gap: 8}}>
        {/* 오전/오후 토글 */}
        <View
          className="flex-row rounded-xl bg-gray-50"
          style={{borderWidth: 1, borderColor: '#e5e7eb'}}>
          {(['오전', '오후'] as const).map(ap => {
            const active = ampm === ap;
            return (
              <TouchableOpacity
                key={ap}
                onPress={() => {
                  setAmpm(ap);
                  emit({ampm: ap});
                }}
                className="rounded-xl px-3 py-3"
                style={{backgroundColor: active ? '#f97316' : 'transparent'}}>
                <Text
                  className="text-sm"
                  style={{color: active ? '#fff' : '#6b7280', fontWeight: active ? '700' : '400'}}>
                  {ap}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 시 */}
        <View style={{flex: 1}}>
          <SelectBox
            value={`${hour12}시`}
            options={HOURS.map(h => ({label: `${h}시`, value: h}))}
            onSelect={h => {
              setHour12(h);
              emit({hour12: h});
            }}
          />
        </View>

        {/* 분 */}
        <View style={{flex: 1}}>
          <SelectBox
            value={`${pad2(minute)}분`}
            options={MINUTES.map(m => ({label: `${pad2(m)}분`, value: m}))}
            onSelect={m => {
              setMinute(m);
              emit({minute: m});
            }}
          />
        </View>
      </View>
    </View>
  );
}
